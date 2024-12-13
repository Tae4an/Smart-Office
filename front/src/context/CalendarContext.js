import React, { createContext, useState, useContext, useEffect } from 'react';
import { calendarApi } from '../utils/calendarApi';

// Context 생성
const CalendarContext = createContext(null);

// Provider 컴포넌트
export const CalendarProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState(() => {
        const savedEvents = localStorage.getItem('calendar-events');
        return savedEvents ? JSON.parse(savedEvents) : [];
    });

    useEffect(() => {
        const fetchEvents = async () => {
            // userInfo가 있을 때만 API 호출
            const userInfoStr = sessionStorage.getItem('userInfo');
            if (!userInfoStr) {
                setLoading(false);
                return;
            }

            try {
                const response = await calendarApi.get();
                const dbEvents = response.data;

                const mergedEvents = [...events, ...dbEvents.filter(dbEvent =>
                    !events.some(event => event.id === dbEvent.id)
                )];

                setEvents(mergedEvents);
                localStorage.setItem('calendar-events', JSON.stringify(mergedEvents));
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const addEvent = async (newEvent) => {
        try {
            const response = await calendarApi.post('', newEvent);
            const savedEvent = response.data;

            const updatedEvents = [...events, savedEvent];
            setEvents(updatedEvents);
            localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));

            return savedEvent;
        } catch (error) {
            console.error('Failed to add event:', error);
            throw error;
        }
    };

    const updateEvent = async (updatedEvent) => {
        try {
            const response = await calendarApi.put(`/${updatedEvent.id}`, updatedEvent);
            const savedEvent = response.data;

            const updatedEvents = events.map(event =>
                event.id === savedEvent.id ? savedEvent : event
            );
            setEvents(updatedEvents);
            localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));

            return savedEvent;
        } catch (error) {
            console.error('Failed to update event:', error);
            throw error;
        }
    };

    const deleteEvent = async (eventId) => {
        try {
            await calendarApi.delete(`/${eventId}`);

            const filteredEvents = events.filter(event => event.id !== eventId);
            setEvents(filteredEvents);
            localStorage.setItem('calendar-events', JSON.stringify(filteredEvents));
        } catch (error) {
            console.error('Failed to delete event:', error);
            throw error;
        }
    };

    const resetEvent = async () => {
        try {
            await calendarApi.delete('');

            setEvents([]);
            localStorage.removeItem('calendar-events');
        } catch (error) {
            console.error('Failed to reset events:', error);
            throw error;
        }
    };

    return (
        <CalendarContext.Provider value={{
            events,
            loading,
            addEvent,
            updateEvent,
            deleteEvent,
            resetEvent
        }}>
            {children}
        </CalendarContext.Provider>
    );
};

// Hook 생성
export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};