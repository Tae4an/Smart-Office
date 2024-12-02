import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardHeader,
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
    Snackbar
} from '@mui/material';
import {
    Lock as LockIcon,
    Add as AddIcon,
    People as PeopleIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';



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
            const data = await api.getRooms();
            setRooms(data);
        } catch (error) {
            setError('Error fetching rooms: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };
    const handleCreateRoom = async () => {
        console.log('Validating room input:', newRoom);  // 추가
        if (!validateRoomInput()) {
            console.log('Validation failed');  // 추가
            return;
        }

        console.log('Starting room creation...'); // 추가

        try {
            setLoading(true);
            console.log('Room data:', newRoom);

            // 디버깅: API 호출 직전
            console.log('Calling API...');
            const response = await api.createRoom(newRoom);
            console.log('API Response:', response);

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
                console.log('Invalid response:', response);
                throw new Error('회의방 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Detailed error:', error);
            setError(error.message || '회의방 생성에 실패했습니다.');
        } finally {
            console.log('Finishing room creation attempt');
            setLoading(false);
        }
    };

    const handleJoinRoom = async (room) => {
        try {
            const response = await api.joinRoom(room.roomId, {
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
            console.error('Error joining room:', error);
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
            <div className="page">
                <div className="content-wrapper">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            <Box className="content-header" display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" className="text-gradient">
                    {mode === 'create' ? '새 회의 만들기' : '회의 참여하기'}
                </Typography>
            </Box>

            {mode === 'create' ? (
                <Box component="form" onSubmit={(e) => {
                    e.preventDefault();
                    console.log('Form submitted');  // 추가
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
                    />
                    <FormControl fullWidth margin="normal">
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
                        label="비밀번호 (선택사항)"
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
                    />
                    <Button
                        type="submit"  // 변경
                        fullWidth
                        variant="contained"
                        disabled={loading || newRoom.roomName.length < 3 || (newRoom.password.length > 0 && newRoom.password.length < 4)}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : '회의 만들기'}
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {rooms.length === 0 ? (
                        <Grid item xs={12}>
                            <Box textAlign="center" py={4}>
                                <Typography variant="h6" color="text.secondary">
                                    현재 진행 중인 회의가 없습니다
                                </Typography>
                            </Box>
                        </Grid>
                    ) : (
                        rooms.map((room) => (
                            <Grid item xs={12} sm={6} md={4} key={room.roomId}>
                                <Card>
                                    <CardHeader
                                        title={room.roomName}
                                        action={
                                            room.hasPassword && (
                                                <IconButton size="small">
                                                    <LockIcon />
                                                </IconButton>
                                            )
                                        }
                                    />
                                    <CardContent>
                                        {room.description && (
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <DescriptionIcon sx={{ mr: 1 }} />
                                                <Typography color="text.secondary">
                                                    {room.description}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <PeopleIcon sx={{ mr: 1 }} />
                                            <Typography color="text.secondary">
                                                {room.currentParticipants}/{room.maxParticipants}명
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => {
                                                if (room.hasPassword) {
                                                    setSelectedRoom(room);
                                                    setPasswordDialogOpen(true);
                                                } else {
                                                    handleJoinRoom(room);
                                                }
                                            }}
                                            disabled={room.currentParticipants >= room.maxParticipants}
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

            {/* 비밀번호 입력 다이얼로그 */}
            <Dialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>회의실 비밀번호 입력</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        autoFocus
                        margin="dense"
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialogOpen(false)}>취소</Button>
                    <Button
                        onClick={() => selectedRoom && handleJoinRoom(selectedRoom)}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : '입장'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 알림 메시지 */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="error" onClose={() => setError('')} variant="filled">
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => setSuccessMessage('')} variant="filled">
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