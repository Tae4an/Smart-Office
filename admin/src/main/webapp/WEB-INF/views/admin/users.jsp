<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<div class="container-fluid px-4">
    <h1 class="mt-4">사용자 관리</h1>

    <!-- 검색 영역 -->
    <div class="card mb-4">
        <div class="card-body">
            <form id="searchForm" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">검색어</label>
                    <input type="text" class="form-control" name="keyword" value="${param.keyword}"
                           placeholder="사번, 이름으로 검색">
                </div>
                <div class="col-md-3">
                    <label class="form-label">부서</label>
                    <select class="form-select" name="department">
                        <option value="">전체</option>
                        <c:forEach items="${departments}" var="dept">
                            <option value="${dept}" ${param.department eq dept ? 'selected' : ''}>
                                    ${dept}
                            </option>
                        </c:forEach>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">&nbsp;</label>
                    <button type="submit" class="btn btn-primary d-block">검색</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 사용자 목록 -->
    <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <i class="fas fa-users me-1"></i>
                사용자 목록
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="openUserModal()">
                사용자 등록
            </button>
        </div>
        <div class="card-body">
            <table class="table table-striped table-bordered">
                <thead>
                <tr>
                    <th>사번</th>
                    <th>이름</th>
                    <th>부서</th>
                    <th>직급</th>
                    <th>이메일</th>
                    <th>등록일</th>
                    <th>관리</th>
                </tr>
                </thead>
                <tbody>
                <c:forEach items="${users.content}" var="user">
                    <tr>
                        <td>${user.employeeId}</td>
                        <td>${user.name}</td>
                        <td>${user.department}</td>
                        <td>${user.position}</td>
                        <td>${user.email}</td>
                        <td>${user.createdAt}</td>
                        <td>
                            <button type="button" class="btn btn-info btn-sm"
                                    onclick="openUserModal('${user.employeeId}')">수정</button>
                            <button type="button" class="btn btn-warning btn-sm"
                                    onclick="resetPassword('${user.employeeId}')">비밀번호 초기화</button>
                            <button type="button" class="btn btn-danger btn-sm"
                                    onclick="deleteUser('${user.employeeId}')">삭제</button>
                        </td>
                    </tr>
                </c:forEach>
                </tbody>
            </table>

            <!-- 페이징 -->
            <nav aria-label="Page navigation" class="mt-3">
                <ul class="pagination justify-content-center">
                    <li class="page-item ${users.first ? 'disabled' : ''}">
                        <a class="page-link" href="?page=0&keyword=${param.keyword}&department=${param.department}">처음</a>
                    </li>
                    <li class="page-item ${users.first ? 'disabled' : ''}">
                        <a class="page-link" href="?page=${users.number-1}&keyword=${param.keyword}&department=${param.department}">이전</a>
                    </li>
                    <c:forEach begin="${Math.max(0, users.number-2)}"
                               end="${Math.min(users.totalPages-1, users.number+2)}" var="i">
                        <li class="page-item ${users.number == i ? 'active' : ''}">
                            <a class="page-link" href="?page=${i}&keyword=${param.keyword}&department=${param.department}">${i+1}</a>
                        </li>
                    </c:forEach>
                    <li class="page-item ${users.last ? 'disabled' : ''}">
                        <a class="page-link" href="?page=${users.number+1}&keyword=${param.keyword}&department=${param.department}">다음</a>
                    </li>
                    <li class="page-item ${users.last ? 'disabled' : ''}">
                        <a class="page-link" href="?page=${users.totalPages-1}&keyword=${param.keyword}&department=${param.department}">마지막</a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</div>

<!-- 사용자 등록/수정 모달 -->
<div class="modal fade" id="userModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">사용자 등록/수정</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="userForm">
                    <div class="mb-3">
                        <label class="form-label">사번</label>
                        <input type="text" class="form-control" id="employeeId" name="employeeId"
                               pattern="[0-9]{6}" title="6자리 숫자를 입력하세요" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">이름</label>
                        <input type="text" class="form-control" id="name" name="name"
                               pattern="[가-힣]{2,10}" title="2~10자리의 한글을 입력하세요" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">부서</label>
                        <input type="text" class="form-control" id="department" name="department" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">직급</label>
                        <input type="text" class="form-control" id="position" name="position" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">이메일</label>
                        <input type="email" class="form-control" id="email" name="email" required>
                    </div>
                    <div class="mb-3" id="passwordGroup">
                        <label class="form-label">비밀번호</label>
                        <input type="password" class="form-control" id="password" name="password"
                               pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$"
                               title="8~20자리이며 영문, 숫자, 특수문자를 포함해야 합니다">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                <button type="button" class="btn btn-primary" onclick="saveUser()">저장</button>
            </div>
        </div>
    </div>
</div>

<!-- JavaScript -->
<script>
    let userModal;
    let isUpdate = false;

    document.addEventListener('DOMContentLoaded', function() {
        userModal = new bootstrap.Modal(document.getElementById('userModal'));
    });

    function openUserModal(employeeId) {
        const form = document.getElementById('userForm');
        const passwordGroup = document.getElementById('passwordGroup');
        form.reset();

        if (employeeId) {
            isUpdate = true;
            passwordGroup.style.display = 'none';
            document.getElementById('employeeId').readOnly = true;

            // 사용자 정보 조회
            fetch(`/api/users/${employeeId}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('employeeId').value = data.employeeId;
                    document.getElementById('name').value = data.name;
                    document.getElementById('department').value = data.department;
                    document.getElementById('position').value = data.position;
                    document.getElementById('email').value = data.email;
                });
        } else {
            isUpdate = false;
            passwordGroup.style.display = 'block';
            document.getElementById('employeeId').readOnly = false;
        }

        userModal.show();
    }

    function saveUser() {
        const form = document.getElementById('userForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const employeeId = document.getElementById('employeeId').value;

        const url = isUpdate ? `/api/users/${employeeId}` : '/api/users';
        const method = isUpdate ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    userModal.hide();
                    location.reload();
                } else {
                    throw new Error('저장 실패');
                }
            })
            .catch(error => {
                alert('저장에 실패했습니다.');
            });
    }

    function resetPassword(employeeId) {
        if (confirm('비밀번호를 초기화하시겠습니까?')) {
            fetch(`/api/users/${employeeId}/reset-password`, {
                method: 'POST'
            })
                .then(response => {
                    if (response.ok) {
                        alert('비밀번호가 초기화되었습니다.');
                    } else {
                        throw new Error('초기화 실패');
                    }
                })
                .catch(error => {
                    alert('비밀번호 초기화에 실패했습니다.');
                });
        }
    }

    function deleteUser(employeeId) {
        if (confirm('정말 삭제하시겠습니까?')) {
            fetch(`/api/users/${employeeId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        location.reload();
                    } else {
                        throw new Error('삭제 실패');
                    }
                })
                .catch(error => {
                    alert('삭제에 실패했습니다.');
                });
        }
    }
</script>