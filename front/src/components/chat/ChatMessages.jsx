// ChatMessages.jsx
import { useEffect, useRef, useMemo } from "react";
import { useChat } from "./ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import '../../styles/chat.css';

const ChatMessages = () => {
    const { messages, currentUser } = useChat();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getMessageDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "오늘";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "어제";
        }
        return date.toLocaleDateString();
    };

    // 메시지를 날짜별로 그룹화
    const groupedMessages = useMemo(() => {
        const filtered = messages.filter(message => message.type === 'CHAT');
        const groups = {};

        filtered.forEach(message => {
            const dateStr = getMessageDate(message.timestamp);
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(message);
        });

        return groups;
    }, [messages]);

    const isConsecutiveMessage = (currentMsg, prevMsg) => {
        if (!prevMsg) return false;
        return currentMsg.senderId === prevMsg.senderId &&
            new Date(currentMsg.timestamp) - new Date(prevMsg.timestamp) < 300000; // 5분 이내
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 messages-container bg-gradient-to-b from-gray-50 to-white">
            <AnimatePresence>
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <motion.div
                        key={date}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="date-divider">
                            <span className="date-text">{date}</span>
                        </div>

                        {dateMessages.map((message, index) => {
                            const prevMessage = dateMessages[index - 1];
                            const isConsecutive = isConsecutiveMessage(message, prevMessage);
                            const showAvatar = !isConsecutive && message.senderId !== currentUser?.employeeId;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    key={message.id || index}
                                    className={`message-wrapper ${
                                        message.senderId === currentUser?.employeeId ? 'sent' : 'received'
                                    } ${isConsecutive ? 'consecutive' : ''}`}
                                >
                                    {showAvatar && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="avatar-container"
                                        >
                                            <div className="message-avatar">
                                                {message.senderName?.charAt(0)}
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className={`message-content ${showAvatar ? '' : 'no-avatar'}`}>
                                        {!isConsecutive && message.senderId !== currentUser?.employeeId && (
                                            <div className="sender-name">
                                                {message.senderName}
                                            </div>
                                        )}

                                        <div className={`message-bubble ${
                                            message.senderId === currentUser?.employeeId ? 'sent' : 'received'
                                        }`}>
                                            <p className="message-text">{message.content}</p>
                                            <div className="message-time">
                                                {new Date(message.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;