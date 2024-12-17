<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<div class="container-fluid px-4">
    <h1 class="mt-4">대시보드</h1>

    <!-- 통계 카드 -->
    <div class="row">
        <div class="col-xl-3 col-md-6">
            <div class="card dashboard-card bg-gradient-primary text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 class="mb-2 display-4 fw-bold">${stats.totalUsers}</h4>
                            <div class="text-white-50">전체 사용자</div>
                        </div>
                        <div class="dashboard-icon">
                            <i class="fas fa-users fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between border-top border-white-50">
                    <a class="small text-white stretched-link" href="/admin/users">상세보기</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="card dashboard-card bg-gradient-warning text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 class="mb-2 display-4 fw-bold">${stats.totalAdmins}</h4>
                            <div class="text-white-50">전체 관리자</div>
                        </div>
                        <div class="dashboard-icon">
                            <i class="fas fa-user-shield fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between border-top border-white-50">
                    <a class="small text-white stretched-link" href="/admin/list">상세보기</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="card dashboard-card bg-gradient-success text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 class="mb-2 display-4 fw-bold">${stats.totalDepartments}</h4>
                            <div class="text-white-50">전체 부서</div>
                        </div>
                        <div class="dashboard-icon">
                            <i class="fas fa-building fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between border-top border-white-50">
                    <a class="small text-white stretched-link" href="/admin/users">상세보기</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="card dashboard-card bg-gradient-danger text-white mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 class="mb-2 display-4 fw-bold">${stats.newUsersToday}</h4>
                            <div class="text-white-50">신규 사용자</div>
                        </div>
                        <div class="dashboard-icon">
                            <i class="fas fa-user-plus fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between border-top border-white-50">
                    <a class="small text-white stretched-link" href="/admin/users">상세보기</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 부서별 사용자 분포 & 부서별 댓글 활동 -->
    <div class="row">
        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-chart-bar me-1"></i>
                    부서별 사용자 분포
                </div>
                <div class="card-body">
                    <canvas id="departmentChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-chart-pie me-1"></i>
                    부서별 댓글 활동
                </div>
                <div class="card-body">
                    <canvas id="commentChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- 최근 가입한 사용자 -->
    <div class="card recent-users-card mb-4">
        <div class="card-header bg-white">
            <div class="d-flex align-items-center">
                <i class="fas fa-users me-2 text-primary"></i>
                <h5 class="mb-0">최근 가입한 사용자</h5>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="border-0">사번</th>
                            <th class="border-0">이름</th>
                            <th class="border-0">부서</th>
                            <th class="border-0">직급</th>
                            <th class="border-0">가입일</th>
                        </tr>
                    </thead>
                    <tbody>
                        <c:forEach items="${recentUsers}" var="user">
                            <tr>
                                <td class="ps-3">${user.employeeId}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                                            <i class="fas fa-user text-primary"></i>
                                        </div>
                                        <span class="fw-medium">${user.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark">${user.department}</span>
                                </td>
                                <td>${user.position}</td>
                                <td>
                                    <div class="text-muted">
                                        <i class="far fa-clock me-1"></i>
                                        ${user.createdAt.format(java.time.format.DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm'))}
                                    </div>
                                </td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const departmentColors = {
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
        ]
    };

    // 부서별 사용자 분포 차트
    const departmentChart = new Chart(document.getElementById('departmentChart'), {
        type: 'bar',
        data: {
            labels: ['인사팀', '개발팀', '마케팅팀', '재무팀', '영업팀', '총무팀', '보안팀', '법무팀'],
            datasets: [{
                label: '사용자 수',
                data: [30, 20, 25, 15, 20, 10, 12, 8],
                backgroundColor: departmentColors.backgroundColor,
                borderColor: departmentColors.borderColor,
                borderWidth: 1,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
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

    // 부서별 댓글 활동 차트
    const commentChart = new Chart(document.getElementById('commentChart'), {
        type: 'pie',
        data: {
            labels: ['인사팀', '개발팀', '마케팅팀', '재무팀', '영업팀', '총무팀', '보안팀', '법무팀'],
            datasets: [{
                data: [15, 12, 18, 10, 14, 8, 6, 5],
                backgroundColor: departmentColors.backgroundColor,
                borderColor: departmentColors.borderColor,
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
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });

    // 차트 크기 조절
    document.getElementById('commentChart').parentElement.style.height = '250px';
</script>

<!-- 스타일 추가 -->
<style>
.dashboard-card {
    transition: all 0.3s ease;
    border: none;
    border-radius: 15px;
}

.dashboard-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.bg-gradient-primary {
    background: linear-gradient(45deg, #4e73df, #224abe);
}

.bg-gradient-warning {
    background: linear-gradient(45deg, #f6c23e, #f4b619);
}

.bg-gradient-success {
    background: linear-gradient(45deg, #1cc88a, #13855c);
}

.bg-gradient-danger {
    background: linear-gradient(45deg, #e74a3b, #be2617);
}

.dashboard-card .display-4 {
    font-size: 2.5rem;
    font-weight: 600;
}

.dashboard-icon {
    padding: 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.1);
}

.recent-users-card {
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.recent-users-card .card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.recent-users-card .table th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    padding: 1rem 1.5rem;
    color: #6c757d;
}

.recent-users-card .table td {
    padding: 1rem 1.5rem;
    vertical-align: middle;
}

.avatar-sm {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
}

.badge {
    padding: 0.5em 1em;
    font-weight: 500;
}

.fw-medium {
    font-weight: 500;
}

.text-muted {
    font-size: 0.875rem;
}

.table-hover tbody tr:hover {
    background-color: rgba(0,0,0,0.02);
}
</style>