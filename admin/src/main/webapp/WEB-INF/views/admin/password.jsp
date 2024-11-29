<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<div class="container-fluid px-4">
    <h1 class="mt-4">비밀번호 변경</h1>

    <div class="row">
        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-key me-1"></i>
                    비밀번호 변경
                </div>
                <div class="card-body">
                    <form id="passwordForm">
                        <div class="mb-3">
                            <label class="form-label">현재 비밀번호</label>
                            <input type="password" class="form-control" id="currentPassword" name="currentPassword" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">새 비밀번호</label>
                            <input type="password" class="form-control" id="newPassword" name="newPassword"
                                   pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$"
                                   title="8~20자리이며 영문, 숫자, 특수문자를 포함해야 합니다" required>
                            <div class="form-text">
                                비밀번호는 8~20자리이며 영문, 숫자, 특수문자를 포함해야 합니다.
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">새 비밀번호 확인</label>
                            <input type="password" class="form-control" id="confirmPassword" required>
                            <div class="invalid-feedback">
                                비밀번호가 일치하지 않습니다.
                            </div>
                        </div>
                        <div class="text-end">
                            <button type="button" class="btn btn-secondary" onclick="location.href='/admin/profile'">
                                취소
                            </button>
                            <button type="button" class="btn btn-primary" onclick="changePassword()">
                                변경
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-xl-6">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-info-circle me-1"></i>
                    비밀번호 정책
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">비밀번호는 8자 이상 20자 이하여야 합니다.</li>
                        <li class="list-group-item">영문, 숫자, 특수문자를 모두 포함해야 합니다.</li>
                        <li class="list-group-item">사용 가능한 특수문자: @$!%*#?&</li>
                        <li class="list-group-item">이전에 사용한 비밀번호는 사용할 수 없습니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- JavaScript -->
<script>
    // 비밀번호 일치 여부 확인
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = this.value;

        if (newPassword !== confirmPassword) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });

    function changePassword() {
        const form = document.getElementById('passwordForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        const data = {
            currentPassword: document.getElementById('currentPassword').value,
            newPassword: newPassword
        };

        const employeeId = '<sec:authentication property="principal.user.employeeId"/>';

        fetch(`/api/users/${employeeId}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    alert('비밀번호가 성공적으로 변경되었습니다.\n다시 로그인해주세요.');
                    location.href = '/admin/logout';
                } else {
                    throw new Error('변경 실패');
                }
            })
            .catch(error => {
                alert('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
            });
    }
</script>