import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const retryCount = useRef(0);
    const maxRetries = 3;
    const location = useLocation();


    // 채팅 내역 로컬 스토리지에서 불러오기
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
        loadChatHistory();
    }, []);

    // 메시지 업데이트시 로컬 스토리지 저장
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);



    // 채팅 이력 불러오기
    const loadChatHistory = async () => {
        try {
            const response = await axios.get('/api/llama-chat/history');
            if (response.data) {
                const formattedMessages = [];
                response.data.forEach(chat => {
                    // 사용자 메시지
                    formattedMessages.push({
                        type: 'user',
                        content: chat.prompt
                    });
                    // 챗봇 응답
                    formattedMessages.push({
                        type: 'assistant',
                        content: chat.response
                    });
                });
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error('채팅 이력 로딩 실패:', error);
            toast.error('채팅 이력을 불러오는데 실패했습니다.');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const currentInput = input.trim();
        setInput('');
        setLoading(true);
        setIsTyping(true);

        // 사용자 메시지 추가
        setMessages(prev => [...prev, { type: 'user', content: currentInput }]);

        const makeRequest = async (retryCount) => {
            try {
                const recentMessages = messages.slice(-5).map(m => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content
                }));

                const response = await axios.post('/api/llama-chat', {
                    prompt: currentInput,
                    systemPrompt: '당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 한국어로 자연스럽게 대화해주세요. 문장의 길이가 좀 길어지면 적절히 "\n"를 쳐서 보내봐',
                    context: recentMessages
                }, {
                    timeout: 30000
                });
                console.log(response);
                // 응답 텍스트를 줄바꿈으로 분할
                const sentences = response.data.response.split('\n').filter(Boolean);

                // 각 문장을 순차적으로 표시
                for (let sentence of sentences) {
                    setMessages(prev => [...prev, {
                        type: 'assistant',
                        content: sentence
                    }]);
                    // 각 문장 사이에 딜레이
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

            } catch (error) {
                if (retryCount < maxRetries) {
                    toast.error('요청 실패. 재시도 중...', {
                        duration: 2000
                    });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return makeRequest(retryCount + 1);
                }

                toast.error(
                    error.response?.data?.message ||
                    '메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.'
                );

                setMessages(prev => [...prev, {
                    type: 'system',
                    content: '메시지 전송에 실패했습니다.'
                }]);
            }
        };

        await makeRequest(0);
        setLoading(false);
        setIsTyping(false);
    };


    const TypingAnimation = () => {
        return (
            <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3 flex items-center gap-1">
                    typing
                    <span className="w-1 h-1 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                    <span className="w-1 h-1 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                </div>
            </div>
        );
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    // 로그인 페이지에서는 위젯을 숨김
    if (location.pathname === '/login' || location.pathname === '/') {
        return null;
    }
    return (
        <>
            <button
                className="fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-[#1976d2] text-white hover:bg-[#1565c0] transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
                style={{ zIndex: 1000 }}
            >
                <Bot className="w-6 h-6" />
            </button>

            <div
                className={cn(
                    'fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl transition-all duration-300 transform',
                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                )}
                style={{ zIndex: 1000 }}
            >
                <div className="flex flex-col h-[500px] rounded-lg overflow-hidden">
                    <div className="p-4 bg-[#1976d2] text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">AI Assistant</h2>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex',
                                    message.type === 'user' ? 'justify-end' : 'justify-start',
                                    message.type === 'system' ? 'justify-center' : ''
                                )}
                            >
                                <div
                                    className={cn(
                                        'max-w-[80%] rounded-lg p-3 whitespace-pre-wrap break-words',
                                        message.type === 'user'
                                            ? 'bg-[#1976d2] text-white'
                                            : message.type === 'system'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-900'
                                    )}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && <TypingAnimation />}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={loading ? "메시지 전송 중..." : "메시지를 입력하세요..."}
                            disabled={loading}
                            className="flex-1"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="px-4 py-2 bg-[#1976d2] text-white rounded-md hover:bg-[#1565c0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;