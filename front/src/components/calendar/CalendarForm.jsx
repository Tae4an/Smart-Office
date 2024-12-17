import React, { useCallback, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useCalendar } from '../../context/CalendarContext';
import EventModal from './EventModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import '../../styles/calendar.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

// 한글 요일 설정
const messages = {
  week: '주',
  work_week: '근무주',
  day: '일',
  month: '월',
  previous: '이전',
  next: '다음',
  today: '오늘',
  agenda: '일정',
  date: '날짜',
  time: '시간',
  event: '일정',
  allDay: '하루종일',
  noEventsInRange: '일정이 없습니다.',
};

const CalendarForm = ({ height = 'calc(100vh - 2rem)', minimode = false }) => {
  const { events, loading, addEvent, updateEvent, deleteEvent, resetEvent } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 이벤트 이동 핸들러
  const moveEvent = useCallback(async ({ event, start, end }) => {
    try {
      await updateEvent({ ...event, start, end });
    } catch (error) {
      alert('일정 수정에 실패했습니다.');
    }
  }, [updateEvent]);

  // 이벤트 크기 조절 핸들러
  const resizeEvent = useCallback(async ({ event, start, end }) => {
    try {
      await updateEvent({ ...event, start, end });
    } catch (error) {
      alert('일정 수정에 실패했습니다.');
    }
  }, [updateEvent]);

  // 새 이벤트 생성 핸들러
  const handleSelectSlot = useCallback(async (slotInfo) => {
    const title = window.prompt('새 일정을 입력하세요');
    if (title) {
      try {
        await addEvent({
          title,
          start: slotInfo.start,
          end: slotInfo.end,
        });
      } catch (error) {
        alert('일정 생성에 실패했습니다.');
      }
    }
  }, [addEvent]);

  // 이벤트 선택 핸들러
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  // 이벤트 업데이트 핸들러
  const handleUpdateEvent = async (updatedEvent) => {
    try {
      await updateEvent(updatedEvent);
    } catch (error) {
      alert('일정 수정에 실패했습니다.');
    }
  };

  // 이벤트 삭제 핸들러
  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      alert('일정 삭제에 실패했습니다.');
    }
  };

  // 초기화 핸들러
  const handleReset = useCallback(async () => {
    if(window.confirm('모든 일정을 초기화하시겠습니까?')) {
      try {
        await resetEvent();
      } catch (error) {
        alert('일정 초기화에 실패했습니다.');
      }
    }
  }, [resetEvent]);

  const dayPropGetter = useCallback(date => {
    if (date.getDay() === 0) { // 일요일
      return {
        style: {
          color: '#ff0000',
          backgroundColor: 'rgba(255, 0, 0, 0.03)'  // 연한 빨간색 배경
        }
      };
    }
    if (date.getDay() === 6) { // 토요일
      return {
        style: {
          color: '#0000ff',
          backgroundColor: 'rgba(0, 0, 255, 0.03)'  // 연한 파란색 배경
        }
      };
    }
    return {};
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
      <div className={minimode ? "p-2" : "h-screen p-4"} style={{ height: height }}>
        {!minimode && (
            <div className="mb-4 flex justify-end">
              <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                모든 일정 초기화
              </button>
            </div>
        )}
        <DnDCalendar
            localizer={localizer}
            events={events}
            onEventDrop={moveEvent}
            onEventResize={resizeEvent}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            messages={messages}
            formats={{
              weekdayFormat: (date, culture, localizer) => 
                ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
            }}
            resizable
            selectable
            style={{ height: !minimode ? 'calc(100% - 3rem)' : '100%' }}
            defaultView="month"
            views={minimode ? ['month'] : ['month', 'week', 'day']}
            toolbar={!minimode}
            dayPropGetter={dayPropGetter}
        />
        <EventModal
            event={selectedEvent}
            open={isModalOpen}
            onClose={handleCloseModal}
            onUpdate={handleUpdateEvent}
            onDelete={handleDeleteEvent}
        />
      </div>
  );
};

export default CalendarForm;