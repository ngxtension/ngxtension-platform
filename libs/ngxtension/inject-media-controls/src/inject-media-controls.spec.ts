import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { injectMediaControls } from './inject-media-controls';

describe(injectMediaControls.name, () => {
	@Component({
		standalone: true,
		template: `
			<video #video></video>
		`,
	})
	class TestComponent {
		videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
		controls = injectMediaControls(this.videoRef, {
			src: 'test-video.mp4',
		});
	}

	@Component({
		standalone: true,
		template: `
			<audio #audio></audio>
		`,
	})
	class TestAudioComponent {
		audioRef = viewChild<ElementRef<HTMLAudioElement>>('audio');
		controls = injectMediaControls(this.audioRef, {
			src: 'test-audio.mp3',
		});
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return {
			fixture,
			component: fixture.componentInstance,
			element: fixture.nativeElement.querySelector('video') as HTMLVideoElement,
		};
	}

	function setupAudio() {
		const fixture = TestBed.createComponent(TestAudioComponent);
		fixture.detectChanges();
		return {
			fixture,
			component: fixture.componentInstance,
			element: fixture.nativeElement.querySelector('audio') as HTMLAudioElement,
		};
	}

	it('should create controls with initial values', () => {
		const { component } = setup();

		expect(component.controls.currentTime()).toBe(0);
		expect(component.controls.duration()).toBeNaN(); // Duration is NaN until metadata is loaded
		expect(component.controls.playing()).toBe(false);
		expect(component.controls.volume()).toBe(1);
		expect(component.controls.muted()).toBe(false);
		expect(component.controls.seeking()).toBe(false);
		expect(component.controls.waiting()).toBe(false);
		expect(component.controls.ended()).toBe(false);
		expect(component.controls.stalled()).toBe(false);
		expect(component.controls.rate()).toBe(1);
		expect(component.controls.buffered()).toEqual([]);
		expect(component.controls.tracks()).toEqual([]);
		expect(component.controls.selectedTrack()).toBe(-1);
		expect(component.controls.isPictureInPicture()).toBe(false);
	});

	it('should work with audio elements', () => {
		const { component, element } = setupAudio();

		expect(element.tagName).toBe('AUDIO');
		expect(component.controls.playing()).toBe(false);
	});

	it('should update playing state when play event is dispatched', fakeAsync(() => {
		const { component, element } = setup();

		element.dispatchEvent(new Event('play'));
		tick();

		expect(component.controls.playing()).toBe(true);
	}));

	it('should update playing state when pause event is dispatched', fakeAsync(() => {
		const { component, element } = setup();

		// First play
		element.dispatchEvent(new Event('play'));
		tick();
		expect(component.controls.playing()).toBe(true);

		// Then pause
		element.dispatchEvent(new Event('pause'));
		tick();
		expect(component.controls.playing()).toBe(false);
	}));

	it('should update volume when volumechange event is dispatched', fakeAsync(() => {
		const { component, element } = setup();

		element.volume = 0.5;
		element.dispatchEvent(new Event('volumechange'));
		tick();

		expect(component.controls.volume()).toBe(0.5);
	}));

	it('should update muted state when volumechange event is dispatched', fakeAsync(() => {
		const { component, element } = setup();

		element.muted = true;
		element.dispatchEvent(new Event('volumechange'));
		tick();

		expect(component.controls.muted()).toBe(true);
	}));

	it('should update currentTime when timeupdate event is dispatched', fakeAsync(() => {
		const { component, element } = setup();

		Object.defineProperty(element, 'currentTime', {
			writable: true,
			configurable: true,
			value: 10,
		});
		element.dispatchEvent(new Event('timeupdate'));
		tick();

		expect(component.controls.currentTime()).toBe(10);
	}));

	it('should update duration when durationchange event is dispatched', fakeAsync(() => {
		const { component, element } = setup();

		Object.defineProperty(element, 'duration', {
			writable: true,
			configurable: true,
			value: 120,
		});
		element.dispatchEvent(new Event('durationchange'));
		tick();

		expect(component.controls.duration()).toBe(120);
	}));

	it('should update seeking state', fakeAsync(() => {
		const { component, element } = setup();

		element.dispatchEvent(new Event('seeking'));
		tick();
		expect(component.controls.seeking()).toBe(true);

		element.dispatchEvent(new Event('seeked'));
		tick();
		expect(component.controls.seeking()).toBe(false);
	}));

	it('should update waiting state', fakeAsync(() => {
		const { component, element } = setup();

		element.dispatchEvent(new Event('waiting'));
		tick();
		expect(component.controls.waiting()).toBe(true);

		element.dispatchEvent(new Event('loadeddata'));
		tick();
		expect(component.controls.waiting()).toBe(false);
	}));

	it('should update ended state', fakeAsync(() => {
		const { component, element } = setup();

		element.dispatchEvent(new Event('ended'));
		tick();
		expect(component.controls.ended()).toBe(true);
	}));

	it('should update stalled state', fakeAsync(() => {
		const { component, element } = setup();

		element.dispatchEvent(new Event('stalled'));
		tick();
		expect(component.controls.stalled()).toBe(true);
	}));

	it('should update playback rate when ratechange event is dispatched', fakeAsync(() => {
		const { component, element } = setup();

		Object.defineProperty(element, 'playbackRate', {
			writable: true,
			configurable: true,
			value: 1.5,
		});
		element.dispatchEvent(new Event('ratechange'));
		tick();

		expect(component.controls.rate()).toBe(1.5);
	}));

	it('should update buffered ranges when progress event is dispatched', fakeAsync(() => {
		const { component, element } = setup();

		const mockBuffered = {
			length: 2,
			start: (i: number) => (i === 0 ? 0 : 50),
			end: (i: number) => (i === 0 ? 10 : 60),
		} as TimeRanges;

		Object.defineProperty(element, 'buffered', {
			writable: true,
			configurable: true,
			value: mockBuffered,
		});

		element.dispatchEvent(new Event('progress'));
		tick();

		expect(component.controls.buffered()).toEqual([
			[0, 10],
			[50, 60],
		]);
	}));

	it('should apply volume changes to the element', fakeAsync(() => {
		const { component, element } = setup();

		component.controls.volume.set(0.7);
		tick();

		expect(element.volume).toBe(0.7);
	}));

	it('should apply muted changes to the element', fakeAsync(() => {
		const { component, element } = setup();

		component.controls.muted.set(true);
		tick();

		expect(element.muted).toBe(true);
	}));

	it('should apply playback rate changes to the element', fakeAsync(() => {
		const { component, element } = setup();

		component.controls.rate.set(2);
		tick();

		expect(element.playbackRate).toBe(2);
	}));

	it('should apply currentTime changes to the element', fakeAsync(() => {
		const { component, element } = setup();

		component.controls.currentTime.set(30);
		tick();

		expect(element.currentTime).toBe(30);
	}));

	it('should support picture-in-picture', () => {
		const { component } = setup();

		// Note: supportsPictureInPicture depends on the browser/test environment
		expect(typeof component.controls.supportsPictureInPicture).toBe('boolean');
	});

	it('should track picture-in-picture state', fakeAsync(() => {
		const { component, element } = setup();

		element.dispatchEvent(new Event('enterpictureinpicture'));
		tick();
		expect(component.controls.isPictureInPicture()).toBe(true);

		element.dispatchEvent(new Event('leavepictureinpicture'));
		tick();
		expect(component.controls.isPictureInPicture()).toBe(false);
	}));

	it('should handle playing event correctly', fakeAsync(() => {
		const { component, element } = setup();

		element.dispatchEvent(new Event('playing'));
		tick();

		expect(component.controls.playing()).toBe(true);
		expect(component.controls.waiting()).toBe(false);
		expect(component.controls.ended()).toBe(false);
	}));

	it('should handle loadstart event', fakeAsync(() => {
		const { component, element } = setup();

		element.dispatchEvent(new Event('loadstart'));
		tick();

		expect(component.controls.waiting()).toBe(true);
		expect(component.controls.playing()).toBe(false);
	}));

	describe('Text Tracks', () => {
		@Component({
			standalone: true,
			template: `
				<video #video></video>
			`,
		})
		class TestTracksComponent {
			videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
			controls = injectMediaControls(this.videoRef, {
				src: 'test-video.mp4',
				tracks: [
					{
						kind: 'subtitles',
						label: 'English',
						src: 'en.vtt',
						srcLang: 'en',
						default: true,
					},
					{
						kind: 'subtitles',
						label: 'Spanish',
						src: 'es.vtt',
						srcLang: 'es',
					},
				],
			});
		}

		function setupWithTracks() {
			const fixture = TestBed.createComponent(TestTracksComponent);
			fixture.detectChanges();
			return {
				fixture,
				component: fixture.componentInstance,
				element: fixture.nativeElement.querySelector(
					'video',
				) as HTMLVideoElement,
			};
		}

		it('should load tracks', fakeAsync(() => {
			const { element } = setupWithTracks();
			tick(100);

			const trackElements = element.querySelectorAll('track');
			expect(trackElements.length).toBe(2);
			expect(trackElements[0].label).toBe('English');
			expect(trackElements[1].label).toBe('Spanish');
		}));

		it('should set default track', fakeAsync(() => {
			const { element } = setupWithTracks();
			tick(100);

			const trackElements = element.querySelectorAll('track');
			expect(trackElements[0].default).toBe(true);
			expect(trackElements[1].default).toBe(false);
		}));
	});

	describe('Dynamic Sources', () => {
		@Component({
			standalone: true,
			template: `
				<video #video></video>
			`,
		})
		class TestDynamicSourceComponent {
			videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
			src = signal('test1.mp4');
			controls = injectMediaControls(this.videoRef, {
				src: this.src,
			});
		}

		it('should handle dynamic source changes', fakeAsync(() => {
			const fixture = TestBed.createComponent(TestDynamicSourceComponent);
			fixture.detectChanges();
			const component = fixture.componentInstance;
			const element = fixture.nativeElement.querySelector(
				'video',
			) as HTMLVideoElement;

			tick(100);

			// Initial source
			let sources = element.querySelectorAll('source');
			expect(sources.length).toBe(1);
			expect(sources[0].src).toContain('test1.mp4');

			// Change source
			component.src.set('test2.mp4');
			fixture.detectChanges();
			tick(100);

			sources = element.querySelectorAll('source');
			expect(sources.length).toBe(1);
			expect(sources[0].src).toContain('test2.mp4');
		}));
	});

	describe('Multiple Sources', () => {
		@Component({
			standalone: true,
			template: `
				<video #video></video>
			`,
		})
		class TestMultipleSourcesComponent {
			videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
			controls = injectMediaControls(this.videoRef, {
				src: [
					{ src: 'video.mp4', type: 'video/mp4' },
					{ src: 'video.webm', type: 'video/webm' },
				],
			});
		}

		it('should load multiple sources', fakeAsync(() => {
			const fixture = TestBed.createComponent(TestMultipleSourcesComponent);
			fixture.detectChanges();
			const element = fixture.nativeElement.querySelector(
				'video',
			) as HTMLVideoElement;

			tick(100);

			const sources = element.querySelectorAll('source');
			expect(sources.length).toBe(2);
			expect(sources[0].src).toContain('video.mp4');
			expect(sources[0].type).toBe('video/mp4');
			expect(sources[1].src).toContain('video.webm');
			expect(sources[1].type).toBe('video/webm');
		}));
	});
});
