// WebRTCComponent.jsx
import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useNavigate} from "react-router-dom";
import {Badge, Box, Container, IconButton, Paper, Tooltip, Typography} from '@mui/material';
import {People as PeopleIcon, Settings as SettingsIcon} from '@mui/icons-material';

import {useWebRTC} from './hooks/useWebRTC';
import {useMediaStream} from './hooks/useMediaStream';
import {useWebSocketSignaling} from './hooks/useWebSocketSignaling';
import {useParticipants} from './hooks/useParticipants';
import {useChat} from './hooks/useChat';
import VideoGrid from './VideoGrid';
import ControlBar from './ControlBar';
import ParticipantsList from './ParticipantsList';
import ChatComponent from './ChatComponent';
import {checkWebRTCSupport} from '../../utils/webrtc';
import {meetingApi} from "../../utils/meetingApi";

const WebRTCComponent = ({ roomId }) => {
    const navigate = useNavigate();
    const [initError, setInitError] = useState(null);
    const handleWebSocketMessageType = useRef(null);
    const isInitialized = useRef(false);
    const isCleaningUp = useRef(false);
    const userInfoStr = sessionStorage.getItem('userInfo');
    const userInfo = JSON.parse(userInfoStr);
    const participantsRef = useRef([]);

    const configuration = {
        iceServers: [{
            url: process.env.REACT_APP_TURN_SERVER_URL,
            username: process.env.REACT_APP_TURN_USERNAME,
            credential: process.env.REACT_APP_TURN_PASSWORD
        }]
    };

    const {
        localStream, remoteStreams, isMuted, isVideoOff, localVideoRef,
        initializeStream, updateRemoteStream, removeRemoteStream,
        toggleMute, toggleVideo, cleanup: cleanupMedia
    } = useMediaStream();

    const {
        participants, showParticipants, setShowParticipants,
        handleParticipantUpdate, handleParticipantsList
    } = useParticipants(removeRemoteStream);

    const {
        isChatOpen, setIsChatOpen, unreadMessages,
        chatMessages, handleChatMessage, handleChatToggle
    } = useChat();

    useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);

    const handleTrack = useCallback((event) => {
        console.log('[Track] Event received:', {
            event,
            streams: event.streams,
            tracks: event.track
        });

        // null 체크를 추가하고 안전하게 스트림 접근
        if (!event.streams || !event.streams.length) {
            console.warn('[Track] No streams available in track event');
            return;
        }

        const stream = event.streams[0];  // 구조분해할당 대신 직접 접근
        const senderId = event.senderId;  // enhanced event에서 가져옴

        console.log('[Track] Processing track:', {
            stream: {
                id: stream.id,
                active: stream.active,
                tracks: stream.getTracks().map(t => ({
                    kind: t.kind,
                    id: t.id,
                    enabled: t.enabled
                }))
            },
            senderId,
            participants
        });

        if (!senderId) {
            console.warn('[Track] No senderId found in track event');
            return;
        }

        const participant = participantsRef.current.find(p => p.userId === senderId);
        if (!participant) {
            console.warn('[Track] No participant found for senderId:', senderId);
            return;
        }

        console.log('[Track] Updating remote stream for:', {
            userId: participant.userId,
            name: participant.name,
            streamTracks: stream?.getTracks().length
        });

        updateRemoteStream(senderId, stream, participant.name);
    }, [updateRemoteStream]);


    const handleIceCandidateFromPeer = useCallback((candidate) => {
        if (sendSignalingMessage) {
            sendSignalingMessage({
                type: 'ice-candidate',
                data: candidate,
                roomId
            });
        }
    }, [roomId]);

    const {
        peerConnection, isConnected, isCallStarted,
        initializePeerConnection, resetPeerConnection,
        handleOffer, handleAnswer, handleIceCandidate,
        startCall, cleanup: cleanupWebRTC
    } = useWebRTC(configuration, handleTrack, handleIceCandidateFromPeer);

    const handleWebSocketMessage = useCallback((event) => {
        try {
            const message = JSON.parse(event.data);
            console.log('[WebSocket] Message received:', message.type);

            if (handleWebSocketMessageType.current) {
                handleWebSocketMessageType.current(message);
            }
        } catch (error) {
            console.error('[WebSocket] Error handling message:', error);
        }
    }, []);

    const { websocket, sendSignalingMessage, connectWebSocket } =
        useWebSocketSignaling(roomId, handleWebSocketMessage, resetPeerConnection);

    useEffect(() => {
        if (isInitialized.current || isCleaningUp.current) {
            return;
        }

        const init = async () => {
            try {
                console.log('[Init] Starting initialization');
                const support = checkWebRTCSupport();
                if (!support.webRTC || !support.getUserMedia) {
                    throw new Error('Your browser does not support required WebRTC features');
                }

                const stream = await initializeStream();
                await initializePeerConnection(stream);
                connectWebSocket();

                isInitialized.current = true;
                console.log('[Init] Initialization completed successfully');
            } catch (error) {
                console.error('[Init] Error during initialization:', error);
                setInitError(error.message);
                isInitialized.current = false;
            }
        };

        init();
    }, [roomId]);

    useEffect(() => {
        return () => {
            if (isInitialized.current && !isCleaningUp.current) {
                isCleaningUp.current = true;
                console.log('[Cleanup] Starting cleanup process');
                cleanup(true);
                isInitialized.current = false;
                isCleaningUp.current = false;
                console.log('[Cleanup] Cleanup completed');
            }
        };
    }, []);

    useEffect(() => {
        if (sendSignalingMessage) {
            const messageHandler = async (message) => {
                try {
                    console.log('[WebSocket] Processing message:', message.type, message);

                    switch (message.type) {
                        case 'participant':
                            console.log('[WebSocket] Processing participant update');
                            handleParticipantUpdate(message.data);

                            // participant 업데이트 후 참가자가 2명 이상이면 call 시작
                            const updatedParticipants = [...participants];
                            if (updatedParticipants.length > 1 && !isCallStarted) {
                                console.log('[WebSocket] Multiple participants detected, initiating call');
                                await startCall(sendSignalingMessage, roomId);
                            }
                            break;

                        case 'participants-list':
                            console.log('[WebSocket] Processing participants list:', message.data);
                            handleParticipantsList(message.data.participants);

                            if (message.data.participants?.length > 1 && !isCallStarted) {
                                console.log('[WebSocket] Initiating call with multiple participants');
                                await startCall(sendSignalingMessage, roomId);
                            }
                            break;

                        case 'offer':
                            console.log('[WebSocket] Processing offer from:', message.senderId);
                            if (peerConnection?.signalingState === 'stable' && localStream) {
                                await handleOffer(
                                    message.data,
                                    message.senderId,
                                    localStream,
                                    async (answer, senderId) => {
                                        await sendSignalingMessage({
                                            type: 'answer',
                                            data: answer,
                                            roomId,
                                            targetSessionId: senderId
                                        });
                                    }
                                );
                            }
                            break;

                        case 'answer':
                            console.log('[WebSocket] Processing answer message');
                            if (peerConnection?.signalingState === 'have-local-offer') {
                                await handleAnswer(message.data, message);
                            }
                            break;

                        case 'ice-candidate':
                            console.log('[WebSocket] Processing ICE candidate');
                            await handleIceCandidate(message.data);
                            break;

                        case 'chat':
                            console.log('[WebSocket] Processing chat message');
                            handleChatMessage(message);
                            break;

                        case 'chat-history':
                            console.log('[WebSocket] Processing chat history');
                            if (message.data.messages) {
                                handleChatMessage({data: message.data.messages});
                            }
                            break;

                        default:
                            console.log('[WebSocket] Unknown message type:', message.type);
                    }
                } catch (error) {
                    console.error('[WebSocket] Error in message handler:', error);
                }
            };
            handleWebSocketMessageType.current = messageHandler;
            console.log('[WebSocket] Message handler setup completed');
        }
    }, [
        sendSignalingMessage, handleOffer, handleAnswer, handleIceCandidate,
        startCall, isCallStarted, peerConnection, localStream, roomId,
        handleParticipantUpdate, handleParticipantsList, participants
    ]);

    const cleanup = useCallback((leaveRoom = true) => {
        if (isCleaningUp.current) return;

        isCleaningUp.current = true;
        console.log('[Cleanup] Starting cleanup');
        cleanupMedia();
        cleanupWebRTC();
        if (leaveRoom) {
            meetingApi.leaveRoom(roomId).catch(error => {
                console.error('[Cleanup] Error leaving room:', error);
            });
        }
        isCleaningUp.current = false;
        console.log('[Cleanup] Completed');
    }, [cleanupMedia, cleanupWebRTC, roomId]);

    const handleEndCall = useCallback(() => {
        cleanup(true);
        navigate('/');
    }, [cleanup, navigate]);

    if (initError) {
        return (
            <Paper sx={{ p: 3, m: 2 }} elevation={3}>
                <Typography variant="h5" color="error" gutterBottom>
                    WebRTC Error
                </Typography>
                <Typography paragraph>{initError}</Typography>
                <Typography variant="subtitle1">
                    Please use a modern browser with camera and microphone support.
                </Typography>
            </Paper>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5">Video Conference</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        Room: {roomId}
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                    <Tooltip title="Participants">
                        <IconButton onClick={() => setShowParticipants(true)}>
                            <Badge badgeContent={participants.length} color="primary">
                                <PeopleIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Settings">
                        <IconButton>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <VideoGrid
                localStream={localStream}
                remoteStreams={remoteStreams}
                participants={participants}
                localVideoRef={localVideoRef}
            />

            <ControlBar
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onEndCall={handleEndCall}
                onChatToggle={handleChatToggle}
                unreadMessages={unreadMessages}
            />

            <ParticipantsList
                participants={participants}
                open={showParticipants}
                onClose={() => setShowParticipants(false)}
            />

            <ChatComponent
                roomId={roomId}
                websocket={websocket}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={chatMessages}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: isConnected ? 'success.main' : 'warning.main',
                    }}
                />
                <Typography variant="body2" color="text.secondary">
                    {isConnected ? 'Connected' : 'Connecting...'}
                </Typography>
            </Box>
        </Container>
    );
};

WebRTCComponent.propTypes = {
    roomId: PropTypes.string.isRequired
};

export default WebRTCComponent;