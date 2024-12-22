<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 로그인</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="/static/css/auth.css">
</head>
<body class="bg-gradient">
    <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
            <div class="col-md-4">
                <div class="card shadow-lg animate-card">
                    <div class="card-body p-4">
                        <div class="text-center mb-4">
                            <div class="icon-circle mb-3">
                                <i class="fas fa-building fa-2x"></i>
                            </div>
                            <h3 class="fw-bold text-primary mb-2">스마트 오피스</h3>
                            <p class="text-muted">관리자 로그인</p>
                        </div>

                        <c:if test="${param.error != null}">
                            <div class="alert alert-danger d-flex align-items-center" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <div>로그인 정보가 올바르지 않습니다.</div>
                            </div>
                        </c:if>

                        <form action="/auth/login" method="post">
                            <div class="mb-4">
                                <label for="username" class="form-label">
                                    <i class="fas fa-user me-2"></i>사번
                                </label>
                                <input type="text" name="username" class="form-control custom-input"
                                       id="username" placeholder="사번을 입력하세요" required>
                            </div>
                            <div class="mb-4">
                                <label for="password" class="form-label">
                                    <i class="fas fa-lock me-2"></i>비밀번호
                                </label>
                                <input type="password" name="password" class="form-control custom-input"
                                       id="password" placeholder="비밀번호를 입력하세요" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 py-3 mb-3 hover-effect">
                                로그인 <i class="fas fa-arrow-right ms-2"></i>
                            </button>
                        </form>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <p class="text-muted">&copy; 2024 Smart Office. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>