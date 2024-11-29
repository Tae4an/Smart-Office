<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<div class="container-fluid px-4">
    <h1 class="mt-4">대시보드</h1>

    <!-- 통계 카드 -->
    <div class="row">
        <div class="col-xl-3 col-md-6">
            <div class="card bg-primary text-white mb-4">
                <div class="card-body">
                    <h4 class="mb-2">${stats.totalUsers}</h4>
                    <div>전체 사용자</div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="/admin/users">상세보기</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="card bg-warning text-white mb-4">
                <div class="card-body">
                    <h4 class="mb-2">${stats.totalAdmins}</h4>
                    <div>전체 관리자</div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="/admin/list">상세보기</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="card bg-success text-white mb-4">
                <div class="card-body">
                    <h4 class="mb-2">${stats.totalDepartments}</h4>
                    <div>전체 부서</div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="/admin/users">상세보기</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="card bg-danger text-white mb-4">
                <div class="card-body">
                    <h4 class="mb-2">${stats.newUsersToday}</h4>
                    <div>오늘 신규 사용자</div>
                </div>
                <div class="card-footer d-flex align-items-center justify-content-between">
                    <a class="small text-white stretched-link" href="/admin/users">상세보기</a>
                    <div class="small text-white"><i class="fas fa-angle-right"></i></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 부서별 사용자 분포 & 관리자 권한 분포 -->
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
                    관리자 권한 분포
                </div>
                <div class="card-body">
                    <canvas id="adminRoleChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- 최근 가입한 사용자 -->
    <div class="card mb-4">
        <div class="card-header">
            <i class="fas fa-table me-1"></i>
            최근 가입한 사용자
        </div>
        <div class="card-body">
            <table class="table table-bordered">
                <thead>
                <tr>
                    <th>사번</th>
                    <th>이름</th>
                    <th>부서</th>
                    <th>직급</th>
                    <th>가입일</th>
                </tr>
                </thead>
                <tbody>
                <c:forEach items="${recentUsers}" var="user">
                    <tr>
                        <td>${user.employeeId}</td>
                        <td>${user.name}</td>
                        <td>${user.department}</td>
                        <td>${user.position}</td>
                        <td>${user.createdAt.format(java.time.format.DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm'))}</td>
                    </tr>
                </c:forEach>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // 부서별 사용자 분포 차트
    const departmentChart = new Chart(document.getElementById('departmentChart'), {
        type: 'bar',
        data: {
            labels: ${departmentStats.labels},
            datasets: [{
                label: '사용자 수',
                data: ${departmentStats.data},
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // 관리자 권한 분포 차트
    const adminRoleChart = new Chart(document.getElementById('adminRoleChart'), {
        type: 'pie',
        data: {
            labels: ['슈퍼관리자', '일반관리자'],
            datasets: [{
                data: [${adminStats.superAdminCount}, ${adminStats.adminCount}],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(75, 192, 192)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
</script>