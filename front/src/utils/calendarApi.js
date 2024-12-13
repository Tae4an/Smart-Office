import axios from 'axios';

export const calendarApi = axios.create({
    baseURL: '/api/calendar',
    headers: {
        'Content-Type': 'application/json',
    }
});

// 매 요청마다 userInfo에서 employeeId를 가져와 헤더에 설정
calendarApi.interceptors.request.use(
    config => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            config.headers['X-User-Id'] = userInfo.employeeId;
            return config;
        } else {
            // API 호출 자체를 취소
            return Promise.reject('Not logged in');
        }
    },
    error => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
calendarApi.interceptors.response.use(
    response => response,
    error => {
        // Promise.reject('Not logged in')에 의한 에러는 리다이렉트하지 않음
        if (error === 'Not logged in') {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 || error.response?.status === 403) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);