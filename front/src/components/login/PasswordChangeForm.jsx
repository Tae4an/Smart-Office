import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Container,
    Box,
    Typography,
    IconButton,
    Alert,
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../../styles/login.css'

const PasswordChange = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.currentPassword) {
            newErrors.currentPassword = '현재 비밀번호를 입력해주세요';
        }
        if (!formData.newPassword) {
            newErrors.newPassword = '새 비밀번호를 입력해주세요';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다';
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                const response = await fetch('/api/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || '비밀번호 변경에 실패했습니다');
                }

                // 성공 메시지 표시 후 메인 페이지로 리다이렉트
                setErrors({ success: '비밀번호가 성공적으로 변경되었습니다.' });
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } catch (error) {
                console.error('Password change failed:', error);
                setErrors({ submit: error.message });
            } finally {
                setIsLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                {/* Left Section */}
                <div className="login-left">
                    <div className="login-left-content">
                        <div className="login-hero">
                            <div className="login-hero-text">
                                <h1>Smart Office</h1>
                                <p>비밀번호 변경</p>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="decorative-circles">
                            <div className="circle circle-1"></div>
                            <div className="circle circle-2"></div>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="login-right">
                    <div className="login-form-container">
                        <div className="login-header">
                            <h2>비밀번호 변경</h2>
                            <p>새로운 비밀번호를 설정해주세요</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-fields">
                                {/* 현재 비밀번호 */}
                                <TextField
                                    required
                                    fullWidth
                                    name="currentPassword"
                                    label="현재 비밀번호"
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    error={Boolean(errors.currentPassword)}
                                    helperText={errors.currentPassword}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <i className="fas fa-lock" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    edge="end"
                                                >
                                                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 'var(--border-radius-xl)',
                                            '& fieldset': {
                                                borderColor: 'var(--light)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'var(--primary)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'var(--primary)',
                                                boxShadow: '0 0 0 2px rgba(30, 48, 243, 0.1)',
                                            },
                                        },
                                    }}
                                />

                                {/* 새 비밀번호 */}
                                <TextField
                                    required
                                    fullWidth
                                    name="newPassword"
                                    label="새 비밀번호"
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    error={Boolean(errors.newPassword)}
                                    helperText={errors.newPassword}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <i className="fas fa-lock" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    edge="end"
                                                >
                                                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 'var(--border-radius-xl)',
                                            '& fieldset': {
                                                borderColor: 'var(--light)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'var(--primary)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'var(--primary)',
                                                boxShadow: '0 0 0 2px rgba(30, 48, 243, 0.1)',
                                            },
                                        },
                                    }}
                                />

                                {/* 새 비밀번호 확인 */}
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="새 비밀번호 확인"
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={Boolean(errors.confirmPassword)}
                                    helperText={errors.confirmPassword}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <i className="fas fa-lock" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    edge="end"
                                                >
                                                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 'var(--border-radius-xl)',
                                            '& fieldset': {
                                                borderColor: 'var(--light)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'var(--primary)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'var(--primary)',
                                                boxShadow: '0 0 0 2px rgba(30, 48, 243, 0.1)',
                                            },
                                        },
                                    }}
                                />
                            </div>

                            {errors.submit && (
                                <p className="submit-error">{errors.submit}</p>
                            )}

                            {errors.success && (
                                <p className="success-message">{errors.success}</p>
                            )}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={isLoading}
                            >
                                {isLoading ? '변경 중...' : '비밀번호 변경'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordChange;