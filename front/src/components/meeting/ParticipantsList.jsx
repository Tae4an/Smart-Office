// components/ParticipantsList.jsx
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
    IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ParticipantsList = ({ participants, open, onClose }) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                참가자 목록
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <List>
                    {participants.map(participant => (
                        <ListItem key={participant.userId}>
                            <ListItemAvatar>
                                <Avatar>
                                    {participant.name ? participant.name[0] : 'U'}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={participant.name || '사용자'}
                                secondary={participant.userId === userInfo?.employeeId ? '(나)' : ''}
                            />
                        </ListItem>
                    ))}
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