import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../styles/messenger.css';

const MessengerForm = ({ isWidget }) => {
  const [chats] = useState([
    {
      id: 1,
      name: "홍길동",
      lastMessage: "알겠습니다. 오후에 회의 준비 잘 부탁드립니다.",
      time: "1시간 전",
      avatar: "/assets/profile2.png"
    },
    {
      id: 2,
      name: "김철수",
      lastMessage: "새로운 위젯 추가했는데 한번 봐주실 수 있나요?",
      time: "2시간 전",
      avatar: "/assets/profile3.png"
    }
  ]);

  const mockMessages = {
    1: [
      {
        id: 1,
        text: "홍 팀장님, 오후 3시 프로젝트 중간 보고 회의 자료 검토 부탁드립니다.",
        sender: "user",
        timestamp: "2024-12-06T09:00:00"
      },
      {
        id: 2,
        text: "네, 지금 확인해보겠습니다. 특별히 중점적으로 봐야할 부분이 있을까요?",
        sender: "received",
        timestamp: "2024-12-06T09:02:00"
      },
      {
        id: 3,
        text: "3페이지 실적 분석 부분과 마지막 페이지 향후 계획 부분입니다.",
        sender: "user",
        timestamp: "2024-12-06T09:05:00"
      },
      {
        id: 4,
        text: "알겠습니다. 점심 식사 후 바로 검토해서 피드백 드리도록 하겠습니다.",
        sender: "received",
        timestamp: "2024-12-06T09:07:00"
      },
      {
        id: 5,
        text: "알겠습니다. 오후에 회의 준비 잘 부탁드립니다.",
        sender: "user",
        timestamp: "2024-12-06T09:10:00"
      }
    ],
    2: [
      {
        id: 1,
        text: "새로운 위젯 추가했는데 한번 봐주실 수 있나요? 근태 현황이랑 지도 위젯 연동해서 재택근무 시 위치 기반으로 출근 체크되게 했어요.",
        sender: "received",
        timestamp: "2024-12-06T10:00:00"
      },
      {
        id: 2,
        text: "오, 정말 좋은 아이디어네요! 제가 테스트해보고 피드백 드릴게요. 혹시 지도 위젯에 회사 근처 식당 정보도 같이 표시되나요?",
        sender: "user",
        timestamp: "2024-12-06T10:02:00"
      },
      {
        id: 3,
        text: "네, 점심시간에 맞춰서 주변 맛집 정보랑 크라우드 혼잡도까지 표시되도록 업데이트했습니다!",
        sender: "received",
        timestamp: "2024-12-06T10:05:00"
      }
    ]
  };

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setLoading(true);
      // 약간의 로딩 시간을 시뮬레이션
      setTimeout(() => {
        setMessages(mockMessages[selectedChat.id]);
        setLoading(false);
      }, 500);
    }
  }, [selectedChat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    const messageData = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  // 모바일에서 채팅방이 선택되었을 때의 UI
  const renderMobileChat = () => (
    <div className="mobile-chat-container">
      <div className="mobile-chat-header">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <div className="chat-header-info">
          <img src={selectedChat.avatar} alt={selectedChat.name} className="chat-avatar-small" />
          <h2>{selectedChat.name}</h2>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {loading ? (
          <div className="loading-message">메시지를 불러오는 중...</div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-wrapper ${message.sender === 'user' ? 'sent' : 'received'}`}
              >
                <div className={`message-bubble ${message.sender === 'user' ? 'sent' : 'received'}`}>
                  <p>{message.text}</p>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="input-container">
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="message-input"
            placeholder="메시지를 입력하세요..."
          />
          <button type="submit" className="send-button">
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );

  // 기본 데스크톱 UI
  const renderDesktopUI = () => (
    <div className={`messenger-container ${selectedChat && isWidget ? 'has-selected-chat' : ''}`}>
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>채팅 목록</h2>
        </div>
        <div className="chat-list-content">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-list-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
              <div className="chat-info">
                <div className="chat-name">{chat.name}</div>
                <div className="chat-last-message">{chat.lastMessage}</div>
              </div>
              <div className="chat-time">{chat.time}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedChat ? (
        <div className="chat-container">
          <div className="chat-header">
            {isWidget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <button onClick={handleBack} className="back-button">
                  <ArrowLeft size={24} />
                </button>
                <h2>{selectedChat.name}</h2>
              </div>
            ) : (
              <h2>{selectedChat.name}</h2>
            )}
          </div>

          <div className="messages-container" ref={messagesContainerRef}>
            {loading ? (
              <div className="loading-message">메시지를 불러오는 중...</div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-wrapper ${message.sender === 'user' ? 'sent' : 'received'}`}
                  >
                    <div className={`message-bubble ${message.sender === 'user' ? 'sent' : 'received'}`}>
                      <p>{message.text}</p>
                      <div className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="input-container">
            <form onSubmit={handleSubmit} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
                placeholder="메시지를 입력하세요..."
              />
              <button type="submit" className="send-button">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="chat-container empty-state">
          <div className="empty-state-message">
            채팅을 선택해주세요
          </div>
        </div>
      )}
    </div>
  );

  // 모바일 UI
  const renderMobileUI = () => (
    <div className="messenger-container mobile">
      {selectedChat ? (
        renderMobileChat()
      ) : (
        <div className="chat-list full-width">
          <div className="chat-list-header">
            <h2>채팅 목록</h2>
          </div>
          <div className="chat-list-content">
            {chats.map(chat => (
              <div
                key={chat.id}
                className="chat-list-item"
                onClick={() => setSelectedChat(chat)}
              >
                <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
                <div className="chat-info">
                  <div className="chat-name">{chat.name}</div>
                  <div className="chat-last-message">{chat.lastMessage}</div>
                </div>
                <div className="chat-time">{chat.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return isMobile ? renderMobileUI() : renderDesktopUI();
};

export default MessengerForm;