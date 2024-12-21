// hooks/useChat.jsx
import { useState, useCallback } from 'react';

export const useChat = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [chatMessages, setChatMessages] = useState([]);

    const handleChatMessage = useCallback((message) => {
        // JOIN, LEAVE 타입의 메시지는 무시
        if (!message.data || message.data.type === 'JOIN' || message.data.type === 'LEAVE') {
            return;
        }

        if (!isChatOpen) {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const isMyMessage = message.data.senderId === userInfo?.employeeId;

            if (!isMyMessage) {
                setUnreadMessages(prev => prev + 1);
            }
        }

        setChatMessages(prev => [...prev, message.data]);
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
