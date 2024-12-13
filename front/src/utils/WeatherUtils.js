import axios from 'axios';

export const fetchWeatherData = async (latitude, longitude) => {
    try {
        const now = new Date();
        const baseDate = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0');
            
        const hours = now.getHours();
        let baseTime;
        
        if (hours < 2) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            baseDate = yesterday.getFullYear() +
                String(yesterday.getMonth() + 1).padStart(2, '0') +
                String(yesterday.getDate()).padStart(2, '0');
            baseTime = '2300';
        } else {
            const baseHours = Math.floor((hours - 2) / 3) * 3 + 2;
            baseTime = String(baseHours).padStart(2, '0') + '00';
        }

        const weatherApiKey = process.env.REACT_APP_WEATHER_API_KEY;
        const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${weatherApiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=60&ny=127`;

        const response = await axios.get(url);

        if (typeof response.data === 'string' && response.data.includes('OpenAPI_ServiceResponse')) {
            const errorMsg = response.data.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/)?.[1];
            throw new Error(errorMsg || 'API 인증 오류가 발생했습니다.');
        }

        if (!response.data.response?.body?.items?.item) {
            throw new Error('날씨 데이터를 찾을 수 없습니다.');
        }

        const items = response.data.response.body.items.item;
        
        const tempData = items.find(item => item.category === 'TMP');
        const skyData = items.find(item => item.category === 'SKY');
        const ptyData = items.find(item => item.category === 'PTY');
        const rehData = items.find(item => item.category === 'REH');
        const wsdData = items.find(item => item.category === 'WSD');

        const getSkyStatus = (code) => {
            switch (code) {
                case '1': return '맑음';
                case '3': return '구름많음';
                case '4': return '흐림';
                default: return '알 수 없음';
            }
        };

        const getPtyStatus = (code) => {
            switch (code) {
                case '0': return '없음';
                case '1': return '비';
                case '2': return '비/눈';
                case '3': return '눈';
                case '4': return '소나기';
                default: return '알 수 없음';
            }
        };

        return {
            temperature: parseFloat(tempData?.fcstValue || 0).toFixed(1),
            sky: getSkyStatus(skyData?.fcstValue),
            precipitation: getPtyStatus(ptyData?.fcstValue),
            humidity: rehData?.fcstValue || 0,
            windSpeed: wsdData?.fcstValue || 0,
            location: '서울',
            fetchTime: `${baseDate} ${baseTime}`
        };
    } catch (error) {
        console.error('Weather API Error:', error);
        throw error;
    }
};