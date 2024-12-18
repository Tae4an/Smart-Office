import axios from 'axios';

const getUserId = () => {
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
        const { employeeId } = JSON.parse(userInfo);
        return employeeId;
    }
    return null;
};

const ocrApi = axios.create({
    baseURL: '/api/ocr/results',
    headers: {
        'X-User-Id': getUserId()
    }
});

ocrApi.interceptors.request.use((config) => {
    config.headers['X-User-Id'] = getUserId();
    return config;
});

// OCR 결과 저장
export const saveOCRResult = async (saveData) => {
    if (!window.confirm(`OCR 결과를 저장하시겠습니까?`)) {
        return;
    }
    try {
        const response = await ocrApi.post('', saveData);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// OCR 결과 목록 조회
export const getOCRResults = async () => {
    try {
        const response = await ocrApi.get('');
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// OCR 결과 상세 조회
export const getOCRResult = async (id) => {
    try {
        const response = await ocrApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// OCR 결과 삭제
export const deleteOCRResult = async (id) => {
    if (!window.confirm(`OCR 결과를 삭제하시겠습니까?`)) {
        return;
    }
    try {
        const response = await ocrApi.delete(`/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// OCR 결과 다운로드
export const downloadOCRResult = async (id) => {
    if (!window.confirm(`파일을 다운로드하시겠습니까?`)) {
        return;
    }
    try {
        const response = await ocrApi.get(`/${id}/download`, {
            responseType: 'blob'
        });

        // Content-Disposition 헤더에서 파일명 추출
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `ocr_result_${id}.txt`;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([\w%.-]+)/);
            if (filenameMatch && filenameMatch[1]) {
                fileName = decodeURIComponent(filenameMatch[1]);
            } else {
                const fallbackMatch = contentDisposition.match(/filename="([^"]+)"/);
                if (fallbackMatch && fallbackMatch[1]) {
                    fileName = decodeURIComponent(fallbackMatch[1]);
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
        link.setAttribute('download', fileName);

        document.body.appendChild(link);
        link.click();

        // 정리
        window.URL.revokeObjectURL(url);
        link.remove();

        return response;
    } catch (error) {
        handleApiError(error);
    }
};

// 에러 처리 유틸리티 함수
const handleApiError = (error) => {
    if (error.response) {
        // 서버가 2xx 범위를 벗어난 상태 코드를 반환한 경우
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data.message || 'OCR 결과 처리 중 오류가 발생했습니다.');
    } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        console.error('Error request:', error.request);
        throw new Error('서버에서 응답을 받지 못했습니다.');
    } else {
        // 요청 설정 중에 문제가 발생한 경우
        console.error('Error:', error.message);
        throw new Error('요청 중 오류가 발생했습니다.');
    }
};

export default ocrApi;