import React, {useState, useEffect, useRef} from 'react';
import {
    BotMessageSquare,
    Send,
    X,
    Loader2,
    Calendar,
    ArrowLeft,
    Download,
    FileText,
    Camera,
    Search, PlusCircle, Edit, Trash2
} from 'lucide-react';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {cn} from '../../lib/utils';
import axios from 'axios';
import {toast} from 'react-hot-toast';
import {calendarApi} from '../../utils/calendarApi';
import {useLocation} from 'react-router-dom';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showTaskMenu, setShowTaskMenu] = useState(true);
    const [menuState, setMenuState] = useState({
        level: 'main',
        previousLevel: null
    });
    const [calendarState, setCalendarState] = useState({
        action: null,
        step: null,
        data: null
    });
    const location = useLocation();

    const messagesEndRef = useRef(null);

    // 메인 메뉴 옵션
    const mainMenuOptions = [
        {id: 'calendar', icon: Calendar, label: '일정 관리', color: 'bg-indigo-500 hover:bg-indigo-700'},
        {id: 'post', icon: FileText, label: '게시글 관리', color: 'bg-emerald-500 hover:bg-emerald-700'},
        {id: 'file', icon: Download, label: '파일 관리', color: 'bg-amber-500 hover:bg-amber-700'},
        {id: 'ocr', icon: Camera, label: 'OCR', color: 'bg-rose-500 hover:bg-rose-700'}
    ];
    // 서브 메뉴 옵션들
    const subMenuOptions = {
        calendar: [
            {
                id: 'view',
                label: '일정 조회',
                color: 'bg-indigo-500 hover:bg-indigo-700',
                handler: () => calendarHandlers.view(),
                icon: Search
            },
            {
                id: 'create',
                label: '일정 등록',
                color: 'bg-emerald-500 hover:bg-emerald-700',
                handler: () => calendarHandlers.create.start(),
                icon: PlusCircle
            },
            {
                id: 'update',
                label: '일정 수정',
                color: 'bg-amber-500 hover:bg-amber-700',
                handler: () => calendarHandlers.view('update'),
                icon: Edit
            },
            {
                id: 'delete',
                label: '일정 삭제',
                color: 'bg-rose-500 hover:bg-rose-700',
                handler: () => calendarHandlers.view('delete'),
                icon: Trash2
            }
        ]
    };

    // 메시지 타입별 스타일 설정
    const messageStyles = {
        user: "bg-indigo-600 text-white",
        assistant: "bg-slate-100 text-slate-900",
        system: "bg-rose-100 text-rose-800",
        success: "bg-emerald-100 text-emerald-800",
        info: "bg-sky-100 text-sky-800",
        warning: "bg-amber-100 text-amber-800"
    };


    // 날짜/시간 검증 유틸리티 함수들
    const dateTimeValidators = {
        isValidDate: (dateStr) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return {isValid: false, message: '날짜는 YYYY-MM-DD 형식으로 입력해주세요. (예: 2024-12-25)'};
            }

            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                return {isValid: false, message: '존재하지 않는 날짜입니다.'};
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
                return {isValid: false, message: '오늘 이후의 날짜를 입력해주세요.'};
            }

            return {isValid: true, date};
        },

        isValidTime: (timeStr) => {
            if (!/^\d{2}:\d{2}$/.test(timeStr)) {
                return {isValid: false, message: '시간은 HH:MM 형식으로 입력해주세요. (예: 14:00)'};
            }

            const [hours, minutes] = timeStr.split(':').map(Number);
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                return {isValid: false, message: '올바른 시간을 입력해주세요. (00:00 ~ 23:59)'};
            }

            return {isValid: true, time: {hours, minutes}};
        },

        isValidDuration: (durationStr) => {
            const duration = parseFloat(durationStr);
            if (isNaN(duration)) {
                return {isValid: false, message: '숫자로 입력해주세요.'};
            }
            if (duration <= 0) {
                return {isValid: false, message: '0보다 큰 시간을 입력해주세요.'};
            }
            if (duration > 24) {
                return {isValid: false, message: '24시간을 초과할 수 없습니다.'};
            }
            if (duration * 60 % 15 !== 0) {
                return {isValid: false, message: '15분 단위로 입력해주세요. (예: 1, 1.25, 1.5, 1.75)'};
            }

            return {isValid: true, duration};
        }
    };

    const calendarHandlers = {
        view: async (mode = 'view') => {
            setLoading(true);
            try {
                const response = await calendarApi.get();
                const events = response.data;
                if (events.length === 0) {
                    setMessages(prev => [...prev, {
                        type: 'assistant',
                        content: '등록된 일정이 없습니다.'
                    }]);
                } else {
                    const eventsList = events.map((event, index) =>
                        `${index + 1}. 📅 ${event.title}\n   시작: ${new Date(event.start).toLocaleString()}\n   종료: ${new Date(event.end).toLocaleString()}`
                    ).join('\n\n');

                    if (mode === 'view') {
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: `현재 등록된 일정입니다:\n\n${eventsList}`
                        }]);
                    } else {
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: `${mode === 'update' ? '수정' : '삭제'}할 일정의 번호를 입력해주세요:\n\n${eventsList}`
                        }]);
                        setCalendarState({
                            action: mode,
                            data: {events}
                        });
                    }
                }
            } catch (error) {
                setMessages(prev => [...prev, {
                    type: 'system',
                    content: '일정 조회 중 오류가 발생했습니다.'
                }]);
            } finally {
                setLoading(false);
                setShowTaskMenu(true);
            }
        },

        create: {
            start: () => {
                setCalendarState({
                    action: 'create',
                    step: 'title',
                    data: {}
                });
                setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: '새 일정을 등록하겠습니다. 일정 제목을 입력해 주세요.'
                }]);
                setShowTaskMenu(false);
            },

            handleInput: async (input) => {
                const {step, data} = calendarState;
                let nextStep = step;
                let nextData = {...data};

                switch (step) {
                    case 'title':
                        nextData.title = input;
                        nextStep = 'date';
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: '일정 날짜를 입력해 주세요. (예: 2024-12-25)'
                        }]);
                        break;

                    case 'date':
                        const dateValidation = dateTimeValidators.isValidDate(input);
                        if (!dateValidation.isValid) {
                            setMessages(prev => [...prev, {
                                type: 'system',
                                content: dateValidation.message
                            }]);
                            return;
                        }
                        nextData.date = input;
                        nextStep = 'time';
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: '시작 시간을 입력해 주세요. (예: 14:00)'
                        }]);
                        break;

                    case 'time':
                        const timeValidation = dateTimeValidators.isValidTime(input);
                        if (!timeValidation.isValid) {
                            setMessages(prev => [...prev, {
                                type: 'system',
                                content: timeValidation.message
                            }]);
                            return;
                        }
                        nextData.time = input;
                        nextStep = 'duration';
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: '일정 진행 시간을 시간 단위로 입력해 주세요. (예: 1 = 1시간, 0.5 = 30분)'
                        }]);
                        break;

                    case 'duration':
                        const durationValidation = dateTimeValidators.isValidDuration(input);
                        if (!durationValidation.isValid) {
                            setMessages(prev => [...prev, {
                                type: 'system',
                                content: durationValidation.message
                            }]);
                            return;
                        }

                        try {
                            const startTime = new Date(`${nextData.date}T${nextData.time}`);
                            const endTime = new Date(startTime.getTime() + durationValidation.duration * 60 * 60 * 1000);

                            await calendarApi.post('', {
                                title: nextData.title,
                                start: startTime,
                                end: endTime
                            });

                            setMessages(prev => [...prev, {
                                type: 'success',
                                content: '일정이 성공적으로 등록되었습니다. 📅'
                            }]);

                            nextStep = null;
                            nextData = null;
                            setShowTaskMenu(true);
                        } catch (error) {
                            setMessages(prev => [...prev, {
                                type: 'system',
                                content: '일정 등록에 실패했습니다.'
                            }]);
                        }
                        break;
                }

                setCalendarState({
                    action: nextStep ? 'create' : null,
                    step: nextStep,
                    data: nextData
                });
            }
        },

        update: {
            handleEventSelection: (input) => {
                const selectedIndex = parseInt(input) - 1;
                const {events} = calendarState.data;

                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= events.length) {
                    setMessages(prev => [...prev, {
                        type: 'system',
                        content: '올바른 일정 번호를 선택해주세요.'
                    }]);
                    return;
                }

                const selectedEvent = events[selectedIndex];
                calendarHandlers.update.start(selectedEvent);
            },

            start: (event) => {
                setCalendarState({
                    action: 'update',
                    step: 'title',
                    data: {originalEvent: event}
                });
                setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: `선택하신 일정의 현재 정보입니다:\n\n제목: ${event.title}\n시작: ${new Date(event.start).toLocaleString()}\n종료: ${new Date(event.end).toLocaleString()}\n\n수정할 일정의 새로운 제목을 입력해주세요. (현재 값을 유지하시려면 "유지"를 입력해주세요)`
                }]);
                setShowTaskMenu(false);
            },

            handleInput: async (input) => {
                const {step, data} = calendarState;
                const {originalEvent} = data;
                let nextStep = step;
                let nextData = {...data};

                switch (step) {
                    case 'title':
                        nextData.title = input === '유지' ? originalEvent.title : input;
                        nextStep = 'date';
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: `현재 날짜: ${new Date(originalEvent.start).toLocaleDateString()}\n새로운 날짜를 입력하시거나(예: 2024-12-25), 현재 값을 유지하시려면 "유지"를 입력해주세요.`
                        }]);
                        break;

                    case 'date':
                        if (input === '유지') {
                            nextData.date = new Date(originalEvent.start).toISOString().split('T')[0];
                        } else {
                            const dateValidation = dateTimeValidators.isValidDate(input);
                            if (!dateValidation.isValid) {
                                setMessages(prev => [...prev, {
                                    type: 'system',
                                    content: dateValidation.message
                                }]);
                                return;
                            }
                            nextData.date = input;
                        }
                        nextStep = 'time';
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: `현재 시작 시간: ${new Date(originalEvent.start).toLocaleTimeString()}\n새로운 시작 시간을 입력하시거나(예: 14:00), 현재 값을 유지하시려면 "유지"를 입력해주세요.`
                        }]);
                        break;

                    case 'time':
                        if (input === '유지') {
                            nextData.time = new Date(originalEvent.start).toTimeString().slice(0, 5);
                        } else {
                            const timeValidation = dateTimeValidators.isValidTime(input);
                            if (!timeValidation.isValid) {
                                setMessages(prev => [...prev, {
                                    type: 'system',
                                    content: timeValidation.message
                                }]);
                                return;
                            }
                            nextData.time = input;
                        }
                        nextStep = 'duration';

                        const currentDuration = (new Date(originalEvent.end) - new Date(originalEvent.start)) / (60 * 60 * 1000);
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: `현재 진행 시간: ${currentDuration}시간\n새로운 진행 시간을 입력하시거나(예: 1 = 1시간, 0.5 = 30분), 현재 값을 유지하시려면 "유지"를 입력해주세요.`
                        }]);
                        break;

                    case 'duration':
                        let duration;
                        if (input === '유지') {
                            duration = (new Date(originalEvent.end) - new Date(originalEvent.start)) / (60 * 60 * 1000);
                        } else {
                            const durationValidation = dateTimeValidators.isValidDuration(input);
                            if (!durationValidation.isValid) {
                                setMessages(prev => [...prev, {
                                    type: 'system',
                                    content: durationValidation.message
                                }]);
                                return;
                            }
                            duration = durationValidation.duration;
                        }

                        try {
                            const startTime = new Date(`${nextData.date}T${nextData.time}`);
                            const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

                            await calendarApi.put(`/${originalEvent.id}`, {
                                id: originalEvent.id,
                                title: nextData.title,
                                start: startTime,
                                end: endTime
                            });

                            setMessages(prev => [...prev, {
                                type: 'success',
                                content: '일정이 성공적으로 수정되었습니다. ✨'
                            }]);

                            nextStep = null;
                            nextData = null;
                            setShowTaskMenu(true);
                        } catch (error) {
                            setMessages(prev => [...prev, {
                                type: 'system',
                                content: '일정 수정에 실패했습니다.'
                            }]);
                        }
                        break;
                }

                setCalendarState({
                    action: nextStep ? 'update' : null,
                    step: nextStep,
                    data: nextData
                });
            }
        },

        delete: {
            handleEventSelection: (input) => {
                const selectedIndex = parseInt(input) - 1;
                const {events} = calendarState.data;

                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= events.length) {
                    setMessages(prev => [...prev, {
                        type: 'system',
                        content: '올바른 일정 번호를 선택해주세요.'
                    }]);
                    return;
                }

                const selectedEvent = events[selectedIndex];
                calendarHandlers.delete.confirm(selectedEvent);
            },

            confirm: (event) => {
                setCalendarState({
                    action: 'delete',
                    step: 'confirm',
                    data: {event}
                });
                setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: `다음 일정을 삭제하시겠습니까?\n\n제목: ${event.title}\n시작: ${new Date(event.start).toLocaleString()}\n종료: ${new Date(event.end).toLocaleString()}\n\n삭제하시려면 "삭제"를, 취소하시려면 "취소"를 입력해주세요.`
                }]);
                setShowTaskMenu(false);
            },

            handleInput: async (input) => {
                if (input.toLowerCase() === '삭제') {
                    try {
                        const {event} = calendarState.data;
                        await calendarApi.delete(`/${event.id}`);
                        setMessages(prev => [...prev, {
                            type: 'success',
                            content: '일정이 성공적으로 삭제되었습니다. 🗑️'
                        }]);
                    } catch (error) {
                        setMessages(prev => [...prev, {
                            type: 'system',
                            content: '일정 삭제에 실패했습니다.'
                        }]);
                    }
                } else if (input.toLowerCase() === '취소') {
                    setMessages(prev => [...prev, {
                        type: 'info',
                        content: '일정 삭제가 취소되었습니다.'
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        type: 'system',
                        content: '"삭제" 또는 "취소"를 입력해주세요.'
                    }]);
                    return;
                }

                setCalendarState({
                    action: null,
                    step: null,
                    data: null
                });
                setShowTaskMenu(true);
            }
        }
    };


    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    // 뒤로가기 처리
    const handleBack = () => {
        setMenuState(prev => ({
            level: prev.previousLevel || 'main',
            previousLevel: null
        }));
        setShowTaskMenu(true);
    };

    // 메뉴 선택 처리
    const handleTaskSelect = async (taskId) => {
        if (mainMenuOptions.find(opt => opt.id === taskId)) {
            setMenuState({
                level: taskId,
                previousLevel: 'main'
            });

            const task = mainMenuOptions.find(t => t.id === taskId);
            setMessages(prev => [...prev, {
                type: 'user',
                content: `${task.label} 메뉴로 이동합니다.`
            }]);
        }
    };
    // handleSend 함수 수정
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const currentInput = input.trim();
        setInput('');
        setLoading(true);
        setIsTyping(true);

        // 사용자 메시지 추가
        setMessages(prev => [...prev, {type: 'user', content: currentInput}]);

        // 캘린더 작업 처리
        if (calendarState.action) {
            try {
                switch (calendarState.action) {
                    case 'create':
                        await calendarHandlers.create.handleInput(currentInput);
                        break;
                    case 'update':
                        if (calendarState.step === 'selection') {
                            await calendarHandlers.update.handleEventSelection(currentInput);
                        } else {
                            await calendarHandlers.update.handleInput(currentInput);
                        }
                        break;
                    case 'delete':
                        if (calendarState.step === 'selection') {
                            await calendarHandlers.delete.handleEventSelection(currentInput);
                        } else if (calendarState.step === 'confirm') {
                            await calendarHandlers.delete.handleInput(currentInput);
                        }
                        break;
                }
            } catch (error) {
                console.error('Calendar operation error:', error);
                setMessages(prev => [...prev, {
                    type: 'system',
                    content: '작업 처리 중 오류가 발생했습니다.'
                }]);
            }
            setLoading(false);
            setIsTyping(false);
            return;
        }

        try {
            const response = await axios.post('/api/llama-chat', {
                prompt: currentInput,
                systemPrompt: '당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 한국어로 자연스럽게 대화해주세요.',
                context: messages.slice(-5).map(m => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content
                }))
            });

            const sentences = response.data.response.split('\n').filter(Boolean);
            for (let sentence of sentences) {
                setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: sentence
                }]);
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        } catch (error) {
            toast.error('메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setMessages(prev => [...prev, {
                type: 'system',
                content: '메시지 전송에 실패했습니다.'
            }]);
        } finally {
            setLoading(false);
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // 메시지 컴포넌트
    const Message = ({message}) => {
        const messageStyle = messageStyles[message.type];

        return (
            <div className={cn(
                'max-w-[80%] rounded-lg p-3 whitespace-pre-wrap',
                messageStyle,
                message.type === 'user' ? 'ml-auto' : '',
                'animate-fadeIn'
            )}>
                {message.content}
            </div>
        );
    };

    // 로딩 애니메이션 컴포넌트
    const TypingAnimation = () => (
        <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                         style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                         style={{animationDelay: '200ms'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                         style={{animationDelay: '400ms'}}></div>
                </div>
            </div>
        </div>
    );

    // 메뉴 버튼 컴포넌트
    const ActionButton = ({icon: Icon, label, onClick, color, disabled = false}) => (
        <Button
            className={cn(
                'flex items-center gap-2 p-3 w-full rounded-lg text-white transition-all duration-200',
                color || 'bg-blue-500 hover:bg-blue-700',
                'active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-sm hover:shadow-md'
            )}
            onClick={onClick}
            disabled={disabled}
        >
            {Icon && <Icon className="w-5 h-5"/>}
            <span className="flex-1 text-left">{label}</span>
        </Button>
    );

    // 메뉴 렌더링
    const renderMenuButtons = () => {
        if (!showTaskMenu) return null;

        return (
            <div className="space-y-2 mt-4">
                {menuState.level === 'main' ? (
                    // 메인 메뉴 옵션들
                    mainMenuOptions.map((option) => (
                        <ActionButton
                            key={option.id}
                            icon={option.icon}
                            label={option.label}
                            color={option.color}
                            onClick={() => handleTaskSelect(option.id)}
                        />
                    ))
                ) : (
                    // 서브 메뉴 옵션들
                    <>
                        {subMenuOptions[menuState.level]?.map((option) => (
                            <ActionButton
                                key={option.id}
                                label={option.label}
                                onClick={option.handler}
                                color={option.color}
                            />
                        ))}
                        <ActionButton
                            icon={ArrowLeft}
                            label="뒤로 가기"
                            onClick={handleBack}
                            color="bg-gray-500 hover:bg-gray-700"
                        />
                    </>
                )}
            </div>
        );
    };

    // 로그인 페이지에서는 위젯을 숨김
    if (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/password-change'|| location.pathname === '/meetingRoom') {
        return null;
    }

    return (
        <>
            <button
                className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 hover:scale-110"
                onClick={() => setIsOpen(!isOpen)}
                style={{zIndex: 1000}}
            >
                <BotMessageSquare className="w-8 h-8"/>
            </button>

            <div
                className={cn(
                    'fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl transition-all duration-300 transform',
                    isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
                )}
                style={{zIndex: 1000}}
            >
                <div className="flex flex-col h-[600px] rounded-lg overflow-hidden">
                    <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <BotMessageSquare className="w-6 h-6"/>
                            <h2 className="text-lg font-semibold">오피스 봇</h2>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-blue-700 rounded-full"
                        >
                            <X className="h-6 w-6"/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex',
                                    message.type === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                <Message message={message}/>
                            </div>
                        ))}

                        {isTyping && <TypingAnimation/>}
                        {renderMenuButtons()}
                        <div ref={messagesEndRef}/>
                    </div>

                    <div className="p-4 border-t">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={loading ? "처리 중..." : "메시지를 입력하세요..."}
                                disabled={loading}
                                className="flex-1"
                                autoComplete="off"
                            />
                            <Button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className={cn(
                                    "px-4 py-2 bg-blue-600 text-white hover:bg-blue-700",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    "transition-all duration-200",
                                    "rounded-md"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                ) : (
                                    <Send className="h-4 w-4"/>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;