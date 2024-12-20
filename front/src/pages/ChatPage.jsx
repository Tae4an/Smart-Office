import React from 'react';
import { ChatProvider } from '../components/chat/ChatContext';
import ChatRoom from '../components/chat/ChatRoom';

const ChatPage = () => {
    return (
        <ChatProvider>
            <ChatRoom />
        </ChatProvider>
    );
};
export default ChatPage;