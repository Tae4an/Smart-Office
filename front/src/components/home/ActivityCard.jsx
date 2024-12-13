// ActivityCard.jsx
import React from 'react';
import '../../styles/dashboard.css';

const ActivityCard = ({ activities }) => {
    return (
        <div className="activity-card p-4 rounded-lg shadow-sm">
            <div className="activity-list">
                {activities.map((activity) => (
                    <div key={activity.id} className="activity-item p-3 mb-2 rounded">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium">{activity.title}</h4>
                                <p className="text-sm text-gray-600">{activity.description}</p>
                            </div>
                            <div className="text-right">
                                <span className={`status-badge ${activity.status === '승인완료' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                    {activity.status}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">{activity.date}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityCard;