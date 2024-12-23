import React, { useCallback, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useCalendar } from '../../context/CalendarContext';
import EventModal from './EventModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import '../../styles/calendar.css';
import { Search } from 'lucide-react';

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

const CalendarForm = ({ height = 'calc(100vh - 2rem)', minimode = false, onEventChange }) => {
  const { events, loading, addEvent, updateEvent, deleteEvent, resetEvent } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventSlot, setNewEventSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

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

  // 새 이벤트 생성 핸들러 수정
  const handleSelectSlot = useCallback((slotInfo) => {
    setNewEventSlot(slotInfo);
    setSelectedEvent(null);
    setIsModalOpen(true);
  }, []);

  // 이벤트 선택 핸들러
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  // 모달 닫기 핸들러 수정
  const handleCloseModal = () => {
    setSelectedEvent(null);
    setNewEventSlot(null);
    setIsModalOpen(false);
  };

  // 이벤트 업데이트 핸들러 수정
  const handleUpdateEvent = async (updatedEvent) => {
    try {
      if (newEventSlot) {
        await addEvent(updatedEvent);
      } else {
        await updateEvent(updatedEvent);
      }
      // 이벤트 변경 알림
      onEventChange && onEventChange();
    } catch (error) {
      alert(newEventSlot ? '일정 생성에 실패했습니다.' : '일정 수정에 실패했습니다.');
    }
  };

  // 이벤트 삭제 핸들러 수정
  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      // 이벤트 변경 알림
      onEventChange && onEventChange();
    } catch (error) {
      alert('일정 삭제에 실패했습니다.');
    }
  };

  // 초기화 핸들러 수정
  const handleReset = useCallback(async () => {
    if(window.confirm('모든 일정을 초기화하시겠습니까?')) {
      try {
        await resetEvent();
        // 이벤트 변경 알림
        onEventChange && onEventChange();
      } catch (error) {
        alert('일정 초기화에 실패했습니다.');
      }
    }
  }, [resetEvent, onEventChange]);

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

  // 검색 핸들러 추가
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term) {
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(term)
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  };

  // 이벤트 날짜 포맷팅 함수
  const formatEventDate = (date) => {
    return new Date(date).toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
      <div className={minimode ? "p-2" : "h-screen p-4"} style={{ height: height }}>
        {!minimode && (
          <div className="flex h-full gap-4">
            {/* 왼쪽 사이드바 */}
            <div className="w-80 bg-white rounded-lg shadow-sm p-4">
              {/* 검색 영역 */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="일정 검색..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>

              {/* 일정 리스트 */}
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 4rem)' }}>
                <h3 className="font-medium text-gray-700 mb-3">
                  {searchTerm ? '검색된 일정' : '다가오는 일정'}
                </h3>
                <div className="space-y-2">
                  {(searchTerm ? filteredEvents : events)
                    .sort((a, b) => new Date(a.start) - new Date(b.start))
                    .map(event => (
                      <div
                        key={event.id}
                        onClick={() => handleSelectEvent(event)}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      >
                        <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
                        <div className="text-sm text-gray-500">
                          <div>시작: {formatEventDate(event.start)}</div>
                          <div>종료: {formatEventDate(event.end)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* 메인 캘린더 영역 */}
            <div className="flex-1">
              {!minimode && (
                <div className="calendar-controls">
                  <button onClick={handleReset} className="reset-button">
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
            </div>
          </div>
        )}

        {minimode && (
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
        )}

        <EventModal
            event={selectedEvent || (newEventSlot && {
              title: '',
              start: newEventSlot.start,
              end: newEventSlot.end
            })}
            open={isModalOpen}
            onClose={handleCloseModal}
            onUpdate={handleUpdateEvent}
            onDelete={handleDeleteEvent}
            isNewEvent={!!newEventSlot}
        />
      </div>
  );
};

export default CalendarForm;