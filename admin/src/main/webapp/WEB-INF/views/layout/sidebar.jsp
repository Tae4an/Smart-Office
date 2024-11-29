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
    </ul>
</nav>