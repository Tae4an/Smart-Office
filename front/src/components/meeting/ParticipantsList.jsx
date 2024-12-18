import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Typography,
    Box
} from '@mui/material';
import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import '../../styles/meeting.css';

const ParticipantsList = ({ participants, open, onClose }) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            className="participants-dialog"
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" component="span">
                            참가자 목록
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            component="span"
                            sx={{ ml: 1, color: 'text.secondary' }}
                        >
                            ({participants.length})
                        </Typography>
                    </Box>
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
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
                <List sx={{ pt: 0 }}>
                    {participants.map(participant => {
                        const isCurrentUser = participant.userId === userInfo?.employeeId;
                        return (
                            <ListItem
                                key={participant.userId}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            background: isCurrentUser ? 'var(--gradient)' : undefined
                                        }}
                                    >
                                        {participant.name ? participant.name[0].toUpperCase() : 'U'}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontWeight: isCurrentUser ? 600 : 400,
                                                color: isCurrentUser ? 'primary.main' : 'text.primary'
                                            }}
                                        >
                                            {participant.name || '사용자'}
                                            {isCurrentUser && ' (나)'}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>
        </Dialog>
    );
};

ParticipantsList.propTypes = {
    participants: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,
            name: PropTypes.string
        })
    ).isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ParticipantsList;