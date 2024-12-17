import React from 'react';
import '../../styles/dashboard.css';

const WidgetSelector = ({ 
    open, 
    onClose, 
    onSelectWidget, 
    availableWidgets = []
}) => {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>위젯 선택</h3>
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {availableWidgets.map(widget => (
                        <button
                            key={widget.id}
                            className="widget-option"
                            onClick={() => {
                                onSelectWidget(widget.id);
                                onClose();
                            }}
                        >
                            <h4>{widget.title}</h4>
                            <p>{widget.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WidgetSelector;