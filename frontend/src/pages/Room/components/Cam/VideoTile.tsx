import { useEffect, useRef } from "react";
import { Track } from "livekit-client";
import type { LocalParticipant, RemoteTrack } from "livekit-client";

type VideoTileProps = {
  participant?: LocalParticipant;
  videoTrack?: RemoteTrack;
  audioTrack?: RemoteTrack;
};

export default function VideoTile({
  participant,
  videoTrack,
  audioTrack,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  useEffect(() => {
    const track = participant
      ? participant.getTrackPublication(Track.Source.Microphone)?.track
      : audioTrack;

    if (track && audioRef.current) {
      track.attach(audioRef.current);
    }

    return () => {
      track?.detach();
    };
  }, [participant, audioTrack]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {!participant && <audio ref={audioRef} autoPlay />}
    </>
  );
}
