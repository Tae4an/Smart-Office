// ChatContext.jsx
import React, {createContext, useContext, useState, useEffect} from 'react';
import axios from 'axios';

const ChatContext = createContext();

export const ChatProvider = ({children}) => {
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // 사용자 정보 로드
    useEffect(() => {
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
            setCurrentUser(JSON.parse(userInfo));
        }
    }, []);

    // 현재 방 변경 로깅
    useEffect(() => {
        console.log('Current Room Changed:', currentRoom);
    }, [currentRoom]);

    // WebSocket 연결 - currentRoom 의존성 제거
    useEffect(() => {
        let ws = null;
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);

            if (message.type === 'CHAT') {

                setMessages(prev => {
                    console.log('Previous messages:', prev);
                    const isDuplicate = prev.some(m =>
                        m.senderId === message.senderId &&
                        m.content === message.content &&
                        m.timestamp === message.timestamp
                    );

                    if (isDuplicate) {
                        console.log('Duplicate message detected');
                        return prev;
                    }

                    console.log('Adding new message to array');
                    const newMessages = [...prev, message];
                    console.log('New messages array:', newMessages);
                    return newMessages;
                });

                // 채팅방 목록 업데이트
                setRooms(prev => prev.map(room => {
                    if (room.id === message.roomId) {
                        return {
                            ...room,
                            lastMessage: message
                        };
                    }
                    return room;
                }));
            }
        };

        const connectWebSocket = () => {
            ws = new WebSocket('/ws/chat');
            console.log('Attempting to connect WebSocket...');

            ws.onopen = () => {
                console.log('WebSocket Connected Successfully');
                setSocket(ws);

                // 연결 성공 후 현재 방이 있다면 ENTER 메시지 전송
                if (currentRoom && currentUser) {
                    const enterMessage = {
                        type: 'ENTER',
                        roomId: currentRoom.id,
                        senderId: currentUser.employeeId,
                        senderName: currentUser.name
                    };
                    ws.send(JSON.stringify(enterMessage));
                }
            };

            ws.onclose = (e) => {
                console.log('WebSocket Disconnected:', e);
                setSocket(null);
                setTimeout(connectWebSocket, 3000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            ws.onmessage = handleMessage;
        };

        connectWebSocket();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []); // 의존성 배열을 비움

    const fetchRooms = async () => {
        try {
            const response = await axios.get('/api/chat/rooms');
            setRooms(response.data);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const messagesResponse = await axios.get(`/api/chat/rooms/${roomId}/messages`);
            const sortedMessages = messagesResponse.data.content
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(sortedMessages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const markAsRead = async (roomId) => {
        try {
            await axios.post(`/api/chat/rooms/${roomId}/read`);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const sendMessage = (content) => {
        if (!currentRoom || !socket || !currentUser) {
            console.log('Missing required data:', {
                currentRoom: !!currentRoom,
                socket: !!socket,
                currentUser: !!currentUser,
                socketState: socket?.readyState
            });
            return;
        }

        const message = {
            type: 'CHAT',
            roomId: currentRoom.id,
            senderId: currentUser.employeeId,
            senderName: currentUser.name,
            content: content,
            timestamp: new Date().toISOString()
        };

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            // 채팅방 목록 업데이트
            setRooms(prev => prev.map(room => {
                if (room.id === currentRoom.id) {
                    return {
                        ...room,
                        lastMessage: message
                    };
                }
                return room;
            }));
        } else {
            console.error('WebSocket is not connected. State:', socket.readyState);
        }
    };

    const enterRoom = async (roomId) => {
        try {
            const roomResponse = await axios.get(`/api/chat/rooms/${roomId}`);
            const roomData = roomResponse.data;
            setCurrentRoom(roomData);
            await fetchMessages(roomId);
            await markAsRead(roomId);

            // 채팅방 목록에서 해당 방의 안 읽은 메시지 수 초기화
            setRooms(prev => prev.map(room => {
                if (room.id === roomId) {
                    return {
                        ...room,
                        unreadCount: 0
                    };
                }
                return room;
            }));

            // ENTER 메시지 전송
            if (socket?.readyState === WebSocket.OPEN && currentUser) {
                const enterMessage = {
                    type: 'ENTER',
                    roomId: roomId,
                    senderId: currentUser.employeeId,
                    senderName: currentUser.name
                };
                socket.send(JSON.stringify(enterMessage));
            }
        } catch (error) {
            console.error('Failed to enter room:', error);
        }
    };

    const createIndividualChat = async (targetEmployeeId) => {
        try {
            const response = await axios.post('/api/chat/rooms/individual', null, {
                params: { targetEmployeeId }
            });
            await enterRoom(response.data.id);
        } catch (error) {
            console.error('Failed to create individual chat:', error);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                rooms,
                currentRoom,
                messages,
                currentUser,
                sendMessage,
                enterRoom,
                fetchRooms,
                createIndividualChat
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);