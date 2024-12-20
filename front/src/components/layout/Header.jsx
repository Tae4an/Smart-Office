import {useNavigate} from "react-router-dom";
import PropTypes from 'prop-types';
import {useState, useEffect, useCallback, useMemo} from 'react';
import axios from 'axios';
import {fetchWeatherData} from '../../utils/WeatherUtils';
import VerifyModal from '../ai/VerifyModal';
import '../../styles/layout.css';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar
} from "@mui/material";

const Header = ({setIsMenuOpen}) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 5;

    // 프로필 모달 상태 추가
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [modalPosition, setModalPosition] = useState({x: 0, y: 0});

    // notifications 상태를 const로 변경 (setNotifications 사용하지 않음)
    const notifications = [
        {id: 1, message: "새로운 공지사항이 등록되었습니다.", date: "2024-12-09"},
        {id: 2, message: "12월 정기 회의 일정이 변경되었습니다.", date: "2024-12-08"},
        {id: 3, message: "연말 워크샵 참석 여부를 확인해주세요.", date: "2024-12-07"},
        {id: 4, message: "새로운 프로젝트 킥오프 미팅이 예정되어 있습니다.", date: "2024-12-06"},
        {id: 5, message: "보안 교육 이수 기간이 7일 남았습니다.", date: "2024-12-05"}
    ];

    // JSON 서버에서 데이터 가져오기 부분을 하드코딩된 데이터로 변경
    const userData = useMemo(() => [
        {
            "id": "LAW001",
            "name": "이종수",
            "position": "이사",
            "department": "법무팀",
            "email": "lee.js@example.com"
        },
        {
            "id": "LAW002",
            "name": "김현주",
            "position": "부장",
            "department": "법무팀",
            "email": "kim.hj@example.com"
        },
        {
            "id": "LAW003",
            "name": "박승균",
            "position": "대리",
            "department": "법무팀",
            "email": "park.sk@example.com"
        },
        {
            "id": "LAW004",
            "name": "최은영",
            "position": "사원",
            "department": "법무팀",
            "email": "choi.ey@example.com"
        },
        {
            "id": "SEC001",
            "name": "김정훈",
            "position": "이사",
            "department": "보안팀",
            "email": "kim.jh@example.com"
        },
        {
            "id": "SEC002",
            "name": "이승윤",
            "position": "부장",
            "department": "보안팀",
            "email": "lee.sy@example.com"
        },
        {
            "id": "SEC003",
            "name": "박도경",
            "position": "대리",
            "department": "보안팀",
            "email": "park.dk@example.com"
        },
        {
            "id": "SEC004",
            "name": "최현규",
            "position": "사원",
            "department": "보안팀",
            "email": "choi.hk@example.com"
        },
        {
            "id": "SEC005",
            "name": "정은주",
            "position": "사원",
            "department": "보안팀",
            "email": "jung.ej@example.com"
        },
        {
            "id": "GA001",
            "name": "박상현",
            "position": "이사",
            "department": "총무팀",
            "email": "park.sh@example.com"
        },
        {
            "id": "GA002",
            "name": "김은지",
            "position": "부장",
            "department": "총무팀",
            "email": "kim.ej@example.com"
        },
        {
            "id": "GA003",
            "name": "이동훈",
            "position": "대리",
            "department": "총무팀",
            "email": "lee.dh@example.com"
        },
        {
            "id": "GA004",
            "name": "최수연",
            "position": "사원",
            "department": "총무팀",
            "email": "choi.sy@example.com"
        },
        {
            "id": "GA005",
            "name": "정재우",
            "position": "사원",
            "department": "총무팀",
            "email": "jung.jw@example.com"
        },
        {
            "id": "GA006",
            "name": "강혜진",
            "position": "사원",
            "department": "총무팀",
            "email": "kang.hj@example.com"
        },
        {
            "id": "FIN001",
            "name": "김동현",
            "position": "이사",
            "department": "재무팀",
            "email": "kim.dh@example.com"
        },
        {
            "id": "FIN002",
            "name": "박수영",
            "position": "부장",
            "department": "재무팀",
            "email": "park.sy@example.com"
        },
        {
            "id": "FIN003",
            "name": "이정원",
            "position": "차장",
            "department": "재무팀",
            "email": "lee.jw@example.com"
        },
        {
            "id": "FIN004",
            "name": "최현영",
            "position": "대리",
            "department": "재무팀",
            "email": "choi.hy@example.com"
        },
        {
            "id": "FIN005",
            "name": "정승환",
            "position": "사원",
            "department": "재무팀",
            "email": "jung.sk@example.com"
        },
        {
            "id": "FIN006",
            "name": "강민정",
            "position": "사원",
            "department": "재무팀",
            "email": "kang.mj@example.com"
        },
        {
            "id": "FIN007",
            "name": "오준혁",
            "position": "사원",
            "department": "재무팀",
            "email": "oh.jh@example.com"
        },
        {
            "id": "DEV0016",
            "name": "김재석",
            "position": "이사",
            "department": "개발팀",
            "email": "kim.js@example.com"
        },
        {
            "id": "DEV0017",
            "name": "이용석",
            "position": "부장",
            "department": "개발팀",
            "email": "lee.ys@example.com"
        },
        {
            "id": "DEV0018",
            "name": "박현정",
            "position": "차장",
            "department": "개발팀",
            "email": "park.hj@example.com"
        },
        {
            "id": "DEV004",
            "name": "최성우",
            "position": "과장",
            "department": "개발팀",
            "email": "choi.sw@example.com"
        },
        {
            "id": "DEV005",
            "name": "정재현",
            "position": "대리",
            "department": "개발팀",
            "email": "jung.jh@example.com"
        },
        {
            "id": "DEV006",
            "name": "강민서",
            "position": "사원",
            "department": "개발팀",
            "email": "kang.ms@example.com"
        },
        {
            "id": "DEV007",
            "name": "오윤주",
            "position": "사원",
            "department": "개발팀",
            "email": "oh.yj@example.com"
        },
        {
            "id": "DEV008",
            "name": "한승규",
            "position": "사원",
            "department": "개발팀",
            "email": "han.sk@example.com"
        },
        {
            "id": "DEV009",
            "name": "송지민",
            "position": "사원",
            "department": "개발팀",
            "email": "song.jm@example.com"
        },
        {
            "id": "DEV010",
            "name": "윤혁규",
            "position": "사원",
            "department": "개발팀",
            "email": "yoon.hk@example.com"
        },
        {
            "id": "DEV011",
            "name": "신은영",
            "position": "사원",
            "department": "개발팀",
            "email": "shin.ey@example.com"
        },
        {
            "id": "DEV012",
            "name": "구도현",
            "position": "사원",
            "department": "개발팀",
            "email": "gu.dh@example.com"
        },
        {
            "id": "DEV013",
            "name": "권지우",
            "position": "사원",
            "department": "개발팀",
            "email": "kwon.jw@example.com"
        },
        {
            "id": "DEV014",
            "name": "임수연",
            "position": "사원",
            "department": "개발팀",
            "email": "im.sy@example.com"
        },
        {
            "id": "DEV015",
            "name": "류원기",
            "position": "사원",
            "department": "개발팀",
            "email": "ryu.wk@example.com"
        },
        {
            "id": "HR001",
            "name": "박지훈",
            "position": "이사",
            "department": "인사팀",
            "email": "park.jh@example.com"
        },
        {
            "id": "HR002",
            "name": "김서현",
            "position": "부장",
            "department": "인사팀",
            "email": "kim.sh1@example.com"
        },
        {
            "id": "HR003",
            "name": "이윤지",
            "position": "차장",
            "department": "인사팀",
            "email": "lee.yj@example.com"
        },
        {
            "id": "HR004",
            "name": "최민호",
            "position": "과장",
            "department": "인사팀",
            "email": "choi.mh@example.com"
        },
        {
            "id": "HR005",
            "name": "정혜선",
            "position": "대리",
            "department": "인사팀",
            "email": "jung.hs@example.com"
        },
        {
            "id": "HR006",
            "name": "강지수",
            "position": "사원",
            "department": "인사팀",
            "email": "kang.js@example.com"
        },
        {
            "id": "HR007",
            "name": "손은경",
            "position": "사원",
            "department": "인사팀",
            "email": "son.ek@example.com"
        },
        {
            "id": "HR008",
            "name": "양우진",
            "position": "사원",
            "department": "인사팀",
            "email": "yang.wj@example.com"
        },
        {
            "id": "HR009",
            "name": "황선영",
            "position": "사원",
            "department": "인사팀",
            "email": "hwang.sy@example.com"
        },
        {
            "id": "HR010",
            "name": "배동환",
            "position": "사원",
            "department": "인사팀",
            "email": "bae.dh@example.com"
        },
        {
            "id": "SAL001",
            "name": "이상훈",
            "position": "이사",
            "department": "영업팀",
            "email": "lee.sh@example.com"
        },
        {
            "id": "SAL002",
            "name": "박지민",
            "position": "부장",
            "department": "영업팀",
            "email": "park.jm@example.com"
        },
        {
            "id": "SAL003",
            "name": "김현영",
            "position": "차장",
            "department": "영업팀",
            "email": "kim.hy@example.com"
        },
        {
            "id": "SAL004",
            "name": "최우진",
            "position": "과장",
            "department": "영업팀",
            "email": "choi.wj@example.com"
        },
        {
            "id": "SAL005",
            "name": "정수영",
            "position": "대리",
            "department": "영업팀",
            "email": "jung.sy@example.com"
        },
        {
            "id": "SAL006",
            "name": "강도현",
            "position": "사원",
            "department": "영업팀",
            "email": "kang.dh@example.com"
        },
        {
            "id": "SAL007",
            "name": "손은정",
            "position": "사원",
            "department": "영업팀",
            "email": "son.ej@example.com"
        },
        {
            "id": "SAL008",
            "name": "양승기",
            "position": "사원",
            "department": "영업팀",
            "email": "yang.sk@example.com"
        },
        {
            "id": "SAL009",
            "name": "황정훈",
            "position": "사원",
            "department": "영업팀",
            "email": "hwang.jh@example.com"
        },
        {
            "id": "SAL010",
            "name": "임연주",
            "position": "사원",
            "department": "영업팀",
            "email": "im.yj@example.com"
        },
        {
            "id": "SAL011",
            "name": "류민혁",
            "position": "사원",
            "department": "영업팀",
            "email": "ryu.mh@example.com"
        },
        {
            "id": "SAL012",
            "name": "배현서",
            "position": "사원",
            "department": "영업팀",
            "email": "bae.hs@example.com"
        }
    ], []);

    const handleLogout = async () => {
        try {
            const response = await axios.post('/logout', {}, {
                withCredentials: true // 쿠키 포함
            });

            if (response.status === 200) {
                // 세션스토리지에서 사용자 정보 제거
                sessionStorage.removeItem('userInfo');
                localStorage.removeItem('chatMessages');
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

    // 프로필 모달 표시 함수
    const handleEmployeeHover = (employee, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        // 모달이 화면 오른쪽을 벗어나지 않도록 위치 조정
        const x = rect.right + 10 > window.innerWidth ? window.innerWidth - 320 : rect.right + 10;
        const y = rect.top;

        setModalPosition({x, y});
        setSelectedEmployee(employee);
    };

    // 프로필 모달 숨기기
    const handleEmployeeLeave = () => {
        setSelectedEmployee(null);
    };

    // handleSearch를 useCallback으로 감싸서 의존성 문제 해결
    const handleSearch = useCallback((e) => {
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
    }, [searchTerm, userData]); // userData 의존성 추가

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
            handleSearch({
                preventDefault: () => {
                }
            });
        }
    }, [searchTerm, handleSearch]);

    // 스크롤 이벤트 처리기 수정
    useEffect(() => {
        if (!searchTerm) return;

        const handleScroll = (e) => {
            const {scrollTop, scrollHeight, clientHeight} = e.target;
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

    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);

    useEffect(() => {
        const getWeather = async (position) => {
            try {
                const {latitude, longitude} = position.coords;
                const weatherData = await fetchWeatherData(latitude, longitude);
                setWeather(weatherData);
                setWeatherLoading(false);
            } catch (error) {
                console.error('날씨 정보를 가져오는데 실패했습니다:', error);
                setWeatherLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getWeather);
        }
    }, []);

    const [isCheckedIn, setIsCheckedIn] = useState(() => {
        return sessionStorage.getItem('isCheckedIn') === 'true';
    });
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
    const [alertInfo, setAlertInfo] = useState({
        show: false,
        message: '',
        severity: 'success'
    });

    // 출근하기 버튼 클릭 핸들러
    const handleAttendanceClick = () => {
        if (!isCheckedIn) {
            setIsVerifyModalOpen(true);
        } else {
            setShowCheckoutDialog(true);
        }
    };

    // 퇴근 처리 핸들러
    const handleCheckout = () => {
        setIsCheckedIn(false);
        sessionStorage.setItem('isCheckedIn', 'false');
        setShowCheckoutDialog(false);
        setAlertInfo({
            show: true,
            message: '퇴근 처리가 완료되었습니다.',
            severity: 'success'
        });
    };

    const handleCheckinSuccess = () => {
        setIsCheckedIn(true);
        sessionStorage.setItem('isCheckedIn', 'true');
        setIsVerifyModalOpen(false);
        setAlertInfo({
            show: true,
            message: '출근 처리가 완료되었습니다.',
            severity: 'success'
        });
    };

    const handleAlertClose = () => {
        setAlertInfo(prev => ({ ...prev, show: false }));
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setDisplayedResults([]);
        setPage(1);
    };
    return (
        <header className="header">
            <div className="header-container">
                <div className="search-container">
                    <div className="search-bar-wrapper">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="이름, 부서, 직급으로 직원 검색 (예: 홍길동, 인사팀, 과장)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                        />
                        <button
                            className={`clear-search ${searchTerm ? 'visible' : ''}`}
                            onClick={clearSearch}
                            type="button"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    {searchTerm && (
                        <div className="search-modal">
                            <div className="search-modal-content">
                                <div className="search-results">
                                    {displayedResults.length > 0 ? (
                                        <>
                                            <ul className="results-list">
                                                {displayedResults.map((employee) => (
                                                    <li
                                                        key={employee.id}
                                                        className="result-item"
                                                        onMouseEnter={(e) => handleEmployeeHover(employee, e)}
                                                        onMouseLeave={handleEmployeeLeave}
                                                    >
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
                    <button
                        className={`check-${isCheckedIn ? 'out' : 'in'}-btn`}
                        onClick={handleAttendanceClick}
                        style={{
                            padding: '8px 16px',
                            marginRight: '16px',
                            backgroundColor: isCheckedIn ? '#dc3545' : '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        <i className={`fas fa-user-${isCheckedIn ? 'minus' : 'check'}`}></i>
                        <span>{isCheckedIn ? '퇴근하기' : '출근하기'}</span>
                    </button>
                    {!weatherLoading && weather && (
                        <div className="weather-info-mini">
                            <span className="weather-temp">{weather.temperature}°</span>
                            <span className="weather-desc">{weather.sky}</span>
                        </div>
                    )}
                    <div className="notification-wrapper">
                        <button className="notification-btn" onClick={toggleNotifications}>
                            <i className="fas fa-bell"></i>
                            {notifications.length > 0 &&
                                <span className="notification-badge">
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </span>}
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
                        className="notification-btn"
                        onClick={() => navigate('/settings')}
                    >
                        <i className="fas fa-cog"></i>
                    </button>
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
            {selectedEmployee && (
                <div
                    className={`search-profile-modal ${selectedEmployee ? 'visible' : 'hidden'}`}
                    style={{
                        top: `${modalPosition.y}px`,
                        left: `${modalPosition.x}px`
                    }}
                >
                    <div className="search-profile-header">
                        <div className="search-profile-image">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="search-profile-info">
                            <h4>{selectedEmployee.name}</h4>
                            <p>{selectedEmployee.position}</p>
                        </div>
                    </div>
                    <div className="search-profile-details">
                        <div className="search-profile-detail-item">
                            <i className="fas fa-id-card"></i>
                            <span>사번: {selectedEmployee.id}</span>
                        </div>
                        <div className="search-profile-detail-item">
                            <i className="fas fa-building"></i>
                            <span>부서: {selectedEmployee.department}</span>
                        </div>
                        <div className="search-profile-detail-item">
                            <i className="fas fa-envelope"></i>
                            <span>{selectedEmployee.email}</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Alert Message */}
            <Snackbar
                open={alertInfo.show}
                autoHideDuration={3000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleAlertClose}
                    severity={alertInfo.severity}
                    sx={{ width: '100%' }}
                    elevation={6}
                >
                    {alertInfo.message}
                </Alert>
            </Snackbar>
            {/* 출근 인증 모달 */}
            <VerifyModal
                open={isVerifyModalOpen}
                onClose={() => setIsVerifyModalOpen(false)}
                onSuccess={handleCheckinSuccess}
            />

            {/* 퇴근 확인 다이얼로그 */}
            <Dialog
                open={showCheckoutDialog}
                onClose={() => setShowCheckoutDialog(false)}
            >
                <DialogTitle>퇴근 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        퇴근 처리하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCheckoutDialog(false)} color="inherit">
                        취소
                    </Button>
                    <Button onClick={handleCheckout} color="error">
                        퇴근하기
                    </Button>
                </DialogActions>
            </Dialog>
        </header>
    );
};

Header.propTypes = {
    setIsMenuOpen: PropTypes.func.isRequired
}

export default Header;