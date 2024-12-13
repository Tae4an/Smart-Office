// components/ControlBar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Badge } from '@mui/material';
import {
    Mic as MicIcon,
    MicOff as MicOffIcon,
    Videocam as VideocamIcon,
    VideocamOff as VideocamOffIcon,
    CallEnd as CallEndIcon,
    Message as MessageIcon
} from '@mui/icons-material';

import ParticipantsList from './ParticipantsList';
import VideoGrid from './VideoGrid';
const ControlBar = ({
                        isMuted,
                        isVideoOff,
                        onToggleMute,
                        onToggleVideo,
                        onEndCall,
                        onChatToggle,
                        unreadMessages
                    }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, pb: 2 }}>
            <IconButton
                onClick={onToggleMute}
                color={isMuted ? 'error' : 'primary'}
            >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton
                onClick={onToggleVideo}
                color={isVideoOff ? 'error' : 'primary'}
            >
                {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
            </IconButton>
            <IconButton
                onClick={onEndCall}
                color="error"
            >
                <CallEndIcon />
            </IconButton>
            <IconButton
                color="primary"
                onClick={onChatToggle}
                sx={{ position: 'relative' }}
            >
                <MessageIcon />
                {unreadMessages > 0 && (
                    <Badge
                        badgeContent={unreadMessages}
                        color="error"
                        sx={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                        }}
                    />
                )}
            </IconButton>
        </Box>
    );
};

ControlBar.propTypes = {
    isMuted: PropTypes.bool.isRequired,
    isVideoOff: PropTypes.bool.isRequired,
    onToggleMute: PropTypes.func.isRequired,
    onToggleVideo: PropTypes.func.isRequired,
    onEndCall: PropTypes.func.isRequired,
    onChatToggle: PropTypes.func.isRequired,
    unreadMessages: PropTypes.number.isRequired
};

export default ControlBar;

