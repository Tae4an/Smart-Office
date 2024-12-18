// ProfileSection.jsx
import React, { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';
import '../../styles/dashboard.css';

const ProfileSection = ({ user: initialUser, stats }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(initialUser);
    const { attendanceStats, leaveStats, overtimeStats } = stats;

    useEffect(() => {
        // 로컬 스토리지에서 저장된 프로필 정보 불러오기
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            setUser(JSON.parse(savedProfile));
        }
    }, []);

    const handleUpdateProfile = (updatedUser) => {
        setUser(updatedUser);
    };

    const statsData = [
        {
            label: '출근 일수',
            value: `${15}/${22}`, // 현재 출근일/전체 출근일
            rawValue: `출근 ${15}일 / 총 ${22}일`,
            color: 'var(--primary)',
            suffix: ''
        },
        {
            label: '휴가',
            value: `${leaveStats.stats[1].value}/${leaveStats.stats[0].value}`,
            rawValue: `사용 ${leaveStats.stats[1].value}일 / 총 ${leaveStats.stats[0].value}일`,
            color: '#22c55e',
            suffix: ''
        },
        {
            label: '초과근무',
            value: `${overtimeStats.mainStat.value}/40`,  // "12/40" 형식으로 표시
            rawValue: `${overtimeStats.mainStat.value}시간 / 월 최대 40시간`,
            color: '#f97316',
            suffix: 'h'
        }
    ];

    return (
        <div className="profile-card">
            <div 
                className="profile-container" 
                style={{ 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center',
                    cursor: 'pointer'
                }}
                onClick={() => setIsModalOpen(true)}
            >
                {/* 기존 프로필 정보 */}
                <div className="profile-image-wrapper" style={{ width: '100px', height: '100px', marginBottom: 'var(--spacing-2)' }}>
                    <img src={user.profileImage} alt="profile" className="profile-image" />
                </div>
                <div className="user-info">
                    <h1 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                        <span className="gradient-text">{user.name}</span>님
                    </h1>
                    <p className="position-text">{user.department}</p>
                    <p className="position-text">{user.position}</p>
                    <p className="position-text" style={{ fontSize: '0.7rem' }}>{user.employeeId}</p>
                    <p className="position-text" style={{ fontSize: '0.7rem' }}>{user.email}</p>
                </div>

                {/* 근태 통계 추가 */}
                <div className="attendance-stats">
                    {statsData.map((stat, index) => (
                        <div key={index} className="stat-progress-container">
                            <div className="stat-progress-label">
                                <span>{stat.label}</span>
                                <span title={stat.rawValue}>
                                    {stat.value}{stat.suffix}
                                </span>
                            </div>
                            <div className="stat-progress-bar">
                                <div 
                                    className="stat-progress-fill"
                                    style={{ 
                                        width: stat.label === '출근 일수' ? `${(15 / 22) * 100}%` :
                                               stat.label === '휴가' ? `${(parseInt(leaveStats.stats[1].value) / parseInt(leaveStats.stats[0].value)) * 100}%` :
                                               `${(parseInt(overtimeStats.mainStat.value) / 40) * 100}%`,
                                        backgroundColor: stat.color
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ProfileModal 
                user={user}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleUpdateProfile}
            />
        </div>
    );
};

export default ProfileSection;