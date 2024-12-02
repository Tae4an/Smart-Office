import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import '../../styles/calendar.css'

const localizer = momentLocalizer(moment);

// 샘플 이벤트
const initialEvents = [
  {
    id: 1,
    title: '샘플 이벤트',
    start: new Date(),
    end: new Date(),
  }
];

const CalendarForm = () => {
  const [events, setEvents] = useState(initialEvents);
  const DnDCalendar = withDragAndDrop(Calendar);

  // 이벤트 이동 핸들러
  const moveEvent = useCallback(({ event, start, end }) => {
    setEvents(prev => {
      const filtered = prev.filter(e => e.id !== event.id);
      return [...filtered, { ...event, start, end }];
    });
  }, []);

  // 이벤트 크기 조절 핸들러
  const resizeEvent = useCallback(({ event, start, end }) => {
    setEvents(prev => {
      const filtered = prev.filter(e => e.id !== event.id);
      return [...filtered, { ...event, start, end }];
    });
  }, []);

  // 새 이벤트 생성 핸들러
  const handleSelectSlot = useCallback((slotInfo) => {
    const title = window.prompt('새 일정을 입력하세요');
    if (title) {
      setEvents(prev => [...prev, {
        id: prev.length + 1,
        title,
        start: slotInfo.start,
        end: slotInfo.end,
      }]);
    }
  }, []);

  // 이벤트 선택 핸들러
  const handleSelectEvent = useCallback((event) => {
    window.alert(event.title);
  }, []);

  return (
    <div className="h-screen p-4">
      <DnDCalendar
        localizer={localizer}
        events={events}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        resizable
        selectable
        style={{ height: 'calc(100vh - 2rem)' }}
        defaultView="month"
        views={['month', 'week', 'day']}
      />
    </div>
  );
};

export default CalendarForm;