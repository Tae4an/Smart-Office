import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../../styles/layout.css';

const Header = ({ setIsMenuOpen }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 5;

    const [notifications, setNotifications] = useState([
        // 알림이 있을 경우
        // { id: 1, message: "새로운 공지사항이 등록되었습니다.", date: "2024-12-09" }
    ]);

    // JSON 서버에서 데이터 가져오기 부분을 하드코딩된 데이터로 변경
    const userData = [
        {
            "id": "EMP001",
            "name": "김지원",
            "position": "선임연구원",
            "department": "AI연구소",
            "email": "jiwon.kim@company.com"
        },
        {
            "id": "EMP002",
            "name": "이민수",
            "position": "책임연구원",
            "department": "개발팀",
            "email": "minsu.lee@company.com"
        },
        {
            "id": "EMP003",
            "name": "박서연",
            "position": "대리",
            "department": "HR팀",
            "email": "seoyeon.park@company.com"
        },
        {
            "id": "EMP004",
            "name": "정현우",
            "position": "수석연구원",
            "department": "AI연구소",
            "email": "hyunwoo.jung@company.com"
        },
        {
            "id": "EMP005",
            "name": "송미라",
            "position": "과장",
            "department": "마케팅팀",
            "email": "mira.song@company.com"
        },
        {
            "id": "EMP006",
            "name": "강동훈",
            "position": "책임연구원",
            "department": "개발팀",
            "email": "donghun.kang@company.com"
        },
        {
            "id": "EMP007",
            "name": "이수진",
            "position": "선임연구원",
            "department": "AI연구소",
            "email": "sujin.lee@company.com"
        },
        {
            "id": "EMP008",
            "name": "한지민",
            "position": "대리",
            "department": "재무팀",
            "email": "jimin.han@company.com"
        },
        {
            "id": "EMP009",
            "name": "최준호",
            "position": "수석연구원",
            "department": "개발팀",
            "email": "junho.choi@company.com"
        },
        {
            "id": "EMP010",
            "name": "박영희",
            "position": "과장",
            "department": "HR팀",
            "email": "younghee.park@company.com"
        },
        {
            "id": "EMP011",
            "name": "김태우",
            "position": "선임연구원",
            "department": "AI연구소",
            "email": "taewoo.kim@company.com"
        },
        {
            "id": "EMP012",
            "name": "이하은",
            "position": "대리",
            "department": "마케팅팀",
            "email": "haeun.lee@company.com"
        },
        {
            "id": "EMP013",
            "name": "정민성",
            "position": "책임연구원",
            "department": "개발팀",
            "email": "minsung.jung@company.com"
        },
        {
            "id": "EMP014",
            "name": "윤서아",
            "position": "과장",
            "department": "재무팀",
            "email": "seoa.yoon@company.com"
        },
        {
            "id": "EMP015",
            "name": "임재현",
            "position": "선임연구원",
            "department": "AI연구소",
            "email": "jaehyun.lim@company.com"
        },
        {
            "id": "EMP016",
            "name": "신다은",
            "position": "대리",
            "department": "HR팀",
            "email": "daeun.shin@company.com"
        },
        {
            "id": "EMP017",
            "name": "권현우",
            "position": "수석연구원",
            "department": "개발팀",
            "email": "hyunwoo.kwon@company.com"
        },
        {
            "id": "EMP018",
            "name": "장미영",
            "position": "과장",
            "department": "마케팅팀",
            "email": "miyoung.jang@company.com"
        },
        {
            "id": "EMP019",
            "name": "오승훈",
            "position": "책임연구원",
            "department": "AI연구소",
            "email": "seunghun.oh@company.com"
        },
        {
            "id": "EMP020",
            "name": "배수민",
            "position": "대리",
            "department": "재무팀",
            "email": "sumin.bae@company.com"
        },
        {
            "id": "EMP021",
            "name": "조은우",
            "position": "선임연구원",
            "department": "개발팀",
            "email": "eunwoo.jo@company.com"
        },
        {
            "id": "EMP022",
            "name": "황지현",
            "position": "과장",
            "department": "HR팀",
            "email": "jihyun.hwang@company.com"
        },
        {
            "id": "EMP023",
            "name": "노승준",
            "position": "책임연구원",
            "department": "AI연구소",
            "email": "seungjun.noh@company.com"
        },
        {
            "id": "EMP024",
            "name": "유민지",
            "position": "대리",
            "department": "마케팅팀",
            "email": "minji.yoo@company.com"
        },
        {
            "id": "EMP025",
            "name": "안현서",
            "position": "수석연구원",
            "department": "개발팀",
            "email": "hyunseo.ahn@company.com"
        },
        {
            "id": "EMP026",
            "name": "홍서영",
            "position": "과장",
            "department": "재무팀",
            "email": "seoyoung.hong@company.com"
        },
        {
            "id": "EMP027",
            "name": "백승호",
            "position": "선임연구원",
            "department": "AI연구소",
            "email": "seungho.baek@company.com"
        },
        {
            "id": "EMP028",
            "name": "서은지",
            "position": "대리",
            "department": "HR팀",
            "email": "eunji.seo@company.com"
        },
        {
            "id": "EMP029",
            "name": "남동현",
            "position": "책임연구원",
            "department": "개발팀",
            "email": "donghyun.nam@company.com"
        },
        {
            "id": "EMP030",
            "name": "문예진",
            "position": "과장",
            "department": "마케팅팀",
            "email": "yejin.moon@company.com"
        },
        {
            "id": "EMP031",
            "name": "국민호",
            "position": "선임연구원",
            "department": "AI연구소",
            "email": "minho.kook@company.com"
        },
        {
            "id": "EMP032",
            "name": "성지원",
            "position": "대리",
            "department": "재무팀",
            "email": "jiwon.sung@company.com"
        },
        {
            "id": "EMP033",
            "name": "구본영",
            "position": "수석연구원",
            "department": "개발팀",
            "email": "bonyoung.koo@company.com"
        },
        {
            "id": "EMP034",
            "name": "민서연",
            "position": "과장",
            "department": "HR팀",
            "email": "seoyeon.min@company.com"
        },
        {
            "id": "EMP035",
            "name": "석현민",
            "position": "책임연구원",
            "department": "AI연구소",
            "email": "hyunmin.seok@company.com"
        },
        {
            "id": "EMP036",
            "name": "염하윤",
            "position": "대리",
            "department": "마케팅팀",
            "email": "hayun.yeom@company.com"
        },
        {
            "id": "EMP037",
            "name": "설지훈",
            "position": "선임연구원",
            "department": "개발팀",
            "email": "jihoon.seol@company.com"
        },
        {
            "id": "EMP038",
            "name": "진수아",
            "position": "과장",
            "department": "재무팀",
            "email": "sua.jin@company.com"
        },
        {
            "id": "EMP039",
            "name": "기태윤",
            "position": "책임연구원",
            "department": "AI연구소",
            "email": "taeyoon.ki@company.com"
        },
        {
            "id": "EMP040",
            "name": "마윤서",
            "position": "대리",
            "department": "HR팀",
            "email": "yoonseo.ma@company.com"
        },
        {
            "id": "EMP041",
            "name": "피동하",
            "position": "수석연구원",
            "department": "개발팀",
            "email": "dongha.pi@company.com"
        },
        {
            "id": "EMP042",
            "name": "전지아",
            "position": "과장",
            "department": "마케팅팀",
            "email": "jia.jeon@company.com"
        },
        {
            "id": "EMP043",
            "name": "복승민",
            "position": "선임연구원",
            "department": "AI연구소",
            "email": "seungmin.bok@company.com"
        },
        {
            "id": "EMP044",
            "name": "심도원",
            "position": "대리",
            "department": "재무팀",
            "email": "dowon.shim@company.com"
        },
        {
            "id": "EMP045",
            "name": "공주원",
            "position": "책임연구원",
            "department": "개발팀",
            "email": "juwon.gong@company.com"
        },
        {
            "id": "EMP046",
            "name": "방은수",
            "position": "과장",
            "department": "HR팀",
            "email": "eunsoo.bang@company.com"
        },
        {
            "id": "EMP047",
            "name": "여승우",
            "position": "선임연구원",
            "department": "AI연구소",
            "email": "seungwoo.yeo@company.com"
        },
        {
            "id": "EMP048",
            "name": "탁서진",
            "position": "대리",
            "department": "마케팅팀",
            "email": "seojin.tak@company.com"
        },
        {
            "id": "EMP049",
            "name": "범현수",
            "position": "수석연구원",
            "department": "개발팀",
            "email": "hyunsoo.bum@company.com"
        },
        {
            "id": "EMP050",
            "name": "추미란",
            "position": "과장",
            "department": "재무팀",
            "email": "miran.choo@company.com"
        }
    ];

    const handleLogout = async () => {
        try {
            const response = await axios.post('/logout', {}, {
                withCredentials: true // 쿠키 포함
            });

            if (response.status === 200) {
                // 세션스토리지에서 사용자 정보 제거
                sessionStorage.removeItem('userInfo');
                navigate('/');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    }

    // 검색 모달 토글
    const toggleSearchModal = () => {
        setShowSearchModal(!showSearchModal);
        if(!showSearchModal) {
            setSearchTerm('');
            setDisplayedResults([]);
        }
    };

    // EmployeeForm.jsx의 검색 로직
    const handleSearch = (e) => {
        e.preventDefault();
        
        let results = userData.filter(item => {
            return (
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.position.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        console.log(`검색어 "${searchTerm}"에 대한 검색 결과: ${results.length}건`);
        
        setSearchResults(results);
        setDisplayedResults(results.slice(0, itemsPerPage));
        setPage(1);
    };

    // loadMore 함수 수정
    const loadMore = useCallback(() => {
        if (isLoading || displayedResults.length >= searchResults.length) return;

        setIsLoading(true);

        setTimeout(() => {
            const nextIndex = page * itemsPerPage;
            const newResults = searchResults.slice(nextIndex, nextIndex + itemsPerPage);
            
            setDisplayedResults(prev => [...prev, ...newResults]);
            setPage(prev => prev + 1);
            setIsLoading(false);
        }, 1000);
    }, [page, searchResults, displayedResults.length, isLoading]);

    // 검색어 변경 시 검색 실행
    useEffect(() => {
        if (searchTerm) {
            handleSearch({ preventDefault: () => {} });
        }
    }, [searchTerm]);

    // 스크롤 이벤트 처리기 수정
    useEffect(() => {
        if (!searchTerm) return;

        const handleScroll = (e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            if (scrollHeight - (scrollTop + clientHeight) < 50 && !isLoading) {
                loadMore();
            }
        };

        const resultsElement = document.querySelector('.search-results');
        if (resultsElement) {
            resultsElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (resultsElement) {
                resultsElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [searchTerm, loadMore, isLoading]);

    return(
        <header className="header">
            <div className="header-container">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="이름, 부서, 직급으로 직원 검색 (예: 홍길동, 인사팀, 과장)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                    {searchTerm && (
                        <div className="search-modal">
                            <div className="search-modal-content">
                                <div className="search-results">
                                    {displayedResults.length > 0 ? (
                                        <>
                                            <ul className="results-list">
                                                {displayedResults.map((employee) => (
                                                    <li key={employee.id} className="result-item">
                                                        <div className="employee-info">
                                                            <strong>{employee.name}</strong>
                                                            <span>{employee.department} - {employee.position}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            {/* 로딩 UI를 리스트 아래로 이동 */}
                                            {isLoading && (
                                                <div className="search-loading">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    <p>Loading more results...</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        searchTerm && <p className="no-results">검색 결과가 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="header-right">
                    <div className="notification-wrapper">
                        <button className="notification-btn" onClick={toggleNotifications}>
                            <i className="fas fa-bell"></i>
                            {notifications.length > 0 && <span className="notification-badge"></span>}
                        </button>

                        {showNotifications && (
                            <div className="notification-modal">
                                <div className="notification-header">
                                    <h3>알림</h3>
                                    <button className="close-btn" onClick={toggleNotifications}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <div className="notification-content">
                                    {notifications.length > 0 ? (
                                        <ul className="notification-list">
                                            {notifications.map(notification => (
                                                <li key={notification.id} className="notification-item">
                                                    <p>{notification.message}</p>
                                                    <span className="notification-date">
                                                        {notification.date}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="no-notifications">
                                            <p>새로운 알림이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>로그아웃</span>
                    </button>
                    <button
                        className="menu-toggle"
                        onClick={() => setIsMenuOpen(prev => !prev)}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    setIsMenuOpen: PropTypes.func.isRequired
}

export default Header;