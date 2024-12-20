// ChatInput.jsx
import { useState } from "react";
import { useChat } from "./ChatContext";
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/chat.css';

const ChatInput = () => {
    const [message, setMessage] = useState('');
    const { sendMessage, currentRoom } = useChat();
    const [isTyping, setIsTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || !currentRoom) return;

        sendMessage(message.trim());
        setMessage('');
        setIsTyping(false);
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
        setIsTyping(true);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (!currentRoom) return null;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="chat-input-container"
        >
            {isTyping && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="typing-status px-4 py-1 text-xs text-gray-500"
                >
                    입력 중...
                </motion.div>
            )}
            <form onSubmit={handleSubmit} className="p-4 bg-white shadow-lg rounded-t-xl">
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200 pr-12"
                            placeholder="메시지를 입력하세요..."
                            value={message}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!message.trim()}
                        className="send-button"
                    >
                        <span className="sr-only">전송</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default ChatInput;