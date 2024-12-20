// ChatRoomList.jsx
import React from 'react';
import { useChat } from './ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatRoomList = () => {
    const { rooms, currentRoom, enterRoom } = useChat();

    const getTimeString = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        return isToday
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="w-80 border-r flex flex-col bg-white">
            <div className="p-4 bg-gradient-to-r from-primary to-secondary">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    채팅방 목록
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto messages-container">
                <AnimatePresence>
                    {rooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className={`chat-room p-3 cursor-pointer ${currentRoom?.id === room.id ? 'active' : ''}`}
                            onClick={() => enterRoom(room.id)}
                        >
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <div className={`w-12 h-12 ${room.type === 'GROUP' ? 'rounded-xl' : 'rounded-full'} 
                                        bg-gradient-to-r from-primary to-secondary flex items-center justify-center 
                                        text-white font-medium shadow-md`}>
                                        {room.roomName.charAt(0)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-800 truncate pr-2">
                                            {room.roomName}
                                            {room.type === 'GROUP' && (
                                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                    그룹
                                                </span>
                                            )}
                                        </h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {getTimeString(room.lastMessage?.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {room.lastMessage?.content || '새로운 채팅방'}
                                    </p>
                                </div>
                                {room.unreadCount > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex-shrink-0"
                                    >
                                        <span className="unread-count">
                                            {room.unreadCount}
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ChatRoomList;