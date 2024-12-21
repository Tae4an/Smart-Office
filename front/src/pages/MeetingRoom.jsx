import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Fade
} from '@mui/material';
import WebRTCComponent from '../components/meeting/WebRTCComponent';
import { meetingApi } from '../utils/meetingApi';
import '../styles/meetingRoom.css'

const MeetingRoom = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roomAccess, setRoomAccess] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);

    useEffect(() => {
        const checkRoomAccess = async () => {
            if (!state?.roomId) {
                navigate('/meeting', { replace: true });
                return;
            }

            try {
                setIsLoading(true);
                const roomDetails = await meetingApi.getRoomDetails(state.roomId);

                if (roomDetails) {
                    setRoomAccess(true);
                } else {
                    setError('접근 권한이 없는 회의방입니다.');
                    setTimeout(() => navigate('/meeting'), 3000);
                }
            } catch (error) {
                console.error('회의방 접근 확인 실패:', error);
                setError(error.message || '회의방 접속 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        checkRoomAccess();

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            handleLeaveRoom();
        };
    }, [state, navigate]);

    const handleLeaveRoom = async () => {
        try {
            if (state?.roomId) {
                await meetingApi.leaveRoom(state.roomId);
            }
            navigate('/meeting');
        } catch (error) {
            console.error('회의방 나가기 실패:', error);
        }
    };

    if (isLoading) {
        return (
            <Fade in={true}>
                <Box className="loading-container">
                    <CircularProgress className="loading-spinner" size={48} />
                </Box>
            </Fade>
        );
    }

    if (error) {
        return (
            <Fade in={true}>
                <Box className="error-container">
                    <Alert severity="error" className="error-alert">
                        {error}
                    </Alert>
                </Box>
            </Fade>
        );
    }

    if (!roomAccess) {
        return null;
    }

    return (
        <Fade in={true}>
            <div className="meeting-room-container">
                <Box className="meeting-room">
                    <Container maxWidth="xl">
                        {roomAccess && (
                            <WebRTCComponent
                                roomId={state.roomId}
                                roomName={state.roomName}
                                onError={(error) => setError(error)}
                            />
                        )}
                    </Container>
                </Box>

                <Dialog
                    open={showLeaveDialog}
                    onClose={() => setShowLeaveDialog(false)}
                    className="meeting-dialog"
                    PaperProps={{
                        className: "meeting-dialog"
                    }}
                >
                    <DialogTitle className="dialog-title">
                        회의방 나가기
                    </DialogTitle>
                    <DialogContent className="dialog-content">
                        <Typography>
                            정말로 회의방을 나가시겠습니까?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowLeaveDialog(false)}
                            className="dialog-button"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleLeaveRoom}
                            className="dialog-button danger"
                        >
                            나가기
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Fade>
    );
};

export default MeetingRoom;