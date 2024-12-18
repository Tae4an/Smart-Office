import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Mail, Paperclip, Send, Plus, Tag, Edit3, Star, AlertCircle } from 'lucide-react';
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

  const mockEmails = {
    inbox: [
      {
        id: 1,
        subject: "2024년 1분기 프로젝트 진행 현황 보고",
        sender: "김철수 팀장",
        senderEmail: "kim.cs@company.com",
        recipients: ["me@company.com"],
        cc: ["park.ys@company.com", "lee.jh@company.com"],
        content: `안녕하세요.

현재 프로젝트 진행 상황을 보고드립니다.

1. 프론트엔드 개발 진행률: 85%
- React 컴포넌트 구조화 완료
- 반응형 UI 구현 중
- 성능 최적화 진행 예정

2. 백엔드 개발 진행률: 75%
- API 엔드포인트 구현 완료
- 데이터베이스 스키마 최적화 중
- 캐싱 시스템 도입 검토 중

다음 주 화요일까지 1차 테스트 버전 배포 예정입니다.

감사합니다.`,
        timestamp: "2024-01-15T10:00:00",
        isRead: false,
        priority: "high",
        attachments: [
          {
            name: "2024_Q1_진행현황.pdf",
            size: "2.4MB",
            type: "application/pdf"
          },
          {
            name: "개발일정_수정안.xlsx",
            size: "1.1MB",
            type: "application/excel"
          }
        ],
        labels: ["프로젝트", "중요"]
      },
      {
        id: 2,
        subject: "회의 일정 변경 안내",
        sender: "박영희",
        senderEmail: "park.yh@company.com",
        recipients: ["team@company.com"],
        cc: [],
        content: `안녕하세요.

내일 예정되어있던 주간 회의 일정이 변경되어 안내드립니다.

[변경 전]
일시: 2024년 1월 16일(화) 오후 2:00
장소: 회의실 A

[변경 후]
일시: 2024년 1월 16일(화) 오후 4:00
장소: 회의실 B

* 회의 안건은 동일합니다.
* 불가피한 일정 조정이 필요하신 분들은 회신 부탁드립니다.

감사합니다.`,
        timestamp: "2024-01-15T09:30:00",
        isRead: true,
        priority: "medium",
        attachments: [
          {
            name: "weekly_meeting_agenda.pdf",
            size: "521KB",
            type: "application/pdf"
          }
        ],
        labels: ["회의"]
      }
    ],
    sent: [
      {
        id: 4,
        subject: "주간 업무 보고서",
        sender: "me@company.com",
        recipients: ["kim.cs@company.com"],
        cc: ["team@company.com"],
        content: `안녕하세요 팀장님,

이번 주 업무 진행 사항을 정리하여 보고드립니다.

1. 메신저 시스템 개선
- 채팅/메일 통합 UI 구현 완료
- 반응형 레이아웃 적용 완료
- 실시간 알림 기능 구현 중

2. 다음 주 예정 작업
- 첨부파일 미리보기 기능 구현
- 메시지 검색 기능 고도화
- 성능 최적화

추가로 논의가 필요한 사항이 있어 미팅 요청드립니다.
가능하신 시간에 답변 부탁드립니다.

감사합니다.`,
        timestamp: "2024-01-14T17:00:00",
        isRead: true,
        priority: "normal",
        attachments: [
          {
            name: "weekly_report.pdf",
            size: "1.2MB",
            type: "application/pdf"
          },
          {
            name: "messenger_ui_prototype.fig",
            size: "3.5MB",
            type: "application/figma"
          }
        ],
        labels: ["보고"]
      }
    ],
    drafts: [
      {
        id: 6,
        subject: "디자인 시스템 업데이트 안내",
        sender: "me@company.com",
        recipients: ["design@company.com", "dev@company.com"],
        cc: ["kim.cs@company.com"],
        content: `안녕하세요,

디자인 시스템 업데이트 관련 안내드립니다.

변경사항:
1. 컬러 시스템 개선
2. 타이포그래피 스케일 조정
3. 컴포넌트 변수명 통일

[작성 중...]`,
        timestamp: "2024-01-15T11:45:00",
        isRead: true,
        priority: "normal",
        attachments: [],
        labels: ["초안"]
      }
    ]
  };

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
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [mailboxTab, setMailboxTab] = useState('inbox');
  const [isComposing, setIsComposing] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    recipients: '',
    cc: '',
    content: '',
    attachments: [],
    priority: 'normal',
    labels: []
  });

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [emails,setEmails] = useState(mockEmails);

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

  const handleComposeEmail = () => {
    setIsComposing(true);
    setSelectedEmail(null);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    
    // Add new email to sent box
    const newEmail = {
      id: Date.now(),
      subject: emailForm.subject,
      sender: 'me@company.com',
      recipients: emailForm.recipients.split(',').map(r => r.trim()),
      cc: emailForm.cc.split(',').map(r => r.trim()),
      content: emailForm.content,
      timestamp: new Date().toISOString(),
      isRead: true,
      priority: emailForm.priority,
      attachments: emailForm.attachments,
      labels: emailForm.labels
    };

    setEmails(prev => ({
      ...prev,
      sent: [newEmail, ...prev.sent]
    }));

    setIsComposing(false);
    setEmailForm({
      subject: '',
      recipients: '',
      cc: '',
      content: '',
      attachments: [],
      priority: 'normal',
      labels: []
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'medium':
        return <Star className="text-yellow-500" size={16} />;
      default:
        return null;
    }
  };

  const renderEmailComposer = () => (
    <div className="email-composer">
      <div className="email-composer-header">
        <h3>새 이메일 작성</h3>
        <button onClick={() => setIsComposing(false)} className="close-button">
          <ArrowLeft size={20} />
        </button>
      </div>
      <form onSubmit={handleSendEmail} className="email-form">
        <input
          type="text"
          placeholder="받는 사람"
          value={emailForm.recipients}
          onChange={(e) => setEmailForm({...emailForm, recipients: e.target.value})}
          className="email-recipients-input"
        />
        <input
          type="text"
          placeholder="참조"
          value={emailForm.cc}
          onChange={(e) => setEmailForm({...emailForm, cc: e.target.value})}
          className="email-cc-input"
        />
        <input
          type="text"
          placeholder="제목"
          value={emailForm.subject}
          onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
          className="email-subject-input"
        />
        <select
          value={emailForm.priority}
          onChange={(e) => setEmailForm({...emailForm, priority: e.target.value})}
          className="email-priority-select"
        >
          <option value="normal">보통</option>
          <option value="high">높음</option>
          <option value="medium">중간</option>
          <option value="low">낮음</option>
        </select>
        <textarea
          placeholder="내용을 입력하세요..."
          value={emailForm.content}
          onChange={(e) => setEmailForm({...emailForm, content: e.target.value})}
          className="email-content-input"
        />
        <div className="email-attachments">
          {emailForm.attachments.map((file, index) => (
            <div key={index} className="attachment-item">
              <Paperclip size={16} />
              <span>{file.name}</span>
              <button
                onClick={() => {
                  const newAttachments = [...emailForm.attachments];
                  newAttachments.splice(index, 1);
                  setEmailForm({...emailForm, attachments: newAttachments});
                }}
                className="remove-attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="email-form-footer">
          <button type="button" className="attach-button">
            <Paperclip size={20} />
            <span>첨부</span>
          </button>
          <button type="submit" className="send-email-button">
            <Send size={20} />
            <span>보내기</span>
          </button>
        </div>
      </form>
    </div>
  );

  const renderEmailDetail = (email) => (
    <div className="email-detail">
      <div className="email-detail-header">
        <div className="email-detail-title">
          {!isWidget && (
            <button className="back-button" onClick={() => setSelectedEmail(null)}>
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="subject-line">
            {getPriorityIcon(email.priority)}
            <h2>{email.subject}</h2>
          </div>
          <div className="email-labels">
            {email.labels.map((label, index) => (
              <span key={index} className="email-label">
                <Tag size={14} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="email-detail-info">
        <div className="sender-info">
          <strong>보낸사람:</strong> {email.sender} <span className="email-address">&lt;{email.senderEmail}&gt;</span>
        </div>
        <div className="recipient-info">
          <strong>받는사람:</strong> {email.recipients.join(', ')}
        </div>
        {email.cc.length > 0 && (
          <div className="cc-info">
            <strong>참조:</strong> {email.cc.join(', ')}
          </div>
        )}
        <div className="timestamp">
          {new Date(email.timestamp).toLocaleString()}
        </div>
      </div>
      {email.attachments.length > 0 && (
        <div className="attachments-section">
          <h4>첨부파일</h4>
          <div className="attachment-list">
            {email.attachments.map((file, index) => (
              <div key={index} className="attachment-item">
                <Paperclip size={16} />
                <span>{file.name}</span>
                <span className="file-size">({file.size})</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="email-content">
        {email.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );

  const renderEmailList = () => (
    <div className="email-list">
      <div className="email-list-header">
      </div>
      <div className="email-items">
        {emails[mailboxTab].map(email => (
          <div
            key={email.id}
            className={`email-item ${!email.isRead ? 'unread' : ''}`}
            onClick={() => setSelectedEmail(email)}
          >
            <div className="email-item-header">
              <div className="email-item-sender">
                {getPriorityIcon(email.priority)}
                <span>{email.sender}</span>
              </div>
              <div className="email-item-time">
                {new Date(email.timestamp).toLocaleDateString()}
              </div>
            </div>
            <div className="email-item-subject">{email.subject}</div>
            <div className="email-item-preview">
              {email.content.substring(0, 100)}...
            </div>
            {email.attachments.length > 0 && (
              <div className="email-item-attachments">
                <Paperclip size={14} />
                <span>{email.attachments.length}개의 첨부파일</span>
              </div>
            )}
            {email.labels.length > 0 && (
              <div className="email-item-labels">
                {email.labels.map((label, index) => (
                  <span key={index} className="email-label-small">{label}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDesktopUI = () => (
    <div className={`messenger-container ${(isWidget && (selectedChat || selectedEmail || isComposing)) ? 'widget-fullscreen' : ''}`}>
      {(!isWidget || (!selectedChat && !selectedEmail && !isComposing)) && (
        <div className="chat-list">
          <div className="messenger-tabs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`messenger-tab ${activeTab === 'chat' ? 'active' : ''}`}
            >
              <MessageCircle size={20} />
              <span>채팅</span>
            </button>
            <button
              onClick={() => setActiveTab('mail')}
              className={`messenger-tab ${activeTab === 'mail' ? 'active' : ''}`}
            >
              <Mail size={20} />
              <span>메일</span>
            </button>
          </div>

          {activeTab === 'chat' ? (
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
          ) : (
            <div className="mail-menu">
              <button onClick={handleComposeEmail} className="compose-button">
                <Plus size={18} />
                <span>메일쓰기</span>
              </button>
              <div className="mailbox-list">
                <button
                  className={`mailbox-item ${mailboxTab === 'inbox' ? 'active' : ''}`}
                  onClick={() => setMailboxTab('inbox')}
                >
                  <Mail size={18} />
                  <span>받은메일함</span>
                  {emails.inbox.filter(email => !email.isRead).length > 0 && (
                    <span className="unread-count">
                      {emails.inbox.filter(email => !email.isRead).length}
                    </span>
                  )}
                </button>
                <button
                  className={`mailbox-item ${mailboxTab === 'sent' ? 'active' : ''}`}
                  onClick={() => setMailboxTab('sent')}
                >
                  <Send size={18} />
                  <span>보낸메일함</span>
                </button>
                <button
                  className={`mailbox-item ${mailboxTab === 'drafts' ? 'active' : ''}`}
                  onClick={() => setMailboxTab('drafts')}
                >
                  <Edit3 size={18} />
                  <span>임시보관함</span>
                  {emails.drafts.length > 0 && (
                    <span className="draft-count">{emails.drafts.length}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="content-container">
        {activeTab === 'chat' ? (
          selectedChat ? (
            <>
              <div className="chat-header">
                <div className="chat-header-content">
                  {isWidget && (
                    <button onClick={handleBack} className="back-button">
                      <ArrowLeft size={24} />
                    </button>
                  )}
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
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="empty-state">
              채팅을 선택해주세요
            </div>
          )
        ) : (
          <div className="mail-content">
            {isComposing ? (
              <>
                {isWidget && (
                  <button onClick={() => setIsComposing(false)} className="back-button">
                    <ArrowLeft size={24} />
                  </button>
                )}
                {renderEmailComposer()}
              </>
            ) : selectedEmail ? (
              <>
                {isWidget && (
                  <button onClick={() => setSelectedEmail(null)} className="back-button">
                    <ArrowLeft size={24} />
                  </button>
                )}
                {renderEmailDetail(selectedEmail)}
              </>
            ) : (
              renderEmailList()
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderMobileUI = () => (
    <div className="messenger-container mobile">
      {selectedChat ? (
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
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="chat-list full-width">
          <div className="mobile-header">
            <div className="messenger-tabs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`messenger-tab ${activeTab === 'chat' ? 'active' : ''}`}
              >
                <MessageCircle size={20} />
                <span>채팅</span>
              </button>
              <button
                onClick={() => setActiveTab('mail')}
                className={`messenger-tab ${activeTab === 'mail' ? 'active' : ''}`}
              >
                <Mail size={20} />
                <span>메일</span>
              </button>
            </div>
          </div>
          
          {activeTab === 'chat' ? (
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
          ) : (
            <div className="mobile-mail-container">
              {isComposing ? (
                renderEmailComposer()
              ) : selectedEmail ? (
                renderEmailDetail(selectedEmail)
              ) : (
                <div className="mobile-mail-list">
                  <div className="mobile-mail-tabs">
                    <select
                      value={mailboxTab}
                      onChange={(e) => setMailboxTab(e.target.value)}
                      className="mobile-mailbox-select"
                    >
                      <option value="inbox">받은메일함</option>
                      <option value="sent">보낸메일함</option>
                      <option value="drafts">임시보관함</option>
                    </select>
                    <button onClick={handleComposeEmail} className="mobile-compose-button">
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="mobile-email-items">
                    {emails[mailboxTab].map(email => (
                      <div
                        key={email.id}
                        className={`mobile-email-item ${!email.isRead ? 'unread' : ''}`}
                        onClick={() => setSelectedEmail(email)}
                      >
                        <div className="mobile-email-header">
                          {getPriorityIcon(email.priority)}
                          <span className="mobile-email-sender">{email.sender}</span>
                          <span className="mobile-email-time">
                            {new Date(email.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mobile-email-subject">{email.subject}</div>
                        <div className="mobile-email-preview">
                          {email.content.substring(0, 60)}...
                        </div>
                        {(email.attachments.length > 0 || email.labels.length > 0) && (
                          <div className="mobile-email-footer">
                            {email.attachments.length > 0 && (
                              <span className="mobile-attachment-indicator">
                                <Paperclip size={14} />
                                {email.attachments.length}
                              </span>
                            )}
                            {email.labels.map((label, index) => (
                              <span key={index} className="mobile-email-label">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="messenger-app">
      {isMobile ? renderMobileUI() : renderDesktopUI()}
    </div>
  );
};

export default MessengerForm;