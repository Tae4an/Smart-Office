// pages/MeetingRoom.jsx
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
    Alert
} from '@mui/material';
import WebRTCComponent from '../components/meeting/WebRTCComponent';
import { api } from '../utils/api';

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
                // getRoomDetails를 사용하여 회의방 정보와 접근 권한을 한 번에 확인
                const roomDetails = await api.getRoomDetails(state.roomId);

                // 서버에서 받은 roomDetails에 따라 접근 권한 처리
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

        // 페이지 나가기 전 확인
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ''; // Chrome requires returnValue to be set
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
                await api.leaveRoom(state.roomId);
            }
            navigate('/meeting');
        } catch (error) {
            console.error('회의방 나가기 실패:', error);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!roomAccess) {
        return null;
    }

    return (
        <div className="meeting-room-container">
            <Box className="meeting-room">
                <Container maxWidth="xl">
                    <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" gutterBottom>
                            {state?.roomName || '회의방'}
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setShowLeaveDialog(true)}
                        >
                            회의 나가기
                        </Button>
                    </Box>

                    {roomAccess && (
                        <WebRTCComponent
                            roomId={state.roomId}
                            roomName={state.roomName}
                            onError={(error) => setError(error)}
                        />
                    )}
                </Container>
            </Box>

            {/* 회의방 나가기 확인 다이얼로그 */}
            <Dialog open={showLeaveDialog} onClose={() => setShowLeaveDialog(false)}>
                <DialogTitle>회의방 나가기</DialogTitle>
                <DialogContent>
                    <Typography>
                        정말로 회의방을 나가시겠습니까?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowLeaveDialog(false)}>취소</Button>
                    <Button onClick={handleLeaveRoom} color="error">
                        나가기
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MeetingRoom;