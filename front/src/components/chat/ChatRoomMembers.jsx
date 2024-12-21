// components/chat/ChatRoomMembers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../../styles/chat.css';

const ChatRoomMembers = ({ roomId }) => {
    const [members, setMembers] = useState([]);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`/api/chat/rooms/${roomId}/members`);
                setMembers(response.data);
            } catch (error) {
                console.error('멤버 조회 실패:', error);
            }
        };

        if (roomId) {
            fetchMembers();
        }
    }, [roomId]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { x: 20, opacity: 0 },
        show: { x: 0, opacity: 1 }
    };

    return (
        <div className="border-l w-64 bg-white shadow-inner">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-b bg-gradient-to-r from-primary to-secondary"
            >
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-black">채팅방 멤버 ({members.length})</h3>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-black hover:bg-white/20 rounded-full p-1 transition-all duration-200"
                    >
                        <svg
                            className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </motion.div>

            {isExpanded && (
                <motion.ul
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto messages-container"
                >
                    {members.map(member => (
                        <motion.li
                            key={member.id}
                            variants={item}
                            className="group py-2 px-3 flex items-center gap-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-black shadow-md">
                                    {member.name.charAt(0)}
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{member.name}</p>
                                <p className="text-xs text-gray-600">
                                    참여자
                                </p>
                            </div>
                        </motion.li>
                    ))}
                </motion.ul>
            )}
        </div>
    );
};

export default ChatRoomMembers;