// hooks/useMediaStream.jsx
import { useState, useCallback, useRef } from 'react';

export const useMediaStream = (peerConnection) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const localVideoRef = useRef(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const originalVideoTrack = useRef(null);  // 원본 비디오 트랙 저장용
    const initializeStream = useCallback(async () => {
        try {
            console.log('Requesting media stream...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            console.log('Media stream obtained:', stream.getTracks());
            setLocalStream(stream);

            if (localVideoRef.current) {
                console.log('Setting local video stream');
                localVideoRef.current.srcObject = stream;
                await localVideoRef.current.play().catch(error => {
                    console.error('Error playing local video:', error);
                });
            }

            return stream;
        } catch (error) {
            console.error('Failed to get media stream:', error);
            throw error;
        }
    }, []);

    const updateRemoteStream = useCallback((senderId, stream, userName) => {
        if (!senderId) {
            console.error('[RemoteStream] Sender ID is required');
            return;
        }

        console.log('[RemoteStream] Input received:', {
            senderId,
            userName,
            hasStream: !!stream
        });

        setRemoteStreams(prev => {
            try {
                const newStreams = new Map(prev);
                const existingStream = newStreams.get(senderId);

                // 기존 스트림 정리
                if (existingStream?.stream) {
                    existingStream.stream.getTracks().forEach(track => {
                        try {
                            track.stop();
                        } catch (error) {
                            console.warn('[RemoteStream] Error stopping track:', error);
                        }
                    });
                }

                // 새 스트림 설정
                if (stream) {
                    // 원본 스트림의 트랙 상태 로깅
                    console.log('[RemoteStream] Original stream tracks:',
                        stream.getTracks().map(t => ({
                            kind: t.kind,
                            enabled: t.enabled,
                            muted: t.muted,
                            readyState: t.readyState
                        }))
                    );

                    // clone을 사용하여 새로운 스트림 생성
                    const clonedTracks = stream.getTracks().map(track => track.clone());
                    const newStream = new MediaStream(clonedTracks);

                    // 새 스트림의 모든 트랙 활성화
                    clonedTracks.forEach(track => {
                        track.enabled = true;
                    });

                    console.log('[RemoteStream] Cloned stream created:', {
                        id: newStream.id,
                        active: newStream.active,
                        tracks: clonedTracks.map(t => ({
                            kind: t.kind,
                            enabled: t.enabled,
                            muted: t.muted,
                            readyState: t.readyState
                        }))
                    });

                    // 새 스트림으로 업데이트
                    newStreams.set(senderId, {
                        stream: newStream,
                        userName: userName || existingStream?.userName || 'Unknown User'
                    });
                }

                return newStreams;
            } catch (error) {
                console.error('[RemoteStream] Error updating streams:', error);
                return prev;
            }
        });
    }, []);

    const removeRemoteStream = useCallback((userId) => {
        setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            if (newStreams.has(userId)) {
                const stream = newStreams.get(userId);
                if (stream.stream) {
                    stream.stream.getTracks().forEach(track => track.stop());
                }
                newStreams.delete(userId);
            }
            return newStreams;
        });
    }, []);
    const toggleScreenShare = useCallback(async () => {
        try {
            if (!isScreenSharing) {
                // 화면 공유 시작
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: 'always'
                    },
                    audio: false
                });

                // 현재 비디오 트랙 저장
                originalVideoTrack.current = localStream.getVideoTracks()[0];

                // 화면 공유 트랙으로 교체
                const screenTrack = screenStream.getVideoTracks()[0];

                if (localStream) {
                    const videoTrack = localStream.getVideoTracks()[0];
                    if (videoTrack) {
                        localStream.removeTrack(videoTrack);
                    }
                    localStream.addTrack(screenTrack);

                    // WebRTC 연결 업데이트
                    if (peerConnection) {
                        const senders = peerConnection.getSenders();
                        const videoSender = senders.find(sender =>
                            sender.track && sender.track.kind === 'video'
                        );
                        if (videoSender) {
                            await videoSender.replaceTrack(screenTrack);
                        }
                    }
                }

                // 화면 공유 중단 감지
                screenTrack.onended = async () => {
                    await stopScreenSharing();
                };

                setIsScreenSharing(true);
            } else {
                await stopScreenSharing();
            }
        } catch (error) {
            console.error('Screen sharing error:', error);
            await stopScreenSharing();
        }
    }, [isScreenSharing, localStream, peerConnection]);

    const stopScreenSharing = async () => {
        try {
            if (localStream) {
                // 현재 화면 공유 트랙 중지
                const currentTrack = localStream.getVideoTracks()[0];
                if (currentTrack) {
                    currentTrack.stop();
                    localStream.removeTrack(currentTrack);
                }

                // 원본 비디오 트랙 복구
                if (originalVideoTrack.current) {
                    localStream.addTrack(originalVideoTrack.current);
                } else {
                    // 원본 트랙이 없는 경우 새로 생성
                    const newStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: 'user'
                        }
                    });
                    const newVideoTrack = newStream.getVideoTracks()[0];
                    localStream.addTrack(newVideoTrack);
                }
            }
            setIsScreenSharing(false);
        } catch (error) {
            console.error('Error stopping screen share:', error);
            setIsScreenSharing(false);
        }
    };
    const toggleMute = useCallback(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
                console.log(`Audio track ${track.id} enabled: ${track.enabled}`);
            });
            setIsMuted(!isMuted);
        }
    }, [localStream, isMuted]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
                console.log(`Video track ${track.id} enabled: ${track.enabled}`);
            });
            setIsVideoOff(!isVideoOff);
        }
    }, [localStream, isVideoOff]);

    const cleanup = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
            });
            setLocalStream(null);
        }
        // 화면 공유 정리 추가
        if (originalVideoTrack.current) {
            originalVideoTrack.current.stop();
            originalVideoTrack.current = null;
        }
        setIsScreenSharing(false);
    }, [localStream]);

    return {
        localStream,
        remoteStreams,
        isMuted,
        isVideoOff,
        isScreenSharing,
        localVideoRef,
        initializeStream,
        updateRemoteStream,
        removeRemoteStream,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        cleanup
    };
};