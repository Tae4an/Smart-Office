<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<div class="container-fluid px-4">
    <h1 class="mt-4">내 프로필</h1>

    <div class="row">
        <div class="col-xl-8">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-user me-1"></i>
                    프로필 정보
                </div>
                <div class="card-body">
                    <form id="profileForm">
                        <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">사번</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control-plaintext"
                                       value="<sec:authentication property='principal.user.employeeId'/>" readonly>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">이름</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="name" name="name"
                                       value="<sec:authentication property='principal.user.name'/>"
                                       pattern="[가-힣]{2,10}" title="2~10자리의 한글을 입력하세요" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">부서</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="department" name="department"
                                       value="<sec:authentication property='principal.user.department'/>" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">직급</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="position" name="position"
                                       value="<sec:authentication property='principal.user.position'/>" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">이메일</label>
                            <div class="col-sm-9">
                                <input type="email" class="form-control" id="email" name="email"
                                       value="<sec:authentication property='principal.user.email'/>" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label class="col-sm-3 col-form-label">관리자 권한</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control-plaintext"
                                       value="<sec:authentication property='principal.admin.role'/>" readonly>
                            </div>
                        </div>
                        <div class="text-end">
                            <button type="button" class="btn btn-primary" onclick="updateProfile()">저장</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-xl-4">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-key me-1"></i>
                    비밀번호 관리
                </div>
                <div class="card-body">
                    <p class="text-muted">비밀번호를 변경하시려면 아래 버튼을 클릭하세요.</p>
                    <a href="/admin/password" class="btn btn-warning w-100">
                        비밀번호 변경
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- JavaScript -->
<script>
    function updateProfile() {
        const form = document.getElementById('profileForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const employeeId = '<sec:authentication property="principal.user.employeeId"/>';

        fetch(`/api/users/${employeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    alert('프로필이 성공적으로 업데이트되었습니다.\n변경사항을 적용하기 위해 다시 로그인해주세요.');
                    location.href = '/admin/logout';
                } else {
                    throw new Error('저장 실패');
                }
            })
            .catch(error => {
                alert('프로필 업데이트에 실패했습니다.');
            });
    }
</script>