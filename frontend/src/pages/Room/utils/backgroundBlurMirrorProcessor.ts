import { Track } from "livekit-client";
import type { TrackProcessor, VideoProcessorOptions } from "livekit-client";
import {
  BackgroundProcessor,
  type BackgroundProcessorWrapper,
} from "@livekit/track-processors";

const DEFAULT_BLUR_RADIUS = 10;

export class BackgroundBlurMirrorProcessor
  implements TrackProcessor<Track.Kind.Video, VideoProcessorOptions>
{
  name = "background-blur-mirror-processor";
  processedTrack?: MediaStreamTrack;

  private blurProcessor: BackgroundProcessorWrapper;
  private blurVideoElement?: HTMLVideoElement;
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private rafId?: number;

  constructor(blurRadius: number = DEFAULT_BLUR_RADIUS) {
    this.blurProcessor = BackgroundProcessor({
      mode: "background-blur",
      blurRadius,
    });
  }

  private renderFrame = () => {
    const { ctx, canvas, blurVideoElement } = this;
    if (
      ctx &&
      canvas &&
      blurVideoElement?.videoWidth &&
      blurVideoElement.videoHeight
    ) {
      if (
        canvas.width !== blurVideoElement.videoWidth ||
        canvas.height !== blurVideoElement.videoHeight
      ) {
        canvas.width = blurVideoElement.videoWidth;
        canvas.height = blurVideoElement.videoHeight;
      }

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(
        blurVideoElement,
        -canvas.width,
        0,
        canvas.width,
        canvas.height,
      );
      ctx.restore();
    }

    this.rafId = requestAnimationFrame(this.renderFrame);
  };

  async init(opts: VideoProcessorOptions) {
    await this.blurProcessor.init(opts);

    const blurredTrack = this.blurProcessor.processedTrack;
    if (!blurredTrack) {
      throw new Error("배경 흐림 처리를 초기화하지 못했습니다.");
    }

    this.blurVideoElement = document.createElement("video");
    this.blurVideoElement.muted = true;
    this.blurVideoElement.playsInline = true;
    this.blurVideoElement.srcObject = new MediaStream([blurredTrack]);
    await this.blurVideoElement.play();

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") ?? undefined;

    const stream = this.canvas.captureStream();
    this.processedTrack = stream.getVideoTracks()[0];

    this.renderFrame();
  }

  async restart(opts: VideoProcessorOptions) {
    await this.destroy();
    await this.init(opts);
  }

  async destroy() {
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }

    this.processedTrack?.stop();
    this.processedTrack = undefined;

    if (this.blurVideoElement) {
      this.blurVideoElement.pause();
      this.blurVideoElement.srcObject = null;
      this.blurVideoElement = undefined;
    }

    await this.blurProcessor.destroy();
  }
}
