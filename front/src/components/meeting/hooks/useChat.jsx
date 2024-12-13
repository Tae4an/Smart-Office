// hooks/useChat.jsx
import { useState, useCallback } from 'react';

export const useChat = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [chatMessages, setChatMessages] = useState([]);

    const handleChatMessage = useCallback((message) => {
        if (!isChatOpen && message.data) {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const isSystemMessage = message.data.type === 'JOIN' || message.data.type === 'LEAVE';
            const isMyMessage = message.data.senderId === userInfo?.employeeId;

            if (!isSystemMessage && !isMyMessage) {
                setUnreadMessages(prev => prev + 1);
            }
        }

        if (message.data) {
            setChatMessages(prev => [...prev, message.data]);
        }
    }, [isChatOpen]);

    const handleChatToggle = useCallback(() => {
        setIsChatOpen(prev => !prev);
        if (!isChatOpen) {
            setUnreadMessages(0);
        }
    }, [isChatOpen]);

    return {
        isChatOpen,
        setIsChatOpen,
        unreadMessages,
        setUnreadMessages,
        chatMessages,
        setChatMessages,
        handleChatMessage,
        handleChatToggle
    };
};
