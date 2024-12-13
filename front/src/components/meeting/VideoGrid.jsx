// VideoGrid.jsx
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper, Typography } from '@mui/material';

const VideoGrid = ({ localStream, remoteStreams, participants, localVideoRef }) => {
    // 디버깅을 위한 useEffect 추가
    useEffect(() => {
        console.log('VideoGrid rendered with:', {
            hasLocalStream: !!localStream,
            remoteStreamsSize: remoteStreams.size,
            remoteStreamsEntries: Array.from(remoteStreams.entries()),
            participantsCount: participants.length,
            participants
        });
    }, [localStream, remoteStreams, participants]);

    console.log('VideoGrid render:', {
        remoteStreamsArray: Array.from(remoteStreams.entries())
    });

    return (
        <Grid container spacing={2}>
            {/* 로컬 비디오 */}
            <Grid item xs={12} md={participants.length <= 1 ? 12 : 6} lg={participants.length <= 2 ? 6 : 4}>
                <Paper sx={{ position: 'relative', aspectRatio: '16/9' }}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    <Typography
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: '2px 8px',
                            borderRadius: 1,
                        }}
                    >
                        {JSON.parse(sessionStorage.getItem('userInfo'))?.name || 'You'} (나)
                    </Typography>
                </Paper>
            </Grid>

            {/* 원격 비디오들 */}
            {Array.from(remoteStreams).map(([userId, {stream, userName}]) => {
                console.log('Rendering remote video for:', userId, userName, stream);
                return (
                    <Grid
                        item
                        xs={12}
                        md={participants.length <= 2 ? 6 : 4}
                        lg={participants.length <= 2 ? 6 : 4}
                        key={userId}
                    >
                        <Paper sx={{ position: 'relative', aspectRatio: '16/9' }}>
                            <video
                                autoPlay
                                playsInline
                                ref={el => {
                                    if (el && stream) {
                                        console.log('Setting stream:', {
                                            id: stream.id,
                                            active: stream.active,
                                            trackCount: stream.getTracks().length,
                                            tracks: stream.getTracks().map(t => ({
                                                kind: t.kind,
                                                enabled: t.enabled,
                                                muted: t.muted
                                            }))
                                        });
                                        el.srcObject = stream;
                                        // 스트림 재생 시도
                                        el.play().catch(err => {
                                            console.error('Error playing video:', err);
                                        });
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    left: 8,
                                    color: 'white',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    padding: '2px 8px',
                                    borderRadius: 1,
                                }}
                            >
                                {userName}
                            </Typography>
                        </Paper>
                    </Grid>
                );
            })}
        </Grid>
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