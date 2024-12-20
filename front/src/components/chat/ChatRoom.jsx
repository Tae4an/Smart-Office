// pages/chat/ChatRoom.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatRoomList from './ChatRoomList';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useChat } from './ChatContext';
import CreateChatRoom from './CreateChatRoom';
import ChatRoomMembers from './ChatRoomMembers';
import '../../styles/chat.css';

const ChatRoom = () => {
    const { fetchRooms, currentRoom } = useChat();

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50">
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 border-r flex flex-col bg-white shadow-md"
            >
                <div className="p-4 border-b bg-gradient-to-r from-primary to-secondary">
                    <CreateChatRoom />
                </div>
                <ChatRoomList />
            </motion.div>

            <AnimatePresence mode="wait">
                {currentRoom ? (
                    <motion.div
                        key="chatContent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="p-4 border-b bg-white shadow-sm">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex justify-between items-center"
                            >
                                <div>
                                    <h2 className="font-bold text-xl text-gray-800">
                                        {currentRoom.type === 'GROUP'
                                            ? currentRoom.roomName
                                            : currentRoom.otherUserName}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {currentRoom.type === 'GROUP' ? '그룹 채팅' : '1:1 채팅'}
                                    </p>
                                </div>
                                <div className="chat-room-actions">
                                    <button className="action-button">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                        <ChatMessages />
                        <ChatInput />
                    </motion.div>
                ) : (
                    <motion.div
                        key="emptyChatContent"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-1 flex items-center justify-center"
                    >
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">채팅방을 선택해주세요</h3>
                            <p className="text-gray-500">왼쪽 채팅방 목록에서 대화할 채팅방을 선택하세요.</p>
                        </div>
                    </motion.div>
                )}
                {currentRoom && <ChatRoomMembers roomId={currentRoom.id} />}
            </AnimatePresence>
        </div>
    );
};

export default ChatRoom;