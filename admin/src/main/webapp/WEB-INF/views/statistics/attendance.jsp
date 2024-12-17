<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- Chart.js CDN 추가 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
.card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin-bottom: 25px;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.card-header {
    background: linear-gradient(45deg, #f6c23e, #f4b619);
    color: white;
    border-radius: 15px 15px 0 0 !important;
    padding: 1.2rem 1.5rem;
    border-bottom: none;
    font-weight: 500;
}

.card-header i {
    margin-right: 8px;
    opacity: 0.8;
}

.table {
    margin: 0;
}

.table thead th {
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    padding: 1rem 1.5rem;
}

.table tbody td {
    padding: 1rem 1.5rem;
    vertical-align: middle;
    color: #495057;
}

.form-control {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.form-control:focus {
    border-color: #f6c23e;
    box-shadow: 0 0 0 0.2rem rgba(246, 194, 62, 0.25);
}

#attendanceDate {
    width: 200px;
    background-color: white;
}

canvas {
    padding: 1rem;
}

/* 대시보드 스타일 추가 */
.chart-container {
    position: relative;
    margin: auto;
    height: 300px;
}

.fw-medium {
    font-weight: 500;
}

.table-hover tbody tr:hover {
    background-color: rgba(0,0,0,0.02);
}
</style>

<div class="container-fluid px-4">
    <h1 class="mt-4">출근 통계</h1>
    
    <div class="row">
        <div class="col-xl-12 mb-4">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-calendar-check me-1"></i>
                            일간 출근 현황
                        </div>
                        <input type="date" class="form-control" style="width: 200px;" id="attendanceDate">
                    </div>
                </div>
                <div class="card-body">
                    <canvas id="dailyAttendanceChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-chart-line me-1"></i>
                    부서별 월간 출근율
                </div>
                <div class="card-body">
                    <canvas id="monthlyAttendanceChart"></canvas>
                </div>
            </div>
        </div>

        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-table me-1"></i>
                    출근 통계 요약
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>부서</th>
                                    <th>전체 인원</th>
                                    <th>출근</th>
                                    <th>지각</th>
                                    <th>결근</th>
                                    <th>출근율</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>인사팀</td>
                                    <td>30</td>
                                    <td>28</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>93.3%</td>
                                </tr>
                                <tr>
                                    <td>개발팀</td>
                                    <td>20</td>
                                    <td>18</td>
                                    <td>2</td>
                                    <td>0</td>
                                    <td>90.0%</td>
                                </tr>
                                <tr>
                                    <td>마케팅팀</td>
                                    <td>25</td>
                                    <td>23</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>92.0%</td>
                                </tr>
                                <tr>
                                    <td>재무팀</td>
                                    <td>15</td>
                                    <td>13</td>
                                    <td>2</td>
                                    <td>0</td>
                                    <td>86.7%</td>
                                </tr>
                                <tr>
                                    <td>영업팀</td>
                                    <td>20</td>
                                    <td>18</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>90.0%</td>
                                </tr>
                                <tr>
                                    <td>총무팀</td>
                                    <td>10</td>
                                    <td>9</td>
                                    <td>1</td>
                                    <td>0</td>
                                    <td>90.0%</td>
                                </tr>
                                <tr>
                                    <td>보안팀</td>
                                    <td>12</td>
                                    <td>11</td>
                                    <td>1</td>
                                    <td>0</td>
                                    <td>91.7%</td>
                                </tr>
                                <tr>
                                    <td>법무팀</td>
                                    <td>8</td>
                                    <td>7</td>
                                    <td>1</td>
                                    <td>0</td>
                                    <td>87.5%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// 하나의 통합된 데이터 소스
const attendanceData = [
    { department: '인사팀', totalCount: 30, onTime: 28, late: 1, absent: 1, attendanceRate: 93.3 },
    { department: '개발팀', totalCount: 20, onTime: 18, late: 2, absent: 0, attendanceRate: 90.0 },
    { department: '마케팅팀', totalCount: 25, onTime: 23, late: 1, absent: 1, attendanceRate: 92.0 },
    { department: '재무팀', totalCount: 15, onTime: 13, late: 2, absent: 0, attendanceRate: 86.7 },
    { department: '영업팀', totalCount: 20, onTime: 18, late: 1, absent: 1, attendanceRate: 90.0 },
    { department: '총무팀', totalCount: 10, onTime: 9, late: 1, absent: 0, attendanceRate: 90.0 },
    { department: '보안팀', totalCount: 12, onTime: 11, late: 1, absent: 0, attendanceRate: 91.7 },
    { department: '법무팀', totalCount: 8, onTime: 7, late: 1, absent: 0, attendanceRate: 87.5 }
];

// 차트 데이터 추출
const departments = attendanceData.map(item => item.department);
const attendanceRates = attendanceData.map(item => item.attendanceRate);
const dailyAttendanceData = [45, 15, 5, 2, 1, 0];  // 시간대별 출근 인원

const dailyChart = new Chart(document.getElementById('dailyAttendanceChart'), {
    type: 'bar',
    data: {
        labels: ['9시', '10시', '11시', '12시', '13시', '14시'],
        datasets: [{
            label: '출근 인원',
            data: dailyAttendanceData,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 5 }
            }
        }
    }
});

const monthlyChart = new Chart(document.getElementById('monthlyAttendanceChart'), {
    type: 'line',
    data: {
        labels: departments,
        datasets: [{
            label: '출근율',
            data: attendanceRates,
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 10 }
            }
        }
    }
});

// 차트 크기 조절
document.getElementById('dailyAttendanceChart').parentElement.style.height = '300px';
document.getElementById('monthlyAttendanceChart').parentElement.style.height = '250px';
</script>
