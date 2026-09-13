import { Track } from "livekit-client";
import type { TrackProcessor, VideoProcessorOptions } from "livekit-client";

export class MirrorVideoProcessor
  implements TrackProcessor<Track.Kind.Video, VideoProcessorOptions>
{
  name = "mirror-video-processor";
  processedTrack?: MediaStreamTrack;

  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private sourceElement?: HTMLVideoElement;
  private rafId?: number;

  private renderFrame = () => {
    const { ctx, canvas, sourceElement } = this;
    if (ctx && canvas && sourceElement?.videoWidth && sourceElement.videoHeight) {
      if (
        canvas.width !== sourceElement.videoWidth ||
        canvas.height !== sourceElement.videoHeight
      ) {
        canvas.width = sourceElement.videoWidth;
        canvas.height = sourceElement.videoHeight;
      }

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(sourceElement, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    this.rafId = requestAnimationFrame(this.renderFrame);
  };

  async init(opts: VideoProcessorOptions) {
    this.sourceElement = opts.element as HTMLVideoElement;
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
  }
}
