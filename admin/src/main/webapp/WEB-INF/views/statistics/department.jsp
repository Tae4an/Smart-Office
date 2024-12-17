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
    background: linear-gradient(45deg, #4e73df, #224abe);
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
    border-bottom: 2px solid #e9ecef;
}

.table tbody td {
    padding: 1rem 1.5rem;
    vertical-align: middle;
    border-color: #e9ecef;
    color: #495057;
}

.table-responsive {
    padding: 1rem;
}

canvas {
    padding: 1rem;
}

/* 차트 스타일 추가 */
.card {
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

canvas {
    margin: 10px;
    padding: 10px;
}

/* 대시보드 스타일 추가 */
.recent-users-card .table th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    padding: 1rem 1.5rem;
    color: #6c757d;
}

.table-hover tbody tr:hover {
    background-color: rgba(0,0,0,0.02);
}
</style>

<div class="container-fluid px-4">
    <h1 class="mt-4">부서별 통계</h1>
    
    <div class="row">
        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-chart-pie me-1"></i>
                    부서별 인원 분포
                </div>
                <div class="card-body">
                    <canvas id="departmentPieChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-users me-1"></i>
                    부서별 상세 현황
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>부서명</th>
                                    <th>총 인원</th>
                                    <th>남성</th>
                                    <th>여성</th>
                                    <th>평균 연령</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>인사팀</td>
                                    <td>30</td>
                                    <td>18</td>
                                    <td>12</td>
                                    <td>35</td>
                                </tr>
                                <tr>
                                    <td>개발팀</td>
                                    <td>20</td>
                                    <td>15</td>
                                    <td>5</td>
                                    <td>32</td>
                                </tr>
                                <tr>
                                    <td>마케팅팀</td>
                                    <td>25</td>
                                    <td>12</td>
                                    <td>13</td>
                                    <td>31</td>
                                </tr>
                                <tr>
                                    <td>재무팀</td>
                                    <td>15</td>
                                    <td>7</td>
                                    <td>8</td>
                                    <td>38</td>
                                </tr>
                                <tr>
                                    <td>영업팀</td>
                                    <td>20</td>
                                    <td>12</td>
                                    <td>8</td>
                                    <td>34</td>
                                </tr>
                                <tr>
                                    <td>총무팀</td>
                                    <td>10</td>
                                    <td>4</td>
                                    <td>6</td>
                                    <td>36</td>
                                </tr>
                                <tr>
                                    <td>보안팀</td>
                                    <td>12</td>
                                    <td>8</td>
                                    <td>4</td>
                                    <td>33</td>
                                </tr>
                                <tr>
                                    <td>법무팀</td>
                                    <td>8</td>
                                    <td>3</td>
                                    <td>5</td>
                                    <td>37</td>
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
const departmentData = [
    { name: '인사팀', totalCount: 30, male: 18, female: 12, avgAge: 35 },
    { name: '개발팀', totalCount: 20, male: 15, female: 5, avgAge: 32 },
    { name: '마케팅팀', totalCount: 25, male: 12, female: 13, avgAge: 31 },
    { name: '재무팀', totalCount: 15, male: 7, female: 8, avgAge: 38 },
    { name: '영업팀', totalCount: 20, male: 12, female: 8, avgAge: 34 },
    { name: '총무팀', totalCount: 10, male: 4, female: 6, avgAge: 36 },
    { name: '보안팀', totalCount: 12, male: 8, female: 4, avgAge: 33 },
    { name: '법무팀', totalCount: 8, male: 3, female: 5, avgAge: 37 }
];

// 차트 데이터 추출
const names = departmentData.map(item => item.name);
const counts = departmentData.map(item => item.totalCount);

// 차트 생성
const deptPieChart = new Chart(document.getElementById('departmentPieChart'), {
    type: 'pie',
    data: {
        labels: names,
        datasets: [{
            data: counts,
            backgroundColor: [
                'rgba(78, 115, 223, 0.6)',  // 인사팀
                'rgba(28, 200, 138, 0.6)',  // 개발팀
                'rgba(246, 194, 62, 0.6)',  // 마케팅팀
                'rgba(231, 74, 59, 0.6)',   // 재무팀
                'rgba(54, 185, 204, 0.6)',  // 영업팀
                'rgba(133, 135, 150, 0.6)', // 총무팀
                'rgba(105, 0, 132, 0.6)',   // 보안팀
                'rgba(95, 158, 160, 0.6)'   // 법무팀
            ],
            borderColor: [
                'rgb(78, 115, 223)',    // 인사팀
                'rgb(28, 200, 138)',    // 개발팀
                'rgb(246, 194, 62)',    // 마케팅팀
                'rgb(231, 74, 59)',     // 재무팀
                'rgb(54, 185, 204)',    // 영업팀
                'rgb(133, 135, 150)',   // 총무팀
                'rgb(105, 0, 132)',     // 보안팀
                'rgb(95, 158, 160)'     // 법무팀
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    padding: 8,
                    font: { size: 11 }
                }
            }
        }
    }
});

// 차트 크기 조절
document.getElementById('departmentPieChart').parentElement.style.height = '250px';
</script>
