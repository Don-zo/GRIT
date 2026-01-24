import { useEffect, useRef } from "react";
import { Track } from "livekit-client";
import type { LocalParticipant, RemoteTrack } from "livekit-client";

type VideoTileProps = {
  participant?: LocalParticipant;
  videoTrack?: RemoteTrack;
};

export default function VideoTile({ participant, videoTrack }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const track = participant
      ? participant.getTrackPublication(Track.Source.Camera)?.track
      : videoTrack;

    if (track && videoRef.current) {
      track.attach(videoRef.current);
    }

    return () => {
      videoTrack?.detach();
    };
  }, [participant, videoTrack]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  );
}
