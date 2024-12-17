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
    background: linear-gradient(45deg, #1cc88a, #13855c);
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

.table-responsive {
    padding: 1rem;
}

canvas {
    padding: 1rem;
}

.chart-container {
    position: relative;
    margin: auto;
    height: 300px;
    padding: 15px;
}

.table-hover tbody tr:hover {
    background-color: rgba(0,0,0,0.02);
}

.fw-medium {
    font-weight: 500;
}
</style>

<div class="container-fluid px-4">
    <h1 class="mt-4">게시판 통계</h1>
    
    <div class="row">
        <div class="col-xl-8">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-chart-bar me-1"></i>
                    부서별 게시글 현황
                </div>
                <div class="card-body">
                    <canvas id="boardChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="col-xl-4">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-list me-1"></i>
                    부서별 게시글 수
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>부서</th>
                                    <th>게시글 수</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>인사팀</td>
                                    <td>45</td>
                                </tr>
                                <tr>
                                    <td>개발팀</td>
                                    <td>32</td>
                                </tr>
                                <tr>
                                    <td>마케팅팀</td>
                                    <td>28</td>
                                </tr>
                                <tr>
                                    <td>재무팀</td>
                                    <td>35</td>
                                </tr>
                                <tr>
                                    <td>영업팀</td>
                                    <td>25</td>
                                </tr>
                                <tr>
                                    <td>총무팀</td>
                                    <td>20</td>
                                </tr>
                                <tr>
                                    <td>보안팀</td>
                                    <td>15</td>
                                </tr>
                                <tr>
                                    <td>법무팀</td>
                                    <td>18</td>
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
const boardData = [
    { department: '인사팀', postCount: 45 }, 
    { department: '개발팀', postCount: 32 },
    { department: '마케팅팀', postCount: 28 },
    { department: '재무팀', postCount: 35 },
    { department: '영업팀', postCount: 25 },
    { department: '총무팀', postCount: 20 },
    { department: '보안팀', postCount: 15 },
    { department: '법무팀', postCount: 18 }
];

// 차트와 테이블에 사용할 데이터 추출
const departments = boardData.map(item => item.department);
const postCounts = boardData.map(item => item.postCount);

// 차트 생성
const boardChart = new Chart(document.getElementById('boardChart'), {
    type: 'bar',
    data: {
        labels: departments,
        datasets: [{
            label: '게시글 수',
            data: postCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            barThickness: 30
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 5
                }
            }
        }
    }
});

// 차트 크기 조절
document.getElementById('boardChart').parentElement.style.height = '300px';
</script>
