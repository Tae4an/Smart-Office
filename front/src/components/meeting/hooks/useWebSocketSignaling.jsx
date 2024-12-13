// hooks/useWebSocketSignaling.jsx
import { useRef, useCallback, useEffect } from 'react';

export const useWebSocketSignaling = (roomId, onMessage, onConnectionReset) => {
    const websocket = useRef(null);

    const sendSignalingMessage = useCallback(async (message) => {
        const maxRetries = 3;
        let retryCount = 0;

        const tryToSend = async () => {
            if (websocket.current?.readyState === WebSocket.OPEN) {
                console.log('[WebSocket] Sending message:', message.type);
                websocket.current.send(JSON.stringify(message));
                return true;
            }

            if (retryCount < maxRetries) {
                console.log(`[WebSocket] Not open, attempt ${retryCount + 1} of ${maxRetries}`);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000));
                connectWebSocket();
                return tryToSend();
            }

            console.error('[WebSocket] Failed to send message after retries');
            return false;
        };

        return tryToSend();
    }, []);

    const connectWebSocket = useCallback(() => {
        if (websocket.current?.readyState === WebSocket.OPEN) {
            console.log('[WebSocket] Already connected');
            return;
        }

        console.log('[WebSocket] Connecting...');
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        websocket.current = new WebSocket(`/ws/signaling?userId=${userInfo?.employeeId}`);

        websocket.current.onopen = () => {
            console.log('[WebSocket] Connected successfully');
            sendSignalingMessage({
                type: 'join',
                roomId,
                data: {
                    userId: userInfo?.employeeId,
                    name: userInfo?.name
                }
            });
        };

        websocket.current.onmessage = onMessage;

        websocket.current.onclose = async (event) => {
            console.log('[WebSocket] Closed:', event.code, event.reason);
            if (event.code !== 1000 && event.code !== 1001) {
                console.log('[WebSocket] Abnormal closure, attempting reset...');
                if (onConnectionReset) {
                    console.log('[WebSocket] Resetting peer connection...');
                    await onConnectionReset();
                }
                console.log('[WebSocket] Scheduling reconnection...');
                setTimeout(connectWebSocket, 3000);
            }
        };

        websocket.current.onerror = (error) => {
            console.error('[WebSocket] Error occurred:', error);
        };
    }, [roomId, onMessage, onConnectionReset, sendSignalingMessage]);

    useEffect(() => {
        return () => {
            if (websocket.current) {
                console.log('[WebSocket] Cleaning up connection');
                websocket.current.close(1000, 'Component unmounting');
            }
        };
    }, []);

    return {
        websocket,
        sendSignalingMessage,
        connectWebSocket
    };
};