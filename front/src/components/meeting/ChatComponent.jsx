import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Paper,
    Box,
    TextField,
    IconButton,
    Typography,
    List,
    ListItem,
    Drawer,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Send as SendIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { meetingApi } from "../../utils/meetingApi";

const ChatComponent = ({ roomId, websocket, isOpen, onClose, messages }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    ChatComponent.propTypes = {
        roomId: PropTypes.string.isRequired,
        websocket: PropTypes.object.isRequired,
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        messages: PropTypes.array.isRequired
    };

    // 초기 메시지 로드 및 새 메시지 수신 시 스크롤
    useEffect(() => {
        console.log('Messages prop received:', messages);
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !websocket?.current) return;

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            console.log('Sending chat message...');

            const messageData = {
                type: 'chat',
                roomId: roomId,
                data: {
                    content: newMessage.trim(),
                    type: 'TEXT',
                    senderName: userInfo.name || 'Anonymous',
                    senderId: userInfo.employeeId
                }
            };

            console.log('Message data:', messageData);
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
            sx={{
                width: 320,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 320,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Chat</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ m: 1 }}>
                        {error}
                    </Alert>
                )}

                <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {messages.map((message) => {
                        const isMine = message.senderId === JSON.parse(sessionStorage.getItem('userInfo'))?.employeeId;
                        return (
                            <ListItem
                                key={message.id || Math.random()}
                                sx={{
                                    flexDirection: 'column',
                                    alignItems: isMine ? 'flex-end' : 'flex-start',
                                    mb: 1,
                                    padding: 0
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    {message.senderName} • {new Date(message.createdAt).toLocaleTimeString()}
                                </Typography>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1,
                                        mt: 0.5,
                                        bgcolor: isMine ? 'primary.light' : 'background.paper',
                                        color: isMine ? 'white' : 'inherit',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    <Typography variant="body2">{message.content}</Typography>
                                </Paper>
                            </ListItem>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </List>

                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
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
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || loading}
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