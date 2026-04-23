# ngxtension/inject-media-controls

Secondary entry point of `ngxtension`. It can be used by importing from `ngxtension/inject-media-controls`.

## Overview

Reactive media controls for both `audio` and `video` elements. This utility provides comprehensive control over HTML5 media elements using Angular signals, allowing you to easily manage playback, volume, seeking, tracks, and picture-in-picture mode.

## Usage

### Basic Usage

```ts
import { Component, ElementRef, viewChild } from '@angular/core';
import { injectMediaControls } from 'ngxtension/inject-media-controls';

@Component({
  selector: 'app-video-player',
  standalone: true,
  template: `
    <video #video></video>
    <div class="controls">
      <button (click)="togglePlay()">
        {{ controls.playing() ? 'Pause' : 'Play' }}
      </button>
      <span>{{ controls.currentTime() | number:'1.0-0' }} / {{ controls.duration() | number:'1.0-0' }}</span>
      <input
        type="range"
        [value]="controls.volume()"
        (input)="setVolume($event)"
        min="0"
        max="1"
        step="0.01"
      />
    </div>
  `,
})
export class VideoPlayerComponent {
  videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
  controls = injectMediaControls(this.videoRef, {
    src: 'video.mp4',
  });

  togglePlay() {
    this.controls.playing.set(!this.controls.playing());
  }

  setVolume(event: Event) {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.controls.volume.set(value);
  }
}
```

### Audio Player

Works seamlessly with audio elements too:

```ts
@Component({
  selector: 'app-audio-player',
  standalone: true,
  template: `
    <audio #audio></audio>
    <button (click)="controls.playing.set(!controls.playing())">
      {{ controls.playing() ? 'Pause' : 'Play' }}
    </button>
  `,
})
export class AudioPlayerComponent {
  audioRef = viewChild<ElementRef<HTMLAudioElement>>('audio');
  controls = injectMediaControls(this.audioRef, {
    src: 'audio.mp3',
  });
}
```

### Multiple Sources

Provide multiple source formats for better browser compatibility:

```ts
controls = injectMediaControls(videoRef, {
  src: [
    { src: 'video.mp4', type: 'video/mp4' },
    { src: 'video.webm', type: 'video/webm' },
    { src: 'video.ogv', type: 'video/ogg' },
  ],
});
```

### Dynamic Sources

Use signals for dynamic source changes:

```ts
export class DynamicVideoComponent {
  videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
  currentSrc = signal('video1.mp4');

  controls = injectMediaControls(this.videoRef, {
    src: this.currentSrc,
  });

  changeVideo(newSrc: string) {
    this.currentSrc.set(newSrc);
  }
}
```

### Text Tracks (Captions/Subtitles)

Add captions, subtitles, or other text tracks:

```ts
controls = injectMediaControls(videoRef, {
  src: 'video.mp4',
  tracks: [
    {
      kind: 'subtitles',
      label: 'English',
      src: 'subtitles-en.vtt',
      srcLang: 'en',
      default: true,
    },
    {
      kind: 'subtitles',
      label: 'Spanish',
      src: 'subtitles-es.vtt',
      srcLang: 'es',
    },
  ],
});

// Enable a specific track
controls.enableTrack(1); // Enable Spanish subtitles

// Disable all tracks
controls.disableTrack();
```

### Advanced Controls

```ts
export class AdvancedPlayerComponent {
  videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
  controls = injectMediaControls(this.videoRef, {
    src: 'video.mp4',
  });

  constructor() {
    // React to playback state changes
    effect(() => {
      console.log('Playing:', this.controls.playing());
      console.log('Current Time:', this.controls.currentTime());
    });
  }

  seekTo(time: number) {
    this.controls.currentTime.set(time);
  }

  changeSpeed(rate: number) {
    this.controls.rate.set(rate);
  }

  toggleMute() {
    this.controls.muted.set(!this.controls.muted());
  }

  async togglePip() {
    try {
      await this.controls.togglePictureInPicture();
    } catch (error) {
      console.error('PiP failed:', error);
    }
  }
}
```

### Monitoring Buffering

```ts
effect(() => {
  const bufferedRanges = this.controls.buffered();
  console.log('Buffered ranges:', bufferedRanges);
  // Example output: [[0, 10], [15, 25]]
});
```

## API

### Options

```ts
interface InjectMediaControlsOptions {
  src?: string | MediaSource | MediaSource[] | Signal<string | MediaSource | MediaSource[]>;
  tracks?: MediaTextTrackSource[] | Signal<MediaTextTrackSource[]>;
  injector?: Injector;
  window?: Window;
}
```

### Return Value

```ts
interface MediaControlsState {
  // Playback state (writable)
  playing: Signal<boolean>;
  currentTime: Signal<number>;
  rate: Signal<number>;

  // Volume controls (writable)
  volume: Signal<number>;
  muted: Signal<boolean>;

  // Read-only state
  duration: Signal<number>;
  waiting: Signal<boolean>;
  seeking: Signal<boolean>;
  ended: Signal<boolean>;
  stalled: Signal<boolean>;
  buffered: Signal<[number, number][]>;

  // Text tracks
  tracks: Signal<MediaTextTrack[]>;
  selectedTrack: Signal<number>;
  enableTrack: (track: number | MediaTextTrack, disableTracks?: boolean) => void;
  disableTrack: (track?: number | MediaTextTrack) => void;

  // Picture-in-Picture
  supportsPictureInPicture: boolean;
  togglePictureInPicture: () => Promise<PictureInPictureWindow | void>;
  isPictureInPicture: Signal<boolean>;
}
```

### Writable Signals

The following signals can be set to control the media element:

- `playing` - Start/pause playback
- `currentTime` - Seek to a specific time (in seconds)
- `volume` - Set volume (0-1)
- `muted` - Mute/unmute audio
- `rate` - Set playback speed (0.5 = half speed, 2 = double speed)

### Read-only Signals

- `duration` - Total media duration in seconds
- `waiting` - Media is waiting for data
- `seeking` - Media is currently seeking
- `ended` - Media has reached the end
- `stalled` - Media download has stalled
- `buffered` - Array of buffered time ranges `[start, end][]`
- `tracks` - Available text tracks
- `selectedTrack` - Currently selected track index (-1 if none)
- `isPictureInPicture` - Whether in picture-in-picture mode

## Browser Compatibility

- Basic media controls: All modern browsers
- Picture-in-Picture: Chrome 70+, Edge 79+, Safari 13.1+
- Text tracks: All modern browsers

## Credits

Ported from [VueUse useMediaControls](https://vueuse.org/core/useMediaControls/)
