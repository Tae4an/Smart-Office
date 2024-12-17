<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<nav class="sidebar">
    <div class="sidebar-header">
        <h3>사내 업무 관리</h3>
    </div>

    <ul class="sidebar-nav">
        <li class="nav-item">
            <a href="/admin/dashboard" class="nav-link">
                <i class="fas fa-tachometer-alt me-2"></i>
                대시보드
            </a>
        </li>

        <sec:authorize access="hasRole('SUPER_ADMIN')">
            <li class="nav-item">
                <a href="/admin/list" class="nav-link">
                    <i class="fas fa-user-shield me-2"></i>
                    관리자 관리
                </a>
            </li>
        </sec:authorize>

        <li class="nav-item">
            <a href="/admin/users" class="nav-link">
                <i class="fas fa-users me-2"></i>
                사용자 관리
            </a>
        </li>

        <li class="nav-item">
            <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="collapse" data-bs-target="#statisticsSubmenu">
                <i class="fas fa-chart-line me-2"></i>
                통계
            </a>
            <ul class="collapse nav-submenu" id="statisticsSubmenu">
                <li class="nav-item">
                    <a href="/statistics/board" class="nav-link">
                        <i class="fas fa-clipboard-list me-2"></i>
                        게시판 통계
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/statistics/department" class="nav-link">
                        <i class="fas fa-building me-2"></i>
                        부서별 통계
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/statistics/attendance" class="nav-link">
                        <i class="fas fa-user-clock me-2"></i>
                        출근 통계
                    </a>
                </li>
            </ul>
        </li>
    </ul>
</nav>