import React from 'react';
import MessengerForm from '../messenger/MessengerForm';
import '../../styles/dashboard.css';

const MsgWidget = () => {
    return (
        <div className="messenger-widget-container">
            <MessengerForm isWidget={true}/>
        </div>
    );
};

export default MsgWidget;
