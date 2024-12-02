// components/webrtc/WebRTCComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  IconButton,
  Typography,
  Paper,
  Grid,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CallEnd as CallEndIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { checkWebRTCSupport } from '../../utils/webrtc';
import ChatComponent from './ChatComponent.jsx';
import {api} from "../../utils/api";
import {useNavigate} from "react-router-dom";


const WebRTCComponent = ({ roomId }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const websocket = useRef(null);
  const navigate = useNavigate();

  const configuration = {
    iceServers: [
      {
        urls: process.env.REACT_APP_TURN_SERVER_URL || '',
        username: process.env.REACT_APP_TURN_SERVER_USERNAME || '',
        credential: process.env.REACT_APP_TURN_SERVER_CREDENTIAL || ''
      }
    ]
  };
  // 채팅 토글 핸들러
  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadMessages(0); // 채팅을 열 때 읽지 않은 메시지 카운트 초기화
    }
  };
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Checking WebRTC support...');
        const support = checkWebRTCSupport();

        if (!support.webRTC || !support.getUserMedia) {
          throw new Error('Your browser does not support required WebRTC features');
        }

        console.log('Initializing WebRTC...');

        // WebSocket connection
        websocket.current = new WebSocket('/ws/signaling');

        websocket.current.onopen = () => {
          console.log('WebSocket connected');
          sendSignalingMessage({
            type: 'join',
            roomId
          });
        };

        // Get media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: true
        });

        console.log('Local media stream obtained');
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize RTCPeerConnection
        peerConnection.current = new RTCPeerConnection(configuration);

        // Add local tracks
        stream.getTracks().forEach(track => {
          if (peerConnection.current) {
            console.log('Adding track:', track.kind);
            peerConnection.current.addTrack(track, stream);
          }
        });

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
          console.log('Received remote track:', event.track.kind);
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setRemoteStream(event.streams[0]);
          }
        };

        // ICE candidates
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignalingMessage({
              type: 'ice-candidate',
              data: event.candidate,
              roomId
            });
          }
        };

        // Connection state
        peerConnection.current.onconnectionstatechange = () => {
          console.log('Connection state:', peerConnection.current?.connectionState);
          setIsConnected(peerConnection.current?.connectionState === 'connected');
        };

        // WebSocket message handling
        websocket.current.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Received message:', message.type);

            switch (message.type) {
              case 'offer':
                await handleOffer(message.data);
                break;
              case 'answer':
                await handleAnswer(message.data);
                break;
              case 'ice-candidate':
                await handleIceCandidate(message.data);
                break;
              case 'chat':
                // 채팅이 닫혀있을 때만 읽지 않은 메시지 카운트 증가
                if (!isChatOpen) {
                  setUnreadMessages(prev => prev + 1);
                }
                break;
              default:
                console.log('Unknown message type:', message.type);
            }
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        };



        // Error handling
        websocket.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setInitError('WebSocket connection failed');
        };

      } catch (error) {
        console.error('Error initializing WebRTC:', error);
        setInitError(error.message);
      }
    };

    init();

    return () => cleanup();
  }, [roomId]);

  const cleanup = () => {
    console.log('Cleaning up...');
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
    }
    if (peerConnection.current) {
      console.log('Closing peer connection');
      peerConnection.current.close();
    }
    if (websocket.current) {
      console.log('Closing WebSocket');
      websocket.current.close();
    }
    // 방 나가기 API 호출
    api.leaveRoom(roomId).catch(console.error);
  };

  const sendSignalingMessage = (message) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message.type);
      websocket.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open');
    }
  };

  const handleOffer = async (offer) => {
    try {
      if (peerConnection.current) {
        console.log('Setting remote description (offer)');
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

        console.log('Creating answer');
        const answer = await peerConnection.current.createAnswer();

        console.log('Setting local description (answer)');
        await peerConnection.current.setLocalDescription(answer);

        sendSignalingMessage({
          type: 'answer',
          data: answer,
          roomId
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const startCall = async () => {
    try {
      if (peerConnection.current) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        sendSignalingMessage({
          type: 'offer',
          data: offer,
          roomId
        });

        setIsCallStarted(true);
      }
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const endCall = () => {
    try {
      cleanup();
      setIsCallStarted(false);
      setIsConnected(false);
      setRemoteStream(null);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

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
            <Badge badgeContent={2} color="primary">
              <PeopleIcon />
            </Badge>
            <Tooltip title="Settings">
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ position: 'relative', aspectRatio: '16/9' }}>
              <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
              />
              <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '2px 8px',
                    borderRadius: 1,
                  }}
              >
                You
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ position: 'relative', aspectRatio: '16/9' }}>
              <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
              />
              <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '2px 8px',
                    borderRadius: 1,
                  }}
              >
                Remote User
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mt: 3,
              pb: 2,
            }}
        >
          <IconButton
              onClick={toggleMute}
              color={isMuted ? 'error' : 'primary'}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          <IconButton
              onClick={toggleVideo}
              color={isVideoOff ? 'error' : 'primary'}
          >
            {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
          <IconButton
              onClick={isCallStarted ? endCall : startCall}
              color="error"
          >
            <CallEndIcon />
          </IconButton>
          <IconButton
              color="primary"
              onClick={handleChatToggle}
              sx={{ position: 'relative' }}
          >
            <MessageIcon />
            {unreadMessages > 0 && (
                <Badge
                    badgeContent={unreadMessages}
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                    }}
                />
            )}
          </IconButton>
        </Box>
        <ChatComponent
            roomId={roomId}
            websocket={websocket}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
        />

        <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: 2,
            }}
        >
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