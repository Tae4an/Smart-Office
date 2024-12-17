import React, { useState } from 'react';
import { X, Edit2, Save } from 'lucide-react';

const ProfileModal = ({ user, isOpen, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setEditedUser(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // 로컬 스토리지에 저장
        localStorage.setItem('userProfile', JSON.stringify(editedUser));
        // 부모 컴포넌트에 업데이트 알림
        onUpdate(editedUser);
        setIsEditing(false);
    };

    const editableFields = [
        { key: 'phone', label: '연락처' },
        { key: 'email', label: '이메일' }
    ];

    const readOnlyFields = [
        { key: 'name', label: '이름' },
        { key: 'department', label: '부서' },
        { key: 'position', label: '직급' },
        { key: 'employeeId', label: '사원번호' },
        { key: 'joinDate', label: '입사일' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>프로필 정보</h3>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <button className="edit-button" onClick={() => setIsEditing(true)}>
                                <Edit2 size={20} />
                            </button>
                        ) : (
                            <button className="save-button" onClick={handleSave}>
                                <Save size={20} />
                            </button>
                        )}
                        <button className="close-button" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="flex flex-col items-center">
                        <div className="profile-image-wrapper" style={{ width: '120px', height: '120px', marginBottom: 'var(--spacing-4)' }}>
                            <img src={editedUser.profileImage} alt="profile" className="profile-image" />
                        </div>
                        <div className="profile-details">
                            <table className="profile-table">
                                <tbody>
                                    {readOnlyFields.map(({ key, label }) => (
                                        <tr key={key}>
                                            <td className="text-gray-500">{label}</td>
                                            <td className="font-medium">{editedUser[key]}</td>
                                        </tr>
                                    ))}
                                    {editableFields.map(({ key, label }) => (
                                        <tr key={key}>
                                            <td className="text-gray-500">{label}</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editedUser[key] || ''}
                                                        onChange={(e) => handleChange(key, e.target.value)}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span className="font-medium">
                                                        {editedUser[key] || '-'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
