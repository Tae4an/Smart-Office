// WebRTCComponent.tsx
// @ts-ignore
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { checkWebRTCSupport } from '../../utils/webrtc.ts';
import '../../styles/webrtc.css';

interface WebRTCComponentProps {
  roomId: string;
}

const WebRTCComponent: React.FC<WebRTCComponentProps> = ({ roomId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);  
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      {
        urls: process.env.REACT_APP_TURN_SERVER_URL || '',
        username: process.env.REACT_APP_TURN_SERVER_USERNAME || '',
        credential: process.env.REACT_APP_TURN_SERVER_CREDENTIAL || ''
      }
    ]
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
        
        // WebSocket 연결
        websocket.current = new WebSocket('/ws/signaling');
        
        websocket.current.onopen = () => {
          console.log('WebSocket connected');
          sendSignalingMessage({
            type: 'join',
            roomId
          });
        };

        // 미디어 스트림 가져오기
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: true
          });
          console.log('Local media stream obtained');
        } catch (mediaError) {
          console.error('Media access error:', mediaError);
          throw new Error('Unable to access camera and microphone');
        }

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // WebRTC Peer Connection 초기화
        peerConnection.current = new RTCPeerConnection(configuration);
        console.log('PeerConnection created with config:', configuration);

        // 로컬 스트림 추가
        stream.getTracks().forEach(track => {
          if (peerConnection.current) {
            console.log('Adding track to peer connection:', track.kind);
            peerConnection.current.addTrack(track, stream);
          }
        });

        // 원격 스트림 처리
        peerConnection.current.ontrack = (event) => {
          console.log('Received remote track:', event.track.kind);
          if (remoteVideoRef.current && event.streams[0]) {
            console.log('Setting remote stream');
            remoteVideoRef.current.srcObject = event.streams[0];
            setRemoteStream(event.streams[0]);
          }
        };

        // ICE 후보 처리
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('Sending ICE candidate');
            sendSignalingMessage({
              type: 'ice-candidate',
              data: event.candidate,
              roomId
            });
          }
        };

        // 연결 상태 모니터링
        peerConnection.current.onconnectionstatechange = () => {
          console.log('Connection state changed:', peerConnection.current?.connectionState);
          setIsConnected(peerConnection.current?.connectionState === 'connected');
        };

        peerConnection.current.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', peerConnection.current?.iceConnectionState);
        };

        // WebSocket 메시지 처리
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
              default:
                console.log('Unknown message type:', message.type);
            }
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        };

        websocket.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        };

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

    // Cleanup
    return () => {
      console.log('Cleaning up...');
      localStream?.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      if (peerConnection.current) {
        console.log('Closing peer connection');
        peerConnection.current.close();
      }
      if (websocket.current) {
        console.log('Closing WebSocket');
        websocket.current.close();
      }
    };
  }, [roomId]);

  const sendSignalingMessage = (message: any) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message.type);
      websocket.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open');
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
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

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnection.current) {
        console.log('Setting remote description (answer)');
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnection.current) {
        console.log('Adding ICE candidate');
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const startCall = async () => {
    try {
      if (peerConnection.current) {
        console.log('Creating offer');
        const offer = await peerConnection.current.createOffer();
        
        console.log('Setting local description (offer)');
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
      localStream?.getTracks().forEach(track => track.stop());
      peerConnection.current?.close();
      setIsCallStarted(false);
      setIsConnected(false);
      setRemoteStream(null);
      console.log('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
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

  if (initError) {
    return (
      <div className="webrtc-error">
        <h2>WebRTC Error</h2>
        <p>{initError}</p>
        <p>Please use a modern browser with camera and microphone support.</p>
        <p>Supported browsers:</p>
        <ul>
          <li>Google Chrome (recommended)</li>
          <li>Mozilla Firefox</li>
          <li>Microsoft Edge</li>
          <li>Safari 11+</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="webrtc-container">
      {/* Header */}
      <div className="conference-header">
        <div className="header-left">
          <h1>Video Conference</h1>
          <span className="room-id">Room: {roomId}</span>
        </div>
        <div className="header-right">
          <div className="participant-count">
            <i className="fas fa-users"></i>
            <span>2 Participants</span>
          </div>
          <button className="icon-button">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>


      {/* Video Grid */}
      <div className="video-grid">
        <div className="video-wrapper">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-stream"
          />
          <div className="video-label">You</div>
        </div>
        <div className="video-wrapper">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-stream"
          />
          <div className="video-label">Remote User</div>
        </div>
      </div>


      {/* Controls */}
      <div className="controls">
        <button
          onClick={toggleMute}
          className={`control-button ${isMuted ? 'active' : ''}`}
        >
          <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
        </button>

        <button
          onClick={toggleVideo}
          className={`control-button ${isVideoOff ? 'active' : ''}`}
        >
          <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
        </button>

        <button
          onClick={isCallStarted ? endCall : startCall}
          className={`control-button ${isCallStarted ? 'end-call' : 'start-call'}`}
        >
          <i className={`fas ${isCallStarted ? 'fa-phone-slash' : 'fa-phone'}`}></i>
        </button>

        <button className="control-button">
          <i className="fas fa-comments"></i>
        </button>
      </div>

      <div className={`connection-status ${isConnected ? 'connected' : ''}`}>
        <i className={`fas ${isConnected ? 'fa-link' : 'fa-spinner fa-spin'}`}></i>
        <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
      </div>
    </div>


    // <div className="webrtc-container">
    //   <div className="video-grid">
    //     <div className="video-wrapper">
    //       <video
    //         ref={localVideoRef}
    //         autoPlay
    //         playsInline
    //         muted
    //         className="video-stream"
    //       />
    //       <div className="video-label">Local Stream</div>
    //     </div>
    //     <div className="video-wrapper">
    //       <video
    //         ref={remoteVideoRef}
    //         autoPlay
    //         playsInline
    //         className="video-stream"
    //       />
    //       <div className="video-label">Remote Stream</div>
    //     </div>
    //   </div>
    //   <div className="controls">
    //     {!isCallStarted ? (
    //       <button 
    //         onClick={startCall}
    //         className="control-button start-call"
    //         disabled={!localStream}
    //       >
    //         Start Call
    //       </button>
    //     ) : (
    //       <button 
    //         onClick={endCall}
    //         className="control-button end-call"
    //       >
    //         End Call
    //       </button>
    //     )}
    //   </div>
    //   <div className="connection-status">
    //     Status: {isConnected ? 'Connected' : 'Disconnected'}
    //   </div>
    // </div>
  );
};

export default WebRTCComponent;