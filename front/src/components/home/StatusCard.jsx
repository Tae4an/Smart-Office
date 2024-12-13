// StatusCard.jsx
import React from 'react';
import '../../styles/dashboard.css';

const StatusCard = ({ title, mainStat, stats }) => {
    return (
        <div className="status-card">
            <h3 className="status-card-title">{title}</h3>

            <div className="main-stat">
                <div className="main-stat-value">
                    <span className="value">{mainStat.value}</span>
                    <span className="unit">{mainStat.unit}</span>
                </div>
                <span className="main-stat-label">{mainStat.label}</span>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-item">
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">
                            {stat.value}
                            <span className="stat-unit">{stat.unit}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusCard;