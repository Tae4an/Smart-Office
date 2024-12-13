import React, { useState, useEffect } from 'react';
import { fetchWeatherData } from '../../utils/WeatherUtils';
import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getWeather = async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const weatherData = await fetchWeatherData(latitude, longitude);
                setWeather(weatherData);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getWeather, 
                (error) => {
                    setError('위치 정보를 가져오는데 실패했습니다.');
                    setLoading(false);
                }
            );
        } else {
            setError('위치 정보를 지원하지 않는 브라우저입니다.');
            setLoading(false);
        }
    }, []);

    const getWeatherIcon = (sky, precipitation) => {
        if (precipitation !== '없음') return <CloudRain className="text-blue-500" size={48} />;
        switch (sky) {
            case '맑음': return <Sun className="text-yellow-500" size={48} />;
            case '구름많음': return <Cloud className="text-gray-500" size={48} />;
            case '흐림': return <Cloud className="text-gray-400" size={48} />;
            default: return <Sun className="text-yellow-500" size={48} />;
        }
    };

    const formatDateTime = (fetchTime) => {
        if (!fetchTime) return '';
        
        const [date, time] = fetchTime.split(' ');
        const year = date.substring(0, 4);
        const month = date.substring(4, 6);
        const day = date.substring(6, 8);
        const hour = time.substring(0, 2);
        const minute = time.substring(2);

        return `${year}년 ${month}월 ${day}일 ${hour}:${minute} 발표`;
    };

    if (loading) return (
        <div className="weather-card">
            <h2 className="card-title">현재 날씨</h2>
            <div className="weather-content loading-state">
                <div className="loading-spinner"></div>
                <div className="loading-text">날씨 정보를 불러오는 중...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="weather-card">
            <h2 className="card-title">현재 날씨</h2>
            <div className="weather-content error-state">
                <div className="error-text">{error}</div>
            </div>
        </div>
    );

    return (
        <div className="weather-card">
            <h2 className="card-title">현재 날씨</h2>
            <div className="weather-content">
                <div className="weather-location">{weather.location}</div>
                
                <div className="weather-info">
                    {getWeatherIcon(weather.sky, weather.precipitation)}
                    <span className="temperature">{weather.temperature}°C</span>
                    <span className="condition">{weather.sky}</span>
                </div>

                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">
                            <Droplets className="inline" size={16} /> 습도
                        </span>
                        <span className="stat-value">
                            {weather.humidity}
                            <span className="stat-unit">%</span>
                        </span>
                    </div>
                    
                    <div className="stat-item">
                        <span className="stat-label">
                            <Wind className="inline" size={16} /> 풍속
                        </span>
                        <span className="stat-value">
                            {weather.windSpeed}
                            <span className="stat-unit">m/s</span>
                        </span>
                    </div>
                </div>

                {weather.precipitation !== '없음' && (
                    <div className="status-badge" style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white'
                    }}>
                        {weather.precipitation}
                    </div>
                )}

                <div className="position-text">
                    {formatDateTime(weather.fetchTime)}
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;