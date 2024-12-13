import { useRef, useState, useCallback } from 'react';

export const useWebRTC = (configuration, onTrack, onIceCandidate) => {
    const peerConnection = useRef(null);
    const isInitialized = useRef(false);
    const isCleaningUp = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [pendingCandidates, setPendingCandidates] = useState([]);
    const isResetting = useRef(false);


    // 1. 기본 핸들러 함수들 먼저 정의
    const handleError = useCallback((error) => {
        console.error('[PeerConnection] Error:', error);
        setIsConnected(false);
    }, []);

    const resetPeerConnection = useCallback(async (localStream) => {
        if (isResetting.current) {
            console.log('[PeerConnection] Reset already in progress');
            return peerConnection.current;
        }

        isResetting.current = true;
        console.log('[PeerConnection] Starting reset');

        try {
            // 기존 연결 정리
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }

            // 상태 초기화
            isInitialized.current = false;
            setPendingCandidates([]);
            setIsCallStarted(false);

            return initializePeerConnection(localStream);
        } catch (error) {
            console.error('[PeerConnection] Reset failed:', error);
            throw error;
        } finally {
            isResetting.current = false;
        }
    }, []);

    const retryConnection = useCallback(async () => {
        try {
            if (!isCallStarted) {
                console.log('[PeerConnection] No call started, skipping retry');
                return;
            }

            if (peerConnection.current && peerConnection.current.iceConnectionState !== 'closed') {
                console.log('[PeerConnection] Attempting ICE restart');
                await peerConnection.current.restartIce();
                console.log('[ICE] Restart initiated');
            } else {
                console.log('[PeerConnection] Connection closed, resetting connection');
                await resetPeerConnection();
            }
        } catch (error) {
            console.error('[PeerConnection] Retry failed:', error);
        }
    }, [isCallStarted, resetPeerConnection]);

    // 2. 리스너 설정 함수
    const setupPeerConnectionListeners = useCallback(() => {
        if (!peerConnection.current) return;

        peerConnection.current.oniceconnectionstatechange = () => {
            const state = peerConnection.current.iceConnectionState;
            console.log('[ICE] Connection state changed:', state);

            if (state === 'failed' || state === 'disconnected') {
                console.log(`[ICE] Connection ${state} - attempting recovery...`);
                retryConnection();
            } else if (state === 'connected') {
                console.log('[ICE] Connection established');
                setIsConnected(true);
            }
        };

        peerConnection.current.onconnectionstatechange = () => {
            const state = peerConnection.current.connectionState;
            console.log('[PeerConnection] State changed:', state);
            setIsConnected(state === 'connected');
        };

        peerConnection.current.ontrack = (event) => {
            console.log('[PeerConnection] Track received:', {
                kind: event.track.kind,
                streamId: event.streams[0]?.id,
                trackId: event.track.id,
                senderId: peerConnection.current.senderId
            });

            const enhancedEvent = {
                ...event,
                senderId: peerConnection.current.senderId,
                streams: event.streams,   // 원본 streams 전달
                track: event.track       // 원본 track 전달
            };
            onTrack(enhancedEvent);
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('[ICE] New candidate:', {
                    type: event.candidate.type,
                    protocol: event.candidate.protocol,
                    address: event.candidate.address
                });
                onIceCandidate(event.candidate);
            }
        };

        peerConnection.current.onnegotiationneeded = () => {
            console.log('[PeerConnection] Negotiation needed');
        };
    }, [onTrack, onIceCandidate, retryConnection]);

    // 3. 초기화 및 메인 기능 함수들
    const initializePeerConnection = useCallback(async (localStream) => {
        if (isInitialized.current) {
            return peerConnection.current;
        }

        try {
            if (peerConnection.current) {
                peerConnection.current.close();
            }

            console.log('[PeerConnection] Creating new connection with config:', configuration);
            peerConnection.current = new RTCPeerConnection(configuration);

            // 트랙 추가 전에 리스너 설정
            setupPeerConnectionListeners();

            if (localStream) {
                console.log('[PeerConnection] Adding local tracks:',
                    localStream.getTracks().map(t => ({
                        kind: t.kind,
                        id: t.id,
                        enabled: t.enabled
                    }))
                );

                localStream.getTracks().forEach(track => {
                    peerConnection.current.addTrack(track, localStream);
                });
            }

            isInitialized.current = true;
            return peerConnection.current;
        } catch (error) {
            console.error('[PeerConnection] Initialization failed:', error);
            isInitialized.current = false;
            throw error;
        }
    }, [configuration, setupPeerConnectionListeners]);

    const startCall = useCallback(async (sendSignalingMessage, roomId) => {
        try {
            if (isCleaningUp.current) {
                console.log('[Call] Cleanup in progress, skipping call start');
                return;
            }

            console.log('[Call] Checking call conditions:', {
                hasPeerConnection: !!peerConnection.current,
                isCallStarted,
                signalingState: peerConnection.current?.signalingState,
                connectionState: peerConnection.current?.connectionState
            });

            if (!peerConnection.current) {
                console.error('[Call] No peer connection available');
                return;
            }

            if (isCallStarted) {
                console.log('[Call] Call already in progress');
                return;
            }

            if (peerConnection.current.signalingState !== 'stable' ||
                peerConnection.current.connectionState === 'failed') {
                console.log('[Call] Resetting unstable connection');
                await resetPeerConnection();
                return;
            }

            console.log('[Call] Creating offer');
            const offer = await peerConnection.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
                iceRestart: true
            });

            console.log('[Call] Setting local description');
            await peerConnection.current.setLocalDescription(offer);

            console.log('[Call] Sending offer via signaling');
            const success = await sendSignalingMessage({
                type: 'offer',
                data: offer,
                roomId
            });

            if (success) {
                setIsCallStarted(true);
                console.log('[Call] Call started successfully');
            } else {
                console.error('[Call] Failed to send offer');
                await resetPeerConnection();
            }
        } catch (error) {
            console.error('[Call] Failed to start call:', error);
            setIsCallStarted(false);
            await resetPeerConnection();
        }
    }, [isCallStarted, resetPeerConnection]);

    const handleOffer = useCallback(async (offer, senderId, localStream, sendAnswer) => {
        try {
            if (!peerConnection.current) return;

            if (isCleaningUp.current) {
                console.log('[Offer] Cleanup in progress, skipping offer handling');
                return;
            }

            if (!peerConnection.current) {
                console.error('[Offer] No peer connection available');
                return;
            }

            console.log('[Offer] Handling offer from:', senderId);
            peerConnection.current.senderId = senderId;

            console.log('[Offer] Setting remote description');
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

            if (!localStream) {
                console.error('[Offer] No local stream available');
                return;
            }

            console.log('[Offer] Creating answer');
            const answer = await peerConnection.current.createAnswer();

            console.log('[Offer] Setting local description');
            await peerConnection.current.setLocalDescription(answer);

            console.log('[Offer] Sending answer');
            await sendAnswer(answer, senderId);

            if (pendingCandidates.length > 0) {
                console.log('[ICE] Processing pending candidates:', pendingCandidates.length);
                for (const candidate of pendingCandidates) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
                setPendingCandidates([]);
            }
        } catch (error) {
            console.error('[Offer] Error handling offer:', error);
        }
    }, [pendingCandidates]);
    const handleAnswer = useCallback(async (answer, message) => {
        try {
            if (isCleaningUp.current) {
                console.log('[Answer] Cleanup in progress, skipping answer handling');
                return;
            }

            if (!peerConnection.current) {
                console.error('[Answer] No peer connection available');
                return;
            }

            const currentState = peerConnection.current.signalingState;
            console.log('[Answer] Current signaling state:', currentState);

            if (currentState === 'have-local-offer') {
                peerConnection.current.senderId = message.senderId;
                console.log('[Answer] Setting sender ID:', message.senderId);

                console.log('[Answer] Setting remote description');
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));

                if (pendingCandidates.length > 0) {
                    console.log('[ICE] Processing pending candidates:', pendingCandidates.length);
                    for (const candidate of pendingCandidates) {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    setPendingCandidates([]);
                }
            } else {
                console.log('[Answer] Ignoring answer in state:', currentState);
            }
        } catch (error) {
            console.error('[Answer] Error handling answer:', error);
        }
    }, [pendingCandidates]);

    const handleIceCandidate = useCallback(async (candidate) => {
        try {
            if (isCleaningUp.current) {
                console.log('[ICE] Cleanup in progress, skipping candidate handling');
                return;
            }

            if (!peerConnection.current) {
                console.warn('[ICE] No peer connection available');
                return;
            }

            const currentState = {
                signalingState: peerConnection.current.signalingState,
                iceConnectionState: peerConnection.current.iceConnectionState,
                connectionState: peerConnection.current.connectionState,
                hasRemoteDescription: !!peerConnection.current.remoteDescription,
                pendingCandidatesCount: pendingCandidates.length
            };

            console.log('[ICE] Current state:', currentState);

            // 여기서 pending candidates 제한을 5로 낮춤
            if (pendingCandidates.length >= 5) {
                console.warn('[ICE] Too many pending candidates, keeping only recent ones');
                setPendingCandidates(prev => prev.slice(-4));  // 최근 4개만 유지
                return;
            }

            // connection failed 상태일 때만 reset
            if (currentState.connectionState === 'failed' ||
                currentState.iceConnectionState === 'failed') {
                console.log('[ICE] Connection failed, resetting...');
                await resetPeerConnection();
                return;
            }

            if (peerConnection.current.remoteDescription) {
                console.log('[ICE] Adding candidate:', {
                    type: candidate.type,
                    protocol: candidate.protocol,
                    address: candidate.address
                });
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                console.log('[ICE] Candidate added successfully');
            } else {
                console.log('[ICE] Queueing candidate for later');
                setPendingCandidates(prev => [...prev, candidate]);
            }
        } catch (error) {
            console.error('[ICE] Error handling candidate:', error);
            if (error.name === 'OperationError') {
                await resetPeerConnection();
            }
        }
    }, [pendingCandidates.length, resetPeerConnection]);

    const cleanup = useCallback(() => {
        if (isCleaningUp.current) return;

        isCleaningUp.current = true;
        console.log('[Cleanup] Starting cleanup');
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setIsConnected(false);
        setIsCallStarted(false);
        isInitialized.current = false;
        setPendingCandidates([]);
        isCleaningUp.current = false;
        console.log('[Cleanup] Completed');
    }, []);

    return {
        peerConnection: peerConnection.current,
        isConnected,
        isCallStarted,
        initializePeerConnection,
        resetPeerConnection,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        startCall,
        cleanup,
        retryConnection
    };
};

export default useWebRTC;