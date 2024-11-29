<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 로그인</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container">
    <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h3 class="text-center mb-4">관리자 로그인</h3>

                    <c:if test="${param.error != null}">
                        <div class="alert alert-danger">
                            로그인 정보가 올바르지 않습니다.
                        </div>
                    </c:if>

                    <form action="/auth/login" method="post">
                        <div class="mb-3">
                            <label>사번</label>
                            <input type="text" name="username" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label>비밀번호</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">로그인</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>