import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultProfileImage from '../../assets/profile1.png';
import '../../styles/home.css';

const Main = () => {
    const [user, setUser] = useState({
        name: "",
        position: "",
        department: "",
        employeeId: "",
        email: "",
        profileImage: defaultProfileImage
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/api/user/me');
                const userData = response.data;

                setUser({
                    name: userData.name,
                    position: userData.position,
                    department: userData.department,
                    employeeId: userData.employeeId,
                    email: userData.email,
                    profileImage: defaultProfileImage // 프로필 이미지는 현재 기본 이미지 사용
                });

                // 비밀번호 변경이 필요한 경우
                if (userData.passwordChangeRequired) {
                    // 비밀번호 변경 페이지로 리다이렉트
                    window.location.href = '/password-change';
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                setError('사용자 정보를 불러오는데 실패했습니다.');
                if (error.response?.status === 401) {
                    window.location.href = '/';  // 인증되지 않은 경우 로그인 페이지로
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div className="dashboard-content container">
            <div className="loading">Loading...</div>
        </div>;
    }

    if (error) {
        return <div className="dashboard-content container">
            <div className="error">{error}</div>
        </div>;
    }

    return (
        <section className="dashboard-content container">
            <div className="welcome-section">
                <div className="welcome-header">
                    <div className="welcome-info">
                        <div className="profile-container">
                            <div className="profile-image-wrapper">
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="profile-image"
                                    onError={(e) => {
                                        e.target.src = defaultProfileImage;
                                    }}
                                />
                            </div>
                            <div className="user-info">
                                <h1>안녕하세요, <span className="gradient-text">{user.name}</span>님</h1>
                                <p className="position-text">{user.department} · {user.position}</p>
                            </div>
                        </div>
                    </div>
                    <button className="notification-button">
                        <i className="fas fa-bell"></i>
                    </button>
                </div>
            </div>

            {/* 상태 카드는 추후 해당 API 구현 후 추가 예정 */}
            <div className="status-grid">
                <div className="status-card">
                    <div className="status-content">
                        <i className="fas fa-tasks text-primary"></i>
                        <div className="status-info">
                            <h3>할 일</h3>
                            <p className="text-primary">-</p>
                        </div>
                    </div>
                </div>
                <div className="status-card">
                    <div className="status-content">
                        <i className="fas fa-envelope text-success"></i>
                        <div className="status-info">
                            <h3>새 메시지</h3>
                            <p className="text-success">-</p>
                        </div>
                    </div>
                </div>
                <div className="status-card">
                    <div className="status-content">
                        <i className="fas fa-video text-secondary"></i>
                        <div className="status-info">
                            <h3>오늘 회의</h3>
                            <p className="text-secondary">-</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Main;