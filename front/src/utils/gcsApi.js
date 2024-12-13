import axios from 'axios';

const getUserId = () => {
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
        const { employeeId } = JSON.parse(userInfo);
        return employeeId;
    }
    return null;
};

const gcsApi = axios.create({
    baseURL: '/api/gcs',
    headers: {
        'X-User-Id': getUserId() // 세션스토리지의 userInfo에서 employeeId 가져오기
    }
});

// 요청 인터셉터 추가 - 매 요청마다 최신 userId 가져오기
gcsApi.interceptors.request.use((config) => {
    config.headers['X-User-Id'] = getUserId();
    return config;
});

export const uploadFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await gcsApi.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                return percentCompleted;
            }
        });

        return response;
    } catch (error) {
        // 에러 응답 상세 정보 확인
        if (error.response) {
            // 서버가 2xx 범위를 벗어난 상태 코드를 반환한 경우
            console.error('Error response:', error.response.data);
            throw new Error(error.response.data.message || '파일 업로드에 실패했습니다.');
        } else if (error.request) {
            // 요청은 보냈지만 응답을 받지 못한 경우
            console.error('Error request:', error.request);
            throw new Error('서버에서 응답을 받지 못했습니다.');
        } else {
            // 요청 설정 중에 문제가 발생한 경우
            console.error('Error:', error.message);
            throw new Error('요청 중 오류가 발생했습니다.');
        }
    }
};

export const getFileList = () => gcsApi.get('/list');
export const downloadFile = async (fileName) => {
    try {
        const response = await gcsApi.get(`/download/${fileName}`, {
            responseType: 'blob'
        });

        // Content-Disposition 헤더에서 파일명 추출
        const contentDisposition = response.headers['content-disposition'];
        let originalFileName = fileName;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([\w%.-]+)/);
            if (filenameMatch && filenameMatch[1]) {
                originalFileName = decodeURIComponent(filenameMatch[1]);
            } else {
                const fallbackMatch = contentDisposition.match(/filename="([^"]+)"/);
                if (fallbackMatch && fallbackMatch[1]) {
                    originalFileName = decodeURIComponent(fallbackMatch[1]);
                }
            }
        }

        // Blob 생성 및 다운로드
        const blob = new Blob([response.data], {
            type: response.headers['content-type']
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', originalFileName);

        document.body.appendChild(link);
        link.click();

        // 정리
        window.URL.revokeObjectURL(url);
        link.remove();

        return response;
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};
export const deleteFile = (fileName) => gcsApi.delete(`/${fileName}`);

export const getUserFileList = () => {
    const userId = getUserId();
    return gcsApi.get(`/user/${userId}`);
};
export const uploadOCRFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/ocr/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-User-Id': getUserId()
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                return percentCompleted;
            }
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error response:', error.response.data);
            throw new Error(error.response.data.message || 'OCR 처리에 실패했습니다.');
        } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('서버에서 응답을 받지 못했습니다.');
        } else {
            console.error('Error:', error.message);
            throw new Error('요청 중 오류가 발생했습니다.');
        }
    }
};