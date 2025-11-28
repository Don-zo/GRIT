/**
 * useMediaStream
 *
 * 사용자의 카메라와 마이크에 접근하여 미디어 스트림을 관리하는 훅
 *
 * 주요 기능:
 * - getUserMedia API를 사용하여 로컬 비디오/오디오 스트림 획득
 * - 사용 가능한 미디어 장치 목록 조회 (카메라, 마이크, 스피커 등)
 * - 스트림 시작/중지 및 생명주기 관리
 * - 로딩 상태 및 에러 처리
 *
 * @param config - 미디어 제약 조건 (video, audio 설정)
 * @returns {Object} 스트림 관련 상태와 제어 함수들
 *
 * @example
 * const { stream, startStream, stopStream } = useMediaStream({ video: true, audio: true });
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { MediaStreamConfig } from "@/types/webrtc";

export const useMediaStream = (
  config: MediaStreamConfig = { video: true, audio: true }
) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const streamRef = useRef<MediaStream | null>(null);

  // 장치 목록 가져오기
  const getDevices = useCallback(async () => {
    try {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceInfos);
      console.log("가능한 장치", deviceInfos);
      return deviceInfos;
    } catch (err) {
      console.error("장치 목록 가져오기 실패:", err);
      return [];
    }
  }, []);

  // 스트림 시작
  const startStream = useCallback(
    async (customConfig?: MediaStreamConfig) => {
      setIsLoading(true);
      try {
        const constraints = customConfig || config;
        console.log("Requesting media with constraints:", constraints);

        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        streamRef.current = mediaStream;
        setStream(mediaStream);
        setError(null);

        console.log("스트림 시작:", {
          videoTracks: mediaStream.getVideoTracks().length,
          audioTracks: mediaStream.getAudioTracks().length,
        });

        // 장치 목록도 업데이트
        await getDevices();

        return mediaStream;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error("스트림 시작 실패:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [config, getDevices]
  );

  // 스트림 중지
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`스트림 중지: ${track.kind}`);
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // 초기 장치 목록 로드
  useEffect(() => {
    getDevices();
  }, [getDevices]);

  /**
   * 반환값:
   * @property {MediaStream | null} stream - 현재 활성화된 미디어 스트림
   * @property {Error | null} error - 스트림 획득 중 발생한 에러
   * @property {boolean} isLoading - 스트림 로딩 상태
   * @property {MediaDeviceInfo[]} devices - 사용 가능한 미디어 장치 목록
   * @property {Function} startStream - 스트림을 시작하는 함수
   * @property {Function} stopStream - 스트림을 중지하는 함수
   * @property {Function} getDevices - 장치 목록을 다시 가져오는 함수
   */

  return {
    stream,
    error,
    isLoading,
    devices,
    startStream,
    stopStream,
    getDevices,
  };
};
