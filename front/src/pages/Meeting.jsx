// Meeting.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box
} from '@mui/material';
import {
    VideoCall as VideoCallIcon,
    List as ListIcon,
} from '@mui/icons-material';
import RoomList from '../components/meeting/RoomList';
import '../styles/pages.css';

const Meeting = () => {
    const navigate = useNavigate();
    const [showRoomList, setShowRoomList] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);

    return (
        <div className="page">
            <Container maxWidth="lg">
                {!showRoomList && !showCreateRoom ? (
                    // 초기 선택 화면
                    <Box sx={{ mt: 8 }}>
                        <Typography variant="h4" align="center" gutterBottom className="text-gradient">
                            화상 회의
                        </Typography>
                        <Typography variant="subtitle1" align="center" sx={{ mb: 6 }}>
                            새로운 회의를 시작하거나 기존 회의에 참여하세요
                        </Typography>
                        <Grid container spacing={4} justifyContent="center">
                            <Grid item xs={12} sm={6} md={5}>
                                <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setShowCreateRoom(true)}>
                                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                        <VideoCallIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom>
                                            새 회의 시작
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            새로운 화상 회의를 생성합니다
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={5}>
                                <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setShowRoomList(true)}>
                                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                        <ListIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom>
                                            회의 참여
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            기존 회의에 참여합니다
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    // RoomList 컴포넌트 또는 CreateRoom 컴포넌트
                    <Box>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setShowRoomList(false);
                                setShowCreateRoom(false);
                            }}
                            sx={{ mb: 3 }}
                        >
                            뒤로 가기
                        </Button>
                        <RoomList
                            mode={showCreateRoom ? 'create' : 'join'}
                            onBack={() => {
                                setShowRoomList(false);
                                setShowCreateRoom(false);
                            }}
                        />
                    </Box>
                )}
            </Container>
        </div>
    );
};

export default Meeting;