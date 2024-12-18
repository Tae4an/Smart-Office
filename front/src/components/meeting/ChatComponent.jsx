import React, { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    TextField,
    IconButton,
    Typography,
    List,
    ListItem,
    Drawer,
    CircularProgress,
    Alert,
    Fade
} from '@mui/material';
import {
    Send as SendIcon,
    Close as CloseIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import '../../styles/chat.css';

// 메시지 컴포넌트 분리 및 메모이제이션
const ChatMessage = memo(({ message, isMine }) => (
    <ListItem
        sx={{
            flexDirection: 'column',
            alignItems: isMine ? 'flex-end' : 'flex-start',
            p: 0,
            mb: 2
        }}
    >
        <Typography
            variant="caption"
            sx={{
                color: 'text.secondary',
                mb: 0.5,
                px: 1
            }}
        >
            {message.senderName} • {new Date(message.createdAt).toLocaleTimeString()}
        </Typography>
        <Box
            className={`message-bubble ${isMine ? 'mine' : 'others'}`}
        >
            <Typography variant="body2">
                {message.content}
            </Typography>
        </Box>
    </ListItem>
));

ChatMessage.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.string,
        content: PropTypes.string.isRequired,
        senderName: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        senderId: PropTypes.string.isRequired
    }).isRequired,
    isMine: PropTypes.bool.isRequired
};

const ChatComponent = ({ roomId, websocket, isOpen, onClose, messages }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const userInfo = useRef(JSON.parse(sessionStorage.getItem('userInfo')));

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !websocket?.current) return;

        try {
            const messageData = {
                type: 'chat',
                roomId: roomId,
                data: {
                    content: newMessage.trim(),
                    type: 'TEXT',
                    senderName: userInfo.current.name || 'Anonymous',
                    senderId: userInfo.current.employeeId
                }
            };

            websocket.current.send(JSON.stringify(messageData));
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
            setError('메시지 전송에 실패했습니다.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Drawer
            anchor="right"
            open={isOpen}
            onClose={onClose}
            variant="persistent"
            className="chat-drawer"
            sx={{
                width: 320,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 320,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <Box className="chat-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                            채팅
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                '&:hover': {
                                    background: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>

                {error && (
                    <Fade in={true}>
                        <Alert
                            severity="error"
                            onClose={() => setError(null)}
                            sx={{
                                m: 1,
                                borderRadius: '8px'
                            }}
                        >
                            {error}
                        </Alert>
                    </Fade>
                )}

                <List className="chat-messages">
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {messages.map((message) => {
                        const isMine = message.senderId === userInfo.current?.employeeId;
                        const messageKey = message.id || `${message.senderId}-${message.createdAt}-${message.content}`;

                        return (
                            <ChatMessage
                                key={messageKey}
                                message={message}
                                isMine={isMine}
                            />
                        );
                    })}
                    <div ref={messagesEndRef} />
                </List>

                <Box className="chat-input-container">
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="메시지를 입력하세요..."
                        variant="outlined"
                        size="small"
                        className="chat-input"
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || loading}
                                    className="send-button"
                                    sx={{ mr: 1 }}
                                >
                                    <SendIcon />
                                </IconButton>
                            )
                        }}
                    />
                </Box>
            </Box>
        </Drawer>
    );
};

ChatComponent.propTypes = {
    roomId: PropTypes.string.isRequired,
    websocket: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    messages: PropTypes.array.isRequired
};

export default ChatComponent;