// components/chat/UserSearch.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useChat } from './ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/chat.css';

const UserSearch = ({ onClose, onSelect, selectedUsers = [], embedded = false, standalone = false }) => {
    const [keyword, setKeyword] = useState('');
    const [users, setUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { createIndividualChat } = useChat();

    const handleSearch = async () => {
        if (!keyword.trim()) {
            setUsers([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get('/api/users/search', {
                params: { keyword }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to search users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleUserSelect = async (user) => {
        if (embedded) {
            onSelect(user);
        } else if (standalone) {
            try {
                await createIndividualChat(user.employeeId);
                onClose();
            } catch (error) {
                console.error('Failed to create chat:', error);
            }
        }
    };

    const isUserSelected = (user) => {
        return selectedUsers.some(selectedUser => selectedUser.employeeId === user.employeeId);
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (keyword.length >= 2) {
                handleSearch();
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [keyword]);

    return (
        <div className="user-search-container p-4">
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="이름 또는 부서로 검색..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
            </div>

            <motion.div
                className="max-h-96 overflow-y-auto messages-container rounded-xl"
                initial={false}
            >
                <AnimatePresence>
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <motion.div
                                key={user.employeeId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                onClick={() => !isUserSelected(user) && handleUserSelect(user)}
                                className={`user-item ${isUserSelected(user) ? 'selected' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-medium shadow-md">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800">{user.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {user.department} · {user.position}
                                        </div>
                                    </div>
                                </div>
                                {isUserSelected(user) && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-primary font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        선택됨
                                    </motion.div>
                                )}
                            </motion.div>
                        ))
                    ) : keyword.length >= 2 && !isSearching && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-gray-500"
                        >
                            검색 결과가 없습니다
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default UserSearch;