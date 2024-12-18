import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Box,
    CircularProgress,
    IconButton,
    Alert,
    Snackbar,
    Tooltip
} from '@mui/material';
import {
    Lock as LockIcon,
    People as PeopleIcon,
    Description as DescriptionIcon,
    Add as AddIcon,
    VideoCall as VideoCallIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { meetingApi } from '../../utils/meetingApi';
import { useNavigate } from 'react-router-dom';
import '../../styles/roomList.css';

const RoomList = ({ mode = 'join', onBack }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(mode === 'join');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [newRoom, setNewRoom] = useState({
        roomName: '',
        description: '',
        maxParticipants: 2,
        password: ''
    });
    const [joinPassword, setJoinPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (mode === 'join') {
            fetchRooms();
            const interval = setInterval(fetchRooms, 5000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [mode]);

    const validateRoomInput = () => {
        if (!newRoom.roomName.trim()) {
            setError('Room name is required');
            return false;
        }
        if (newRoom.roomName.length < 3) {
            setError('Room name must be at least 3 characters');
            return false;
        }
        if (newRoom.password && newRoom.password.length < 4) {
            setError('Password must be at least 4 characters');
            return false;
        }
        return true;
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await meetingApi.getRooms();
            setRooms(data);
        } catch (error) {
            setError('Error fetching rooms: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!validateRoomInput()) {
            return;
        }

        try {
            setLoading(true);
            const response = await meetingApi.createRoom(newRoom);

            if (response && response.roomId) {
                setSuccessMessage('회의방이 생성되었습니다.');
                setTimeout(() => {
                    navigate('/meetingRoom', {
                        state: {
                            roomId: response.roomId,
                            roomName: newRoom.roomName
                        }
                    });
                }, 1500);
            } else {
                throw new Error('회의방 생성에 실패했습니다.');
            }
        } catch (error) {
            setError(error.message || '회의방 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (room) => {
        try {
            const response = await meetingApi.joinRoom(room.roomId, {
                password: room.hasPassword ? joinPassword : undefined
            });
            if (response.success) {
                setSuccessMessage('회의방에 입장합니다...');
                navigate('/meetingRoom', {
                    state: {
                        roomId: room.roomId,
                        roomName: room.roomName
                    }
                });
            }
        } catch (error) {
            setError(error.message || '회의방 입장에 실패했습니다.');
        } finally {
            setPasswordDialogOpen(false);
            setJoinPassword('');
            setSelectedRoom(null);
            setLoading(false);
        }
    };

    if (loading && mode === 'join' && rooms.length === 0) {
        return (
            <Box className="loading-container">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="content-wrapper">
            <Box className="meeting-header-container">
                <Typography variant="h4" className="text-gradient header-title">
                    <VideoCallIcon />
                    {mode === 'create' ? '새 회의 만들기' : '회의 참여하기'}
                </Typography>
                {mode === 'join' && (
                    <Typography variant="subtitle1" className="header-subtitle">
                        현재 진행 중인 회의 목록입니다. 참여하고 싶은 회의를 선택하세요.
                    </Typography>
                )}
            </Box>

            {mode === 'create' ? (
                <Box component="form" className="create-room-form" onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateRoom();
                }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label="회의 이름"
                        value={newRoom.roomName}
                        onChange={(e) => setNewRoom({ ...newRoom, roomName: e.target.value })}
                        margin="normal"
                        error={newRoom.roomName.length > 0 && newRoom.roomName.length < 3}
                        helperText={
                            newRoom.roomName.length > 0 && newRoom.roomName.length < 3
                                ? '회의 이름은 최소 3자 이상이어야 합니다'
                                : ''
                        }
                        className="room-input"
                    />
                    <FormControl fullWidth margin="normal" className="room-input">
                        <InputLabel>최대 참가자 수</InputLabel>
                        <Select
                            value={newRoom.maxParticipants}
                            label="최대 참가자 수"
                            onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: Number(e.target.value) })}
                        >
                            {[2, 3, 4, 5, 6].map((num) => (
                                <MenuItem key={num} value={num}>{num}명</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="비밀번호"
                        type="password"
                        value={newRoom.password}
                        onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                        margin="normal"
                        error={newRoom.password.length > 0 && newRoom.password.length < 4}
                        helperText={
                            newRoom.password.length > 0 && newRoom.password.length < 4
                                ? '비밀번호는 최소 4자 이상이어야 합니다'
                                : ''
                        }
                        className="room-input"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading || newRoom.roomName.length < 3 || (newRoom.password.length > 0 && newRoom.password.length < 4)}
                        className="create-button"
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Box className="button-content">
                                <AddIcon /> 회의 만들기
                            </Box>
                        )}
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {rooms.length === 0 ? (
                        <Grid item xs={12}>
                            <Box className="empty-room-container">
                                <Typography variant="h6" className="empty-room-text">
                                    현재 진행 중인 회의가 없습니다
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/meeting/create')}
                                    className="create-meeting-button"
                                >
                                    새 회의 만들기
                                </Button>
                            </Box>
                        </Grid>
                    ) : (
                        rooms.map((room) => (
                            <Grid item xs={12} sm={6} md={4} key={room.roomId}>
                                <Card className="room-card">
                                    <Box className="room-card-header">
                                        <Box className="room-title-container">
                                            <Typography variant="h6" className="room-title">
                                                {room.roomName}
                                            </Typography>
                                            {room.hasPassword && (
                                                <Tooltip title="비밀번호가 설정된 회의입니다">
                                                    <IconButton size="small">
                                                        <LockIcon className="lock-icon" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Box>
                                    <CardContent className="room-info">
                                        {room.description && (
                                            <Box className="room-info-item">
                                                <DescriptionIcon />
                                                <Typography>{room.description}</Typography>
                                            </Box>
                                        )}
                                        <Box className="room-info-item">
                                            <PeopleIcon />
                                            <Typography>
                                                {room.currentParticipants}/{room.maxParticipants}명
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            className="room-join-button"
                                            onClick={() => {
                                                if (room.hasPassword) {
                                                    setSelectedRoom(room);
                                                    setPasswordDialogOpen(true);
                                                } else {
                                                    handleJoinRoom(room);
                                                }
                                            }}
                                            disabled={room.currentParticipants >= room.maxParticipants}
                                            endIcon={<ArrowForwardIcon />}
                                        >
                                            {room.currentParticipants >= room.maxParticipants ? '정원 초과' : '참여하기'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            <Dialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                className="password-dialog"
            >
                <DialogTitle className="password-dialog-title">
                    회의실 비밀번호 입력
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="비밀번호"
                        type="password"
                        fullWidth
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && selectedRoom) {
                                handleJoinRoom(selectedRoom);
                            }
                        }}
                        className="password-input"
                    />
                </DialogContent>
                <DialogActions className="dialog-actions">
                    <Button
                        onClick={() => setPasswordDialogOpen(false)}
                        className="cancel-button"
                    >
                        취소
                    </Button>
                    <Button
                        onClick={() => selectedRoom && handleJoinRoom(selectedRoom)}
                        variant="contained"
                        disabled={loading}
                        className="join-button"
                    >
                        {loading ? <CircularProgress size={24} /> : '입장'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity="error"
                    onClose={() => setError('')}
                    variant="filled"
                    className="alert error"
                >
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity="success"
                    onClose={() => setSuccessMessage('')}
                    variant="filled"
                    className="alert success"
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

RoomList.propTypes = {
    mode: PropTypes.oneOf(['create', 'join']),
    onBack: PropTypes.func
};

export default RoomList;