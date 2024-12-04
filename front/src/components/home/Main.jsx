import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileSection from './ProfileSection';
import StatusGrid from './StatusGrid';
import ActivityCard from './ActivityCard';
import CalendarForm from '../calendar/CalendarForm';
import defaultProfileImage from '../../assets/profile1.png';
import '../../styles/home.css';

const Main = () => {


    {/* 실제 기능 */}
    const [user, setUser] = useState({
        name: "",
        position: "",
        department: "",
        employeeId: "",
        email: "",
        profileImage: defaultProfileImage
    });
    {/* 실제 기능 */}

    {/* 테스트 정보 */}
    //     const mockUser = {
    //         name: "김지원",
    //         position: "선임연구원",
    //         department: "AI연구소",
    //         employeeId: "EMP2024001",
    //         email: "jiwon.kim@company.com",
    //         profileImage: defaultProfileImage
    // };

    // // 목업 통계 데이터
    // const mockStats = {
    //     attendanceStats: {
    //         title: '근태 현황',
    //         stats: [
    //             { label: '정상 출근', value: '15일' },
    //             { label: '지각', value: '1일' },
    //             { label: '조퇴', value: '0일' },
    //             { label: '결근', value: '0일' }
    //         ]
    //     },
    //     leaveStats: {
    //         title: '휴가 현황',
    //         stats: [
    //             { label: '총 휴가', value: '15일' },
    //             { label: '사용 휴가', value: '5일' },
    //             { label: '잔여 휴가', value: '10일' }
    //         ]
    //     },
    //     overtimeStats: {
    //         title: '초과근무 현황',
    //         stats: [
    //             { label: '이번달 초과근무', value: '12시간' },
    //             { label: '승인된 초과근무', value: '10시간' },
    //             { label: '수당 지급 예정', value: '10시간' }
    //         ]
    //     }
    // };

    // // 목업 활동 데이터
    // const mockActivities = [
    //     {
    //         id: 1,
    //         type: '휴가',
    //         title: '연차 휴가 신청',
    //         status: '승인완료',
    //         date: '2024-12-05',
    //         description: '12월 5일 연차 휴가'
    //     },
    //     {
    //         id: 2,
    //         type: '초과근무',
    //         title: '초과근무 신청',
    //         status: '승인대기',
    //         date: '2024-12-03',
    //         description: '프로젝트 마감으로 인한 초과근무 2시간'
    //     },
    //     {
    //         id: 3,
    //         type: '근태',
    //         title: '지각 사유서',
    //         status: '제출완료',
    //         date: '2024-12-02',
    //         description: '교통 체증으로 인한 지각'
    //     },
    //     {
    //         id: 4,
    //         type: '휴가',
    //         title: '반차 신청',
    //         status: '승인완료',
    //         date: '2024-12-01',
    //         description: '오후 반차'
    //     },
    //     {
    //         id: 5,
    //         type: '초과근무',
    //         title: '초과근무 신청',
    //         status: '승인완료',
    //         date: '2024-11-30',
    //         description: '긴급 장애 대응으로 인한 초과근무 3시간'
    //     }
    // ];
    
    // const [user, setUser] = useState(mockUser);
    // const [stats, setStats] = useState(mockStats);
    // const [activities, setActivities] = useState(mockActivities);
    {/* 테스트 정보 */}

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    {/* 테스트 정보 */}
    // useEffect(() => {
    //     const fetchUserData = async () => {
    //         try {
    //             // 실제 API 호출 대신 목업 데이터 사용
    //             setTimeout(() => {
    //                 setUser(mockUser);
    //                 setStats(mockStats);
    //                 setActivities(mockActivities);
    //                 setLoading(false);
    //             }, 500);
    //         } catch (error) {
    //             setError('사용자 정보를 불러오는데 실패했습니다.');
    //             setLoading(false);
    //         }
    //     };

    //     fetchUserData();
    // }, []);
    {/* 테스트 정보 */}

    {/* 실제 기능 */}
    useEffect(() => {
        const getUserFromSession = () => {
            try {
                const userInfoStr = sessionStorage.getItem('userInfo');
                // if (!userInfoStr) {
                //     // 세션에 사용자 정보가 없으면 로그인 페이지로
                //     window.location.href = '/';
                //     return;
                // }

                const userData = JSON.parse(userInfoStr);
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
                    window.location.href = '/password-change';
                }
            } catch (error) {
                console.error('Failed to get user data from session:', error);
                setError('사용자 정보를 불러오는데 실패했습니다.');
                // window.location.href = '/';
            } finally {
                setLoading(false);
            }
        };

        getUserFromSession();
    }, []);
    {/* 실제 기능 */}

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
        <div className="dashboard-content container">
            <div className="dashboard-grid">
                {/* Left Column */}
                <div className="dashboard-column">
                    <div className="status-card">
                        <ProfileSection user={user} />
                    </div>
                    <div className="mini-calendar-card">
                        <h2 className="card-title">일정</h2>
                        <div style={{ height: '400px' }}>
                            <CalendarForm height="100%" minimode={true} />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                {/* <div className="dashboard-column">
                    <StatusGrid stats={stats} />
                    <ActivityCard activities={activities} />
                </div> */}

               {/* 실제 기능 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    <StatusGrid stats={user} />
                    <ActivityCard activities={activities} />
                </div>
                {/* 실제 기능 */}
            </div>
        </div>

    );
};

export default Main;