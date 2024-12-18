// 실제 데이터
import defaultProfileImage from '../../assets/profile1.png';
import backgroundImage from '../../assets/backgroundImage.jpg';
import React, { useState, useEffect, useRef } from 'react';
import ProfileSection from './ProfileSection';
import StatusGrid from './StatusGrid';
import ActivityCard from './ActivityCard';
import CalendarForm from '../calendar/CalendarForm';
import MapWidget from './MapWidget';
import MsgWidget from './MsgWidget';
import WidgetSelector from './WidgetSelector';
import { mockStats, mockActivities } from '../../mock/mockData';
import '../../styles/dashboard.css';
import { Cloud, Sun, CloudRain } from 'lucide-react';
import { fetchWeatherData } from '../../utils/WeatherUtils';

const WIDGET_CONFIG = {
    status: {
        id: 'status',
        title: '근태 현황',
        description: '출근, 퇴근, 휴가 등 근태 현황을 확인할 수 있습니다.',
        component: StatusGrid,
        props: (data) => ({ stats: data.stats })
    },
    activity: {
        id: 'activity',
        title: '최근 활동',
        description: '최근 업무 활동과 진행 상황을 확인할 수 있습니다.',
        component: ActivityCard,
        props: (data) => ({ activities: data.activities })
    },
    map: {
        id: 'map',
        title: '지도',
        description: '회사 주변 또는 원하는 장소를 지도에서 확인하고 관리할 수 있습니다.',
        component: MapWidget,
        props: () => ({})
    },
    message: {
        id: 'message',
        title: '메시지',
        description: '팀원들과의 메시지를 주고받을 수 있습니다.',
        component: MsgWidget,
        props: () => ({})
    }
};

const EmptyCell = ({ onAddWidget, availableWidgets }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="empty-cell" onClick={() => setIsOpen(true)}>
                <div className="flex flex-col items-center justify-center h-full text-gray-400 hover:text-primary">
                    <span className="text-3xl mb-2">+</span>
                    <span>위젯 추가하기</span>
                </div>
            </div>
            <WidgetSelector
                open={isOpen}
                onClose={() => setIsOpen(false)}
                onSelectWidget={onAddWidget}
                availableWidgets={availableWidgets}
            />
        </>
    );
};

const Widget = ({ widgetId, data, onRemove, getAvailableWidgets, handleAddWidget, gridCells }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const config = WIDGET_CONFIG[widgetId];
    const WidgetComponent = config.component;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="widget-container">
            <div className="widget-header">
                <h3>{config.title}</h3>
                <div className="widget-controls" ref={menuRef}>
                    <button 
                        className="widget-control-button"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <span>•••</span>
                    </button>
                    {showMenu && (
                        <div className="widget-control-menu">
                            <button onClick={() => {
                                setIsOpen(true);
                                setShowMenu(false);
                            }}>
                                <span>위젯 변경</span>
                            </button>
                            <button 
                                className="danger"
                                onClick={() => {
                                    onRemove();
                                    setShowMenu(false);
                                }}
                            >
                                <span>위젯 삭제</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="widget-content">
                <WidgetComponent {...config.props(data)} />
            </div>
            <WidgetSelector
                open={isOpen}
                onClose={() => setIsOpen(false)}
                onSelectWidget={(newWidgetId) => {
                    onRemove();
                    handleAddWidget(gridCells.indexOf(widgetId), newWidgetId);
                    setIsOpen(false);
                }}
                availableWidgets={[
                    ...getAvailableWidgets(widgetId),
                    // 현재 위젯도 선택 가능하도록 포함
                    WIDGET_CONFIG[widgetId]
                ]}
            />
        </div>
    );
};

const Main = () => {
    const [user, setUser] = useState({
        name: "",
        position: "",
        department: "",
        employeeId: "",
        email: "",
        profileImage: defaultProfileImage
    });
    const [stats, setStats] = useState(mockStats);
    const [activities, setActivities] = useState(mockActivities);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gridCells, setGridCells] = useState(Array(3).fill(null));
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weather, setWeather] = useState(null);

    const handleNavigate = (date) => {
        setCurrentDate(date);
    };

    useEffect(() => {
        const getUserFromSession = async () => {
            try {
                const userInfoStr = sessionStorage.getItem('userInfo');
                if (!userInfoStr) {
                    throw new Error('No user information found');
                }

                const userData = JSON.parse(userInfoStr);
                setUser({
                    name: userData.name,
                    position: userData.position,
                    department: userData.department,
                    employeeId: userData.employeeId,
                    email: userData.email,
                    profileImage: userData.profileImage || defaultProfileImage
                });

                if (userData.passwordChangeRequired) {
                    window.location.href = '/password-change';
                    return;
                }

                const savedWidgets = localStorage.getItem('gridWidgets');
                if (savedWidgets) {
                    setGridCells(JSON.parse(savedWidgets));
                }

                setStats(mockStats);
                setActivities(mockActivities);
                setLoading(false);
            } catch (error) {
                console.error('Failed to get user data from session:', error);
                setError('사용자 정보를 불러오는데 실패했습니다.');
                window.location.href = '/';
            }
        };

        const getWeather = async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const weatherData = await fetchWeatherData(latitude, longitude);
                setWeather(weatherData);
            } catch (error) {
                console.error('날씨 정보를 가져오는데 실패했습니다:', error);
            }
        };

        getUserFromSession();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getWeather);
        }
    }, []);

    const getAvailableWidgets = (excludeWidgetId = null) => {
        if (excludeWidgetId) {
            return Object.values(WIDGET_CONFIG).filter(
                widget => widget.id !== excludeWidgetId && !gridCells.includes(widget.id)
            );
        }

        const activeWidgets = gridCells.filter(cell => cell !== null).length;
        if (activeWidgets >= 3) return [];

        return Object.values(WIDGET_CONFIG).filter(
            widget => !gridCells.includes(widget.id)
        );
    };

    const handleAddWidget = (index, widgetId) => {
        const newGridCells = [...gridCells];
        newGridCells[index] = widgetId;
        setGridCells(newGridCells);
        localStorage.setItem('gridWidgets', JSON.stringify(newGridCells));
    };

    const handleRemoveWidget = (index) => {
        const newGridCells = [...gridCells];
        newGridCells[index] = null;
        setGridCells(newGridCells);
        localStorage.setItem('gridWidgets', JSON.stringify(newGridCells));
    };

    const getWeatherIcon = (sky, precipitation) => {
        if (precipitation !== '없음') return <CloudRain className="text-blue-500" size={20} />;
        switch (sky) {
            case '맑음': return <Sun className="text-yellow-500" size={20} />;
            case '구름많음':
            case '흐림': return <Cloud className="text-gray-500" size={20} />;
            default: return <Sun className="text-yellow-500" size={20} />;
        }
    };

    const getActiveWidgetCount = () => {
        return gridCells.filter(cell => cell !== null).length;
    };

    if (loading) return <div className="dashboard-content container"><div className="loading">Loading...</div></div>;
    if (error) return <div className="dashboard-content container"><div className="error">{error}</div></div>;

    const widgetData = { stats, activities };
    const gridAreas = ['main', 'sub1', 'sub2'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.15,
                    filter: 'blur(1px)',
                    zIndex: 0
                }}
            />
            <div className="dashboard-wrapper relative min-h-screen px-6">
                <div className="dashboard-content container">
                    <div className="dashboard-grid">
                        <div className="dashboard-column">
                            <div className="profile-card">
                                <ProfileSection user={user} stats={stats} />
                            </div>
                            <div className="mini-calendar-card">
                                <div className="card-title flex items-center justify-between mb-0" 
                                    style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                                    <span className="text-gray-600 text-base font-medium">
                                        {currentDate.getFullYear()}.{currentDate.getMonth() + 1}.{currentDate.getDate()}
                                    </span>
                                    {weather && (
                                        <span className="flex items-center gap-1.5 text-lg font-semibold" style={{ color: '#4b5563' }}>
                                            {getWeatherIcon(weather.sky, weather.precipitation)}
                                            {weather.temperature}°
                                        </span>
                                    )}
                                </div>
                                <div style={{ height: '280px', padding: '0 var(--spacing-2) var(--spacing-2)' }}>
                                    <CalendarForm 
                                        height="100%"
                                        minimode={true} 
                                        onNavigate={handleNavigate}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-column">
                            <div className="grid-layout">
                                {gridAreas.map((area, index) => {
                                    const widgetId = gridCells[index];
                                    if (!widgetId && getActiveWidgetCount() >= 3) return null;

                                    return (
                                        <div key={index} 
                                            className={`grid-cell ${widgetId ? 'occupied' : ''}`}
                                            style={{ gridArea: area }}>
                                            {widgetId ? (
                                                <Widget
                                                    widgetId={widgetId}
                                                    data={widgetData}
                                                    onRemove={() => handleRemoveWidget(index)}
                                                    getAvailableWidgets={getAvailableWidgets}
                                                    handleAddWidget={handleAddWidget}
                                                    gridCells={gridCells}
                                                />
                                            ) : (
                                                <EmptyCell
                                                    onAddWidget={(widgetId) => handleAddWidget(index, widgetId)}
                                                    availableWidgets={getAvailableWidgets()}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
// 실제 데이터