<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<header class="header">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <button class="btn btn-link sidebar-toggle">
                <i class="fas fa-bars"></i>
            </button>

            <div class="ms-auto d-flex align-items-center">
                <sec:authorize access="isAuthenticated()">
                    <div class="dropdown">
                        <button class="btn btn-link dropdown-toggle text-white" type="button" id="userDropdown" data-bs-toggle="dropdown">
                            <i class="fas fa-user me-2"></i>
                            <sec:authentication property="principal.user.name" />
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="/admin/profile">프로필</a></li>
                            <li><a class="dropdown-item" href="/admin/password">비밀번호 변경</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="/logout">로그아웃</a></li>
                        </ul>
                    </div>
                </sec:authorize>
            </div>
        </div>
    </nav>
</header>