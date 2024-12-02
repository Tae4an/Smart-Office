import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) {
      newErrors.employeeId = '사번을 입력해주세요';
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('employeeId', formData.employeeId.trim());
        params.append('password', formData.password);

        const response = await axios.post('/login', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true
        });

        if (response.status === 200) {
          navigate('/home');
        }
      } catch (error) {
        console.error('Login failed:', error.response?.data);
        setErrors({
          submit: error.response?.data?.error || '로그인에 실패했습니다. 다시 시도해주세요.'
        });
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
                  <p>사내 업무 관리 시스템</p>
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
                <h2>Welcome Back!</h2>
                <p>사번으로 로그인해주세요</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-fields">
                  <Box className="form-group">
                    <TextField
                        required
                        fullWidth
                        id="employeeId"
                        name="employeeId"
                        label="사번"
                        value={formData.employeeId}
                        onChange={handleChange}
                        error={Boolean(errors.employeeId)}
                        helperText={errors.employeeId}
                        InputProps={{
                          startAdornment: (
                              <InputAdornment position="start">
                                <i className="fas fa-user" />
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
                  </Box>

                  <Box className="form-group">
                    <TextField
                        required
                        fullWidth
                        name="password"
                        label="비밀번호"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        InputProps={{
                          startAdornment: (
                              <InputAdornment position="start">
                                <i className="fas fa-lock" />
                              </InputAdornment>
                          ),
                          endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
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
                  </Box>
                </div>

                {errors.submit && (
                    <p className="submit-error">{errors.submit}</p>
                )}

                <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;