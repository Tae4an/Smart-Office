// StatusGrid.jsx
import React from 'react';
import StatusCard from './StatusCard';
import '../../styles/dashboard.css';

const StatusGrid = ({ stats }) => {
    const { attendanceStats, leaveStats, overtimeStats } = stats;
    
    return (
        <div className="status-grid-container">
            <StatusCard
                title={attendanceStats.title}
                mainStat={attendanceStats.mainStat}
                stats={attendanceStats.stats}
            />
            <StatusCard
                title={leaveStats.title}
                mainStat={leaveStats.mainStat}
                stats={leaveStats.stats}
            />
            <StatusCard
                title={overtimeStats.title}
                mainStat={overtimeStats.mainStat}
                stats={overtimeStats.stats}
            />
        </div>
    );
};

export default StatusGrid;