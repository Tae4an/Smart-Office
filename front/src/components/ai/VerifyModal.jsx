import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  Modal,
  Button,
  Alert,
  IconButton,
  CircularProgress,
  Box,
  Typography,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Camera as CameraIcon,
  Replay as ReplayIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const VerifyModal = ({ open, onClose, onSuccess }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = useCallback(() => {
    setCapturedImage(null);
    setStatus(null);
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const getUserInfo = useCallback(() => {
    const userInfo = sessionStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }, []);

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user"
  };

  const capture = () => {
    const video = webcamRef.current.video;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const imageSrc = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageSrc);
  };

  const retake = () => {
    setCapturedImage(null);
    setStatus(null);
  };

  const verify = async () => {
    try {
      setIsLoading(true);
      const userInfo = getUserInfo();
      if (!userInfo?.employeeId) {
        setStatus('error');
        alert('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const blob = await fetch(capturedImage).then(res => res.blob());
      const formData = new FormData();
      formData.append('file', blob, `${userInfo.employeeId}.jpg`);

      const result = await fetch('/api/verify/face', {
        method: 'POST',
        headers: {
          'X-User-Id': userInfo.employeeId
        },
        body: formData
      });

      const data = await result.json();

      if (data.success) {
        onSuccess(); // 얼굴 인증 성공 시 부모 컴포넌트에 알림
        handleClose();
      } else {
        setStatus('error');
        if (data.message) {
          alert(data.message);
        }
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error.response?.data?.message || '얼굴 인증 중 오류가 발생했습니다.';
      alert(errorMessage);
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  return (
      <Modal
          open={open}
          onClose={handleClose}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
      >
        <Paper
            elevation={24}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              mx: 2,
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              outline: 'none',
            }}
        >
          <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              출근하기
            </Typography>
          </Box>

          {status && (
              <Alert
                  severity={status === 'success' ? 'success' : 'error'}
                  sx={{ mb: 2 }}
              >
                {status === 'success'
                    ? '출근이 완료되었습니다.'
                    : '얼굴 인증에 실패했습니다. 다시 시도해주세요.'}
              </Alert>
          )}

          <Box sx={{ position: 'relative' }}>
            <Paper
                variant="outlined"
                sx={{
                  overflow: 'hidden',
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}
            >
              {!capturedImage ? (
                  <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      mirrored={true}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                  />
              ) : (
                  <img
                      src={capturedImage}
                      alt="captured"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                  />
              )}
            </Paper>

            {isLoading && (
                <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: 2,
                    }}
                >
                  <CircularProgress sx={{ color: 'white', mb: 1 }} />
                  <Typography sx={{ color: 'white' }}>
                    인증 처리 중...
                  </Typography>
                </Box>
            )}
          </Box>

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {!capturedImage ? (
                <Button
                    variant="contained"
                    fullWidth
                    onClick={capture}
                    disabled={isLoading}
                    startIcon={<CameraIcon />}
                    sx={{
                      height: 48,
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                >
                  사진 촬영
                </Button>
            ) : (
                <>
                  <Button
                      variant="contained"
                      fullWidth
                      onClick={verify}
                      disabled={isLoading}
                      startIcon={<LoginIcon />}
                      sx={{
                        height: 48,
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                  >
                    출근하기
                  </Button>
                  <Button
                      variant="outlined"
                      fullWidth
                      onClick={retake}
                      disabled={isLoading}
                      startIcon={<ReplayIcon />}
                      sx={{ height: 48 }}
                  >
                    다시 촬영
                  </Button>
                </>
            )}
          </Box>
        </Paper>
      </Modal>
  );
};

export default VerifyModal;