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
    Box,
    IconButton,
} from '@mui/material';
import {
    VideoCall as VideoCallIcon,
    List as ListIcon,
    ArrowBack as ArrowBackIcon
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
                    <Box
                        sx={{
                            mt: 8,
                            position: 'relative',
                            zIndex: 1,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -100,
                                right: -100,
                                width: 200,
                                height: 200,
                                background: 'var(--primary-gradient)',
                                borderRadius: '50%',
                                filter: 'blur(80px)',
                                opacity: 0.1,
                                zIndex: 0
                            },
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -150,
                                left: -100,
                                width: 250,
                                height: 250,
                                background: 'var(--secondary-gradient)',
                                borderRadius: '50%',
                                filter: 'blur(90px)',
                                opacity: 0.08,
                                zIndex: 0
                            }
                        }}
                    >
                        <Typography
                            variant="h4"
                            align="center"
                            gutterBottom
                            className="text-gradient"
                            sx={{ fontWeight: 700, mb: 2 }}
                        >
                            화상 회의
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            align="center"
                            sx={{
                                mb: 6,
                                color: 'var(--text-secondary)',
                                maxWidth: '600px',
                                mx: 'auto'
                            }}
                        >
                            새로운 회의를 시작하거나 기존 회의에 참여하세요
                        </Typography>
                        <Grid container spacing={4} justifyContent="center">
                            <Grid item xs={12} sm={6} md={5}>
                                <Card
                                    className="glass-card"
                                    sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)'
                                    }}
                                    onClick={() => setShowCreateRoom(true)}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                background: 'var(--primary-gradient)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 24px auto'
                                            }}
                                        >
                                            <VideoCallIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                            새 회의 시작
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                            새로운 화상 회의를 생성합니다
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={5}>
                                <Card
                                    className="glass-card"
                                    sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)'
                                    }}
                                    onClick={() => setShowRoomList(true)}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                background: 'var(--secondary-gradient)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 24px auto'
                                            }}
                                        >
                                            <ListIcon sx={{ fontSize: 40, color: 'white' }} />
                                        </Box>
                                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                            회의 참여
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                            기존 회의에 참여합니다
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Box sx={{ pt: 4 }}>
                        <IconButton
                            onClick={() => {
                                setShowRoomList(false);
                                setShowCreateRoom(false);
                            }}
                            sx={{
                                mb: 3,
                                color: 'var(--text-primary)',
                                '&:hover': {
                                    background: 'rgba(99, 102, 241, 0.04)'
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
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