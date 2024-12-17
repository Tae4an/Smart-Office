import { useState } from 'react';
import '../../styles/settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="settings-page">
            <div className="settings-container">
                <h1 className="page-title">설정</h1>
                <div className="settings-content">
                    <div className="settings-sidebar">
                        <button 
                            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            일반 설정
                        </button>
                        <button 
                            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            알림 설정
                        </button>
                        <button 
                            className={`settings-tab ${activeTab === 'workspace' ? 'active' : ''}`}
                            onClick={() => setActiveTab('workspace')}
                        >
                            업무 환경 설정
                        </button>
                    </div>
                    <div className="settings-main">
                        {activeTab === 'general' && (
                            <div className="settings-section">
                                <h2>일반 설정</h2>
                                <div className="settings-option">
                                    <label>언어</label>
                                    <select>
                                        <option value="ko">한국어</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div className="settings-option">
                                    <label>테마</label>
                                    <select>
                                        <option value="light">라이트</option>
                                        <option value="dark">다크</option>
                                    </select>
                                </div>
                                <div className="settings-option">
                                    <label>시간 표시 형식</label>
                                    <select>
                                        <option value="12">12시간 (오전/오후)</option>
                                        <option value="24">24시간</option>
                                    </select>
                                </div>
                                <div className="settings-option">
                                    <label>캘린더 시작 요일</label>
                                    <select>
                                        <option value="sunday">일요일</option>
                                        <option value="monday">월요일</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        {activeTab === 'notifications' && (
                            <div className="settings-section">
                                <h2>알림 설정</h2>
                                <div className="settings-option">
                                    <label>전자결재 알림</label>
                                    <input type="checkbox" />
                                </div>
                                <div className="settings-option">
                                    <label>업무 할당 알림</label>
                                    <input type="checkbox" />
                                </div>
                                <div className="settings-option">
                                    <label>회의 일정 알림</label>
                                    <input type="checkbox" />
                                </div>
                                <div className="settings-option">
                                    <label>프로젝트 마감 알림</label>
                                    <input type="checkbox" />
                                </div>
                            </div>
                        )}
                        {activeTab === 'workspace' && (
                            <div className="settings-section">
                                <h2>업무 환경 설정</h2>
                                <div className="settings-option">
                                    <label>자동 자리비움 설정</label>
                                    <select>
                                        <option value="30">30분 후</option>
                                        <option value="60">1시간 후</option>
                                        <option value="never">사용 안함</option>
                                    </select>
                                </div>
                                <div className="settings-option">
                                    <label>메일 자동 분류</label>
                                    <input type="checkbox" />
                                </div>
                                <div className="settings-option">
                                    <label>업무 보고서 자동 저장</label>
                                    <select>
                                        <option value="5">5분마다</option>
                                        <option value="10">10분마다</option>
                                        <option value="30">30분마다</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
