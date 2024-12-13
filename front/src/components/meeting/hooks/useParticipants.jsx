// hooks/useParticipants.jsx
import { useState, useCallback } from 'react';

export const useParticipants = (onParticipantStreamRemoved) => {
    const [participants, setParticipants] = useState([]);
    const [showParticipants, setShowParticipants] = useState(false);

    const handleParticipantUpdate = useCallback((data) => {
        console.log('[Participants] Update received:', data);
        const { userId, action, name } = data;

        setParticipants(prev => {
            let updated;
            if (action === 'joined') {
                // 이미 존재하는 참가자는 추가하지 않음
                if (prev.some(p => p.userId === userId)) {
                    return prev;
                }
                updated = [...prev, { userId, name: name || 'Unknown User' }];
            } else if (action === 'left') {
                updated = prev.filter(p => p.userId !== userId);
            } else {
                return prev;
            }
            console.log('[Participants] Updated list:', updated);
            return updated;
        });
    }, [onParticipantStreamRemoved]);

    const handleParticipantsList = useCallback((participants) => {
        if (participants) {
            console.log('[Participants] Before update:', participants);
            setParticipants(participants);
            console.log('[Participants] After update:', participants);
        }
    }, []);

    return {
        participants,
        showParticipants,
        setShowParticipants,
        handleParticipantUpdate,
        handleParticipantsList
    };
};