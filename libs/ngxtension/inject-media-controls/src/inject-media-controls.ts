import { DOCUMENT } from '@angular/common';
import {
	type ElementRef,
	type Injector,
	type Signal,
	effect,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { fromEvent, merge } from 'rxjs';

// Ported from https://vueuse.org/core/useMediaControls/

/**
 * Many of the jsdoc definitions here are modified version of the
 * documentation from MDN(https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
 */

export interface MediaSource {
	/**
	 * The source url for the media
	 */
	src: string;

	/**
	 * The media codec type
	 */
	type?: string;

	/**
	 * Specifies the media query for the resource's intended media.
	 */
	media?: string;
}

export interface MediaTextTrackSource {
	/**
	 * Indicates that the track should be enabled unless the user's preferences indicate
	 * that another track is more appropriate
	 */
	default?: boolean;

	/**
	 * How the text track is meant to be used. If omitted the default kind is subtitles.
	 */
	kind: TextTrackKind;

	/**
	 * A user-readable title of the text track which is used by the browser
	 * when listing available text tracks.
	 */
	label: string;

	/**
	 * Address of the track (.vtt file). Must be a valid URL. This attribute
	 * must be specified and its URL value must have the same origin as the document
	 */
	src: string;

	/**
	 * Language of the track text data. It must be a valid BCP 47 language tag.
	 * If the kind attribute is set to subtitles, then srclang must be defined.
	 */
	srcLang: string;
}

export interface InjectMediaControlsOptions {
	/**
	 * The source for the media, may either be a string, a `MediaSource` object, or a list
	 * of `MediaSource` objects.
	 */
	src?:
		| string
		| MediaSource
		| MediaSource[]
		| Signal<string | MediaSource | MediaSource[]>;

	/**
	 * A list of text tracks for the media
	 */
	tracks?: MediaTextTrackSource[] | Signal<MediaTextTrackSource[]>;

	/**
	 * Custom injector
	 */
	injector?: Injector;

	/**
	 * Custom window object
	 */
	window?: Window;
}

export interface MediaTextTrack {
	/**
	 * The index of the text track
	 */
	id: number;

	/**
	 * The text track label
	 */
	label: string;

	/**
	 * Language of the track text data. It must be a valid BCP 47 language tag.
	 * If the kind attribute is set to subtitles, then srclang must be defined.
	 */
	language: string;

	/**
	 * Specifies the display mode of the text track, either `disabled`,
	 * `hidden`, or `showing`
	 */
	mode: TextTrackMode;

	/**
	 * How the text track is meant to be used. If omitted the default kind is subtitles.
	 */
	kind: TextTrackKind;

	/**
	 * Indicates the track's in-band metadata track dispatch type.
	 */
	inBandMetadataTrackDispatchType: string;

	/**
	 * A list of text track cues
	 */
	cues: TextTrackCueList | null;

	/**
	 * A list of active text track cues
	 */
	activeCues: TextTrackCueList | null;
}

export interface MediaControlsState {
	/**
	 * The current playback time in seconds
	 */
	currentTime: Signal<number>;

	/**
	 * The total duration of the media in seconds
	 */
	duration: Signal<number>;

	/**
	 * Whether the media is waiting for data
	 */
	waiting: Signal<boolean>;

	/**
	 * Whether the media is currently seeking
	 */
	seeking: Signal<boolean>;

	/**
	 * Whether the media has ended
	 */
	ended: Signal<boolean>;

	/**
	 * Whether the media has stalled
	 */
	stalled: Signal<boolean>;

	/**
	 * The buffered time ranges
	 */
	buffered: Signal<[number, number][]>;

	/**
	 * Whether the media is currently playing
	 */
	playing: Signal<boolean>;

	/**
	 * The playback rate (speed)
	 */
	rate: Signal<number>;

	/**
	 * The current volume (0-1)
	 */
	volume: Signal<number>;

	/**
	 * Whether the media is muted
	 */
	muted: Signal<boolean>;

	/**
	 * Available text tracks
	 */
	tracks: Signal<MediaTextTrack[]>;

	/**
	 * The currently selected track index (-1 if none selected)
	 */
	selectedTrack: Signal<number>;

	/**
	 * Enable a specific track
	 */
	enableTrack: (
		track: number | MediaTextTrack,
		disableTracks?: boolean,
	) => void;

	/**
	 * Disable a specific track or all tracks
	 */
	disableTrack: (track?: number | MediaTextTrack) => void;

	/**
	 * Whether picture-in-picture is supported
	 */
	supportsPictureInPicture: boolean;

	/**
	 * Toggle picture-in-picture mode
	 */
	togglePictureInPicture: () => Promise<PictureInPictureWindow | void>;

	/**
	 * Whether the media is in picture-in-picture mode
	 */
	isPictureInPicture: Signal<boolean>;
}

/**
 * Converts a TimeRange object to an array
 */
function timeRangeToArray(timeRanges: TimeRanges): [number, number][] {
	const ranges: [number, number][] = [];

	for (let i = 0; i < timeRanges.length; ++i) {
		ranges.push([timeRanges.start(i), timeRanges.end(i)]);
	}

	return ranges;
}

/**
 * Converts a TextTrackList object to an array of `MediaTextTrack`
 */
function tracksToArray(tracks: TextTrackList): MediaTextTrack[] {
	return Array.from(tracks).map(
		(
			{
				label,
				kind,
				language,
				mode,
				activeCues,
				cues,
				inBandMetadataTrackDispatchType,
			},
			id,
		) => ({
			id,
			label,
			kind,
			language,
			mode,
			activeCues,
			cues,
			inBandMetadataTrackDispatchType,
		}),
	);
}

/**
 * Reactive media controls for both `audio` and `video` elements.
 *
 * @example
 * ```ts
 * const videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
 * const controls = injectMediaControls(videoRef, {
 *   src: 'video.mp4',
 * });
 *
 * effect(() => {
 *   console.log('Playing:', controls.playing());
 *   console.log('Current Time:', controls.currentTime());
 *   console.log('Duration:', controls.duration());
 * });
 *
 * // Control playback
 * controls.playing.set(true); // Start playing
 * controls.volume.set(0.5); // Set volume to 50%
 * controls.currentTime.set(30); // Seek to 30 seconds
 * ```
 *
 * @param target - The target media element (audio or video). Can be an ElementRef, a Signal<ElementRef>, or undefined
 * @param options - Options for media control
 * @returns An object containing signals for media state and control functions
 */
export function injectMediaControls(
	target:
		| ElementRef<HTMLMediaElement>
		| Signal<ElementRef<HTMLMediaElement> | undefined>,
	options: InjectMediaControlsOptions = {},
): Readonly<MediaControlsState> {
	return assertInjector(injectMediaControls, options.injector, () => {
		const document = inject(DOCUMENT);
		const window = options.window ?? document.defaultView!;

		// Internal writable signals
		const currentTime = signal(0);
		const duration = signal(0);
		const seeking = signal(false);
		const volume = signal(1);
		const waiting = signal(false);
		const ended = signal(false);
		const playing = signal(false);
		const rate = signal(1);
		const stalled = signal(false);
		const buffered = signal<[number, number][]>([]);
		const tracks = signal<MediaTextTrack[]>([]);
		const selectedTrack = signal<number>(-1);
		const isPictureInPicture = signal(false);
		const muted = signal(false);

		// Helper to get the native element from target
		const getElement = (): HTMLMediaElement | null => {
			if (typeof target === 'function') {
				// It's a signal
				const ref = target();
				return ref?.nativeElement ?? null;
			} else {
				// It's an ElementRef
				return target.nativeElement ?? null;
			}
		};

		const supportsPictureInPicture = Boolean(
			document && 'pictureInPictureEnabled' in document,
		);

		/**
		 * Disables the specified track. If no track is specified then
		 * all tracks will be disabled
		 *
		 * @param track The id of the track to disable
		 */
		const disableTrack = (track?: number | MediaTextTrack) => {
			const el = getElement();
			if (!el) return;

			if (track !== undefined) {
				const id = typeof track === 'number' ? track : track.id;
				if (el.textTracks[id]) {
					el.textTracks[id].mode = 'disabled';
				}
			} else {
				for (let i = 0; i < el.textTracks.length; ++i) {
					el.textTracks[i].mode = 'disabled';
				}
			}

			selectedTrack.set(-1);
		};

		/**
		 * Enables the specified track and disables the
		 * other tracks unless otherwise specified
		 *
		 * @param track The track of the id of the track to enable
		 * @param disableTracks Disable all other tracks
		 */
		const enableTrack = (
			track: number | MediaTextTrack,
			disableTracks = true,
		) => {
			const el = getElement();
			if (!el) return;

			const id = typeof track === 'number' ? track : track.id;

			if (disableTracks) {
				disableTrack();
			}

			if (el.textTracks[id]) {
				el.textTracks[id].mode = 'showing';
				selectedTrack.set(id);
			}
		};

		/**
		 * Toggle picture in picture mode for the player.
		 */
		const togglePictureInPicture = () => {
			return new Promise<PictureInPictureWindow | void>((resolve, reject) => {
				const el = getElement() as HTMLVideoElement;
				if (!el) {
					reject(new Error('Media element not found'));
					return;
				}

				if (supportsPictureInPicture) {
					if (!isPictureInPicture.value) {
						el.requestPictureInPicture().then(resolve).catch(reject);
					} else {
						document.exitPictureInPicture().then(resolve).catch(reject);
					}
				} else {
					reject(new Error('Picture-in-picture is not supported'));
				}
			});
		};

		// Track whether we should ignore updates (to prevent feedback loops)
		let ignoreCurrentTimeUpdate = false;
		let ignorePlayingUpdate = false;

		// Effect to handle source changes
		effect(() => {
			const el = getElement();
			if (!el || !document) return;

			const srcOption = options.src;
			if (!srcOption) return;

			const srcValue =
				typeof srcOption === 'function' ? srcOption() : srcOption;
			let sources: MediaSource[] = [];

			if (!srcValue) return;

			// Merge sources into an array
			if (typeof srcValue === 'string') {
				sources = [{ src: srcValue }];
			} else if (Array.isArray(srcValue)) {
				sources = srcValue;
			} else {
				sources = [srcValue];
			}

			// Clear the sources
			el.querySelectorAll('source').forEach((e) => {
				e.remove();
			});

			// Add new sources
			sources.forEach(({ src, type, media }) => {
				const source = document.createElement('source');
				source.setAttribute('src', src);
				if (type) source.setAttribute('type', type);
				if (media) source.setAttribute('media', media);
				el.appendChild(source);
			});

			// Finally, load the new sources.
			el.load();
		});

		// Effect to handle track changes
		effect(() => {
			const el = getElement();
			if (!el || !document) return;

			const tracksOption = options.tracks;
			if (!tracksOption) return;

			const textTracks =
				typeof tracksOption === 'function' ? tracksOption() : tracksOption;

			if (!textTracks || !textTracks.length) return;

			// Remove existing tracks
			el.querySelectorAll('track').forEach((e) => e.remove());

			textTracks.forEach(
				({ default: isDefault, kind, label, src, srcLang }, i) => {
					const track = document.createElement('track');

					track.default = isDefault || false;
					track.kind = kind;
					track.label = label;
					track.src = src;
					track.srclang = srcLang;

					if (track.default) {
						selectedTrack.set(i);
					}

					el.appendChild(track);
				},
			);
		});

		// Effect to apply volume changes to the element
		effect(() => {
			const el = getElement();
			if (!el) return;

			const vol = volume();
			el.volume = vol;
		});

		// Effect to apply muted changes to the element
		effect(() => {
			const el = getElement();
			if (!el) return;

			const mutedValue = muted();
			el.muted = mutedValue;
		});

		// Effect to apply playback rate changes to the element
		effect(() => {
			const el = getElement();
			if (!el) return;

			const rateValue = rate();
			el.playbackRate = rateValue;
		});

		// Effect to handle currentTime changes from the signal
		effect(() => {
			if (ignoreCurrentTimeUpdate) return;

			const el = getElement();
			if (!el) return;

			const time = currentTime();
			el.currentTime = time;
		});

		// Effect to handle playing state changes from the signal
		effect(() => {
			if (ignorePlayingUpdate) return;

			const el = getElement();
			if (!el) return;

			const isPlaying = playing();
			if (isPlaying) {
				el.play().catch((error) => {
					console.error('Failed to play media:', error);
				});
			} else {
				el.pause();
			}
		});

		// Set up event listeners
		if (typeof target === 'function') {
			// For signal-based targets, we need to observe changes
			toObservable(target)
				.pipe(takeUntilDestroyed())
				.subscribe((ref) => {
					const el = ref?.nativeElement;
					if (!el) return;

					// Set up all event listeners for the new element
					setupEventListeners(el);
				});
		} else {
			// For static ElementRef, set up listeners once
			const el = getElement();
			if (el) {
				setupEventListeners(el);
			}
		}

		function setupEventListeners(el: HTMLMediaElement) {
			// timeupdate event
			fromEvent(el, 'timeupdate')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					ignoreCurrentTimeUpdate = true;
					currentTime.set(el.currentTime);
					ignoreCurrentTimeUpdate = false;
				});

			// durationchange event
			fromEvent(el, 'durationchange')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					duration.set(el.duration);
				});

			// progress event
			fromEvent(el, 'progress')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					buffered.set(timeRangeToArray(el.buffered));
				});

			// seeking event
			fromEvent(el, 'seeking')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					seeking.set(true);
				});

			// seeked event
			fromEvent(el, 'seeked')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					seeking.set(false);
				});

			// waiting and loadstart events
			merge(fromEvent(el, 'waiting'), fromEvent(el, 'loadstart'))
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					waiting.set(true);
					ignorePlayingUpdate = true;
					playing.set(false);
					ignorePlayingUpdate = false;
				});

			// loadeddata event
			fromEvent(el, 'loadeddata')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					waiting.set(false);
				});

			// playing event
			fromEvent(el, 'playing')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					waiting.set(false);
					ended.set(false);
					ignorePlayingUpdate = true;
					playing.set(true);
					ignorePlayingUpdate = false;
				});

			// ratechange event
			fromEvent(el, 'ratechange')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					rate.set(el.playbackRate);
				});

			// stalled event
			fromEvent(el, 'stalled')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					stalled.set(true);
				});

			// ended event
			fromEvent(el, 'ended')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					ended.set(true);
				});

			// pause event
			fromEvent(el, 'pause')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					ignorePlayingUpdate = true;
					playing.set(false);
					ignorePlayingUpdate = false;
				});

			// play event
			fromEvent(el, 'play')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					ignorePlayingUpdate = true;
					playing.set(true);
					ignorePlayingUpdate = false;
				});

			// enterpictureinpicture event
			fromEvent(el, 'enterpictureinpicture')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					isPictureInPicture.set(true);
				});

			// leavepictureinpicture event
			fromEvent(el, 'leavepictureinpicture')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					isPictureInPicture.set(false);
				});

			// volumechange event
			fromEvent(el, 'volumechange')
				.pipe(takeUntilDestroyed())
				.subscribe(() => {
					volume.set(el.volume);
					muted.set(el.muted);
				});

			// Text track events
			if (el.textTracks) {
				merge(
					fromEvent(el.textTracks, 'addtrack'),
					fromEvent(el.textTracks, 'removetrack'),
					fromEvent(el.textTracks, 'change'),
				)
					.pipe(takeUntilDestroyed())
					.subscribe(() => {
						tracks.set(tracksToArray(el.textTracks));
					});
			}
		}

		// Return readonly state with writable signals for controllable properties
		return {
			currentTime: currentTime,
			duration: duration.asReadonly(),
			waiting: waiting.asReadonly(),
			seeking: seeking.asReadonly(),
			ended: ended.asReadonly(),
			stalled: stalled.asReadonly(),
			buffered: buffered.asReadonly(),
			playing: playing,
			rate: rate,
			volume: volume,
			muted: muted,
			tracks: tracks.asReadonly(),
			selectedTrack: selectedTrack.asReadonly(),
			enableTrack,
			disableTrack,
			supportsPictureInPicture,
			togglePictureInPicture,
			isPictureInPicture: isPictureInPicture.asReadonly(),
		};
	});
}
