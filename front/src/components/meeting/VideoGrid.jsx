// VideoGrid.jsx
import React, {useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import {Box, Typography, Fade} from '@mui/material';
import {Person as PersonIcon} from '@mui/icons-material';
import '../../styles/video.css'

const VideoGrid = ({localStream, remoteStreams, participants, localVideoRef}) => {
    useEffect(() => {
        console.log('VideoGrid rendered with:', {
            hasLocalStream: !!localStream,
            remoteStreamsSize: remoteStreams.size,
            participantsCount: participants.length
        });
    }, [localStream, remoteStreams, participants]);

    const gridClass = useMemo(() => {
        const totalParticipants = participants.length;
        return `video-grid-container grid-${totalParticipants}`;
    }, [participants.length]);

    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));


    return (
        <Fade in={true}>
            <div>
                <Box className={gridClass}>
                    {/* Local Video */}
                    <div className="video-wrapper">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="video-element"
                        />
                        <div className="video-overlay"/>
                        <div className="participant-info">
                            <Typography className="participant-name">
                                <PersonIcon sx={{fontSize: 18}}/>
                                {userInfo?.name || 'You'}
                                <span className="local-indicator">나</span>
                            </Typography>
                        </div>
                    </div>

                    {/* Remote Videos */}
                    {Array.from(remoteStreams).map(([userId, {stream, userName}]) => (
                        <div className="video-wrapper" key={userId}>
                            <video
                                autoPlay
                                playsInline
                                className="video-element"
                                ref={el => {
                                    if (el && stream) {
                                        console.log('Setting remote stream for:', userName);
                                        el.srcObject = stream;
                                        el.play().catch(err => {
                                            console.error('Error playing video:', err);
                                        });
                                    }
                                }}
                            />
                            <div className="video-overlay"/>
                            <div className="participant-info">
                                <Typography className="participant-name">
                                    <PersonIcon sx={{fontSize: 18}}/>
                                    {userName}
                                </Typography>
                            </div>
                        </div>
                    ))}
                </Box>
            </div>
        </Fade>
    );
};

VideoGrid.propTypes = {
    localStream: PropTypes.object,
    remoteStreams: PropTypes.instanceOf(Map).isRequired,
    participants: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,
            name: PropTypes.string
        })
    ).isRequired,
    localVideoRef: PropTypes.object.isRequired
};

export default VideoGrid;