import { useEffect, useRef } from "react";
import { Track } from "livekit-client";
import type { LocalParticipant } from "livekit-client";

type VideoTileProps = {
  participant?: LocalParticipant;
  videoTrack?: Track | null;
  audioTrack?: Track | null;
};

export default function VideoTile({
  participant,
  videoTrack,
  audioTrack,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldRenderVideo = Boolean(videoTrack || participant);

  useEffect(() => {
    const track = participant
      ? participant.getTrackPublication(Track.Source.Camera)?.track
      : videoTrack;

    const element = videoRef.current;

    if (track && element) {
      track.attach(element);
    }

    return () => {
      if (track && element) {
        track.detach(element);
      }
    };
  }, [participant, videoTrack]);

  useEffect(() => {
    const track = participant
      ? participant.getTrackPublication(Track.Source.Microphone)?.track
      : audioTrack;

    const element = audioRef.current;

    if (track && element) {
      track.attach(element);
    }

    return () => {
      if (track && element) {
        track.detach(element);
      }
    };
  }, [participant, audioTrack]);

  return (
    <>
      {shouldRenderVideo && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}
      <audio ref={audioRef} autoPlay className="hidden" />
    </>
  );
}
