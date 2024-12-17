import defaultProfileImage from '../assets/profile1(before).png';

export const mockUser = {
    name: "김지원",
    position: "선임연구원",
    department: "AI연구소",
    employeeId: "EMP2024001",
    email: "jiwon.kim@company.com",
    profileImage: defaultProfileImage
};

export const mockStats = {
    attendanceStats: {
        title: '근태 현황',
        mainStat: { value: '15', unit: '일', label: '정상 출근' },
        stats: [
            { label: '지각', value: '1', unit: '회' },
            { label: '조퇴', value: '0', unit: '회' },
            { label: '결근', value: '0', unit: '회' }
        ]
    },
    leaveStats: {
        title: '휴가 현황',
        mainStat: { value: '10', unit: '일', label: '잔여 휴가' },
        stats: [
            { label: '총 휴가', value: '15', unit: '일' },
            { label: '사용 휴가', value: '5', unit: '일' }
        ]
    },
    overtimeStats: {
        title: '초과근무 현황',
        mainStat: { value: '12', unit: '시간', label: '이번달 초과근무' },
        stats: [
            { label: '승인됨', value: '10', unit: '시간' },
            { label: '수당 지급 예정', value: '10', unit: '시간' }
        ]
    }
};

export const mockActivities = [
    {
        id: 1,
        type: '휴가',
        title: '연차 휴가 신청',
        status: '승인완료',
        date: '2024-12-05',
        description: '12월 5일 연차 휴가'
    },
    {
        id: 2,
        type: '초과근무',
        title: '초과근무 신청',
        status: '승인대기',
        date: '2024-12-03',
        description: '프로젝트 마감으로 인한 초과근무 2시간'
    },
    {
        id: 3,
        type: '근태',
        title: '지각 사유서',
        status: '제출완료',
        date: '2024-12-02',
        description: '교통 체증으로 인한 지각'
    },
    {
        id: 4,
        type: '휴가',
        title: '반차 신청',
        status: '승인완료',
        date: '2024-12-01',
        description: '오후 반차'
    }
];
