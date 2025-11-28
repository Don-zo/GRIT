/**
 * useMediaControls
 *
 * 미디어 스트림의 비디오/오디오 트랙을 제어하는 훅
 *
 * 주요 기능:
 * - 카메라 on/off
 * - 마이크 on/off
 * - 현재 비디오/오디오 활성화 상태 추적
 * - 스트림 변경 시 자동으로 상태 동기화
 *
 * 참고: 스트림 자체를 중지하지 않고 트랙만 비활성화하여
 *       빠른 전환이 가능하고 피어 연결을 유지합니다.
 *
 * @param stream - 제어할 MediaStream 객체
 * @returns {Object} 미디어 제어 상태 및 함수들
 *
 * @example
 * const { isVideoEnabled, toggleVideo, toggleAudio } = useMediaControls(stream);
 */

import { useState, useCallback, useEffect } from "react";

export const useMediaControls = (stream: MediaStream | null) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // 스트림 변경 시 상태 동기화
  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
        console.log("비디오 초기 상태:", videoTrack.enabled);
      }
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
        console.log("마이크 초기 상태:", audioTrack.enabled);
      }
    }
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (!stream) return false;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
      console.log("비디오 전환 완료:", videoTrack.enabled);
      return videoTrack.enabled;
    }
    return false;
  }, [stream]);

  const toggleAudio = useCallback(() => {
    if (!stream) return false;

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      console.log("마이크 전환 완료:", audioTrack.enabled);
      return audioTrack.enabled;
    }
    return false;
  }, [stream]);

  const setVideoEnabled = useCallback(
    (enabled: boolean) => {
      if (!stream) return;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
        setIsVideoEnabled(enabled);
        console.log("비디오 상태:", enabled);
      }
    },
    [stream]
  );

  const setAudioEnabled = useCallback(
    (enabled: boolean) => {
      if (!stream) return;

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
        setIsAudioEnabled(enabled);
        console.log("마이크 상태:", enabled);
      }
    },
    [stream]
  );

  /**
   * 반환값:
   * @property {boolean} isVideoEnabled - 현재 비디오 활성화 상태
   * @property {boolean} isAudioEnabled - 현재 오디오 활성화 상태
   * @property {Function} toggleVideo - 비디오를 토글하는 함수 (on ↔ off)
   * @property {Function} toggleAudio - 오디오를 토글하는 함수 (on ↔ off)
   * @property {Function} setVideoEnabled - 비디오 상태를 직접 설정하는 함수
   * @property {Function} setAudioEnabled - 오디오 상태를 직접 설정하는 함수
   */

  return {
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    setVideoEnabled,
    setAudioEnabled,
  };
};
