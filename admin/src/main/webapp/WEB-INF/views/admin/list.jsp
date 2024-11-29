<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<div class="container-fluid px-4">
    <h1 class="mt-4">관리자 관리</h1>

    <!-- 검색 영역 -->
    <div class="card mb-4">
        <div class="card-body">
            <form id="searchForm" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">검색어</label>
                    <input type="text" class="form-control" name="keyword" placeholder="사번, 이름, 부서">
                </div>
                <div class="col-md-2">
                    <label class="form-label">권한</label>
                    <select class="form-select" name="role">
                        <option value="">전체</option>
                        <option value="SUPER_ADMIN">슈퍼관리자</option>
                        <option value="ADMIN">일반관리자</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">&nbsp;</label>
                    <button type="submit" class="btn btn-primary d-block">검색</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 관리자 목록 -->
    <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <i class="fas fa-table me-1"></i>
                관리자 목록
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="openAdminModal()">
                관리자 등록
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
                    <th>권한</th>
                    <th>등록일</th>
                    <th>관리</th>
                </tr>
                </thead>
                <tbody>
                <c:forEach items="${adminList.content}" var="admin">
                    <tr>
                        <td>${admin.user.employeeId}</td>
                        <td>${admin.user.name}</td>
                        <td>${admin.user.department}</td>
                        <td>${admin.user.position}</td>
                        <td>
                                <span class="badge ${admin.role == 'SUPER_ADMIN' ? 'bg-danger' : 'bg-primary'}">
                                        ${admin.role == 'SUPER_ADMIN' ? '슈퍼관리자' : '일반관리자'}
                                </span>
                        </td>
                        <td>${admin.createdAt}</td>
                        <td>
                            <button type="button" class="btn btn-info btn-sm"
                                    onclick="showAdminDetail('${admin.id}')">상세</button>
                            <button type="button" class="btn btn-warning btn-sm"
                                    onclick="updateAdminRole('${admin.id}')">권한 수정</button>
                            <button type="button" class="btn btn-danger btn-sm"
                                    onclick="deleteAdmin('${admin.id}')">삭제</button>
                        </td>
                    </tr>
                </c:forEach>
                </tbody>
            </table>

            <!-- 페이징 -->
            <nav aria-label="Page navigation" class="mt-3">
                <ul class="pagination justify-content-center">
                    <li class="page-item ${adminList.first ? 'disabled' : ''}">
                        <a class="page-link" href="?page=0">처음</a>
                    </li>
                    <li class="page-item ${adminList.first ? 'disabled' : ''}">
                        <a class="page-link" href="?page=${adminList.number-1}">이전</a>
                    </li>
                    <c:if test="${not empty adminList.content}">
                        <c:forEach begin="${Math.max(0, adminList.number-2)}"
                                   end="${Math.min(Math.max(0, adminList.totalPages-1), adminList.number+2)}" var="i">
                            <li class="page-item ${adminList.number == i ? 'active' : ''}">
                                <a class="page-link" href="?page=${i}">${i+1}</a>
                            </li>
                        </c:forEach>
                    </c:if>
                    <li class="page-item ${adminList.last ? 'disabled' : ''}">
                        <a class="page-link" href="?page=${adminList.number+1}">다음</a>
                    </li>
                    <li class="page-item ${adminList.last ? 'disabled' : ''}">
                        <a class="page-link" href="?page=${adminList.totalPages-1}">마지막</a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</div>

<!-- 관리자 등록/수정 모달 -->
<div class="modal fade" id="adminModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">관리자 등록</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="adminForm">
                    <input type="hidden" id="adminId" name="id">
                    <div class="mb-3">
                        <label class="form-label">사번</label>
                        <input type="text" class="form-control" id="employeeId" name="employeeId" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">권한</label>
                        <select class="form-select" id="role" name="role" required>
                            <option value="ADMIN">일반관리자</option>
                            <option value="SUPER_ADMIN">슈퍼관리자</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                <button type="button" class="btn btn-primary" onclick="saveAdmin()">저장</button>
            </div>
        </div>
    </div>
</div>

<!-- JavaScript -->
<script>
    // 상세 정보 조회
    function showAdminDetail(adminId) {
        fetch('/api/admin/' + adminId)
            .then(response => response.json())
            .then(data => {
                const modalHtml =
                    '<div class="modal fade" id="adminDetailModal" tabindex="-1" role="dialog" aria-labelledby="adminDetailModalLabel">' +
                    '<div class="modal-dialog" role="document">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<h5 class="modal-title" id="adminDetailModalLabel">관리자 상세 정보</h5>' +
                    '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<dl class="row">' +
                    '<dt class="col-sm-4">사번</dt>' +
                    '<dd class="col-sm-8">' + data.employeeId + '</dd>' +

                    '<dt class="col-sm-4">이름</dt>' +
                    '<dd class="col-sm-8">' + data.name + '</dd>' +

                    '<dt class="col-sm-4">부서</dt>' +
                    '<dd class="col-sm-8">' + data.department + '</dd>' +

                    '<dt class="col-sm-4">직급</dt>' +
                    '<dd class="col-sm-8">' + data.position + '</dd>' +

                    '<dt class="col-sm-4">이메일</dt>' +
                    '<dd class="col-sm-8">' + data.email + '</dd>' +

                    '<dt class="col-sm-4">권한</dt>' +
                    '<dd class="col-sm-8">' + (data.role == 'SUPER_ADMIN' ? '슈퍼관리자' : '일반관리자') + '</dd>' +

                    '<dt class="col-sm-4">등록일</dt>' +
                    '<dd class="col-sm-8">' + data.createdAt + '</dd>' +
                    '</dl>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

                // 기존 모달이 있으면 제거
                const existingModal = document.getElementById('adminDetailModal');
                if (existingModal) {
                    existingModal.remove();
                }

                // 새 모달 추가 및 표시
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                const modal = new bootstrap.Modal(document.getElementById('adminDetailModal'));
                modal.show();
            })
            .catch(error => {
                alert('관리자 정보를 불러오는데 실패했습니다.');
                console.error('Error:', error);
            });
    }

    // 관리자 권한 수정
    function updateAdminRole(adminId) {
        fetch('/api/admin/' + adminId)
            .then(response => response.json())
            .then(data => {
                const modalHtml =
                    '<div class="modal fade" id="adminRoleModal" tabindex="-1" role="dialog" aria-labelledby="adminRoleModalLabel">' +
                    '<div class="modal-dialog" role="document">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<h5 class="modal-title" id="adminRoleModalLabel">관리자 권한 수정</h5>' +
                    '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<form id="adminRoleForm">' +
                    '<div class="mb-3">' +
                    '<label class="form-label">사번</label>' +
                    '<input type="text" class="form-control" value="' + data.employeeId + '" readonly>' +
                    '</div>' +
                    '<div class="mb-3">' +
                    '<label class="form-label">이름</label>' +
                    '<input type="text" class="form-control" value="' + data.name + '" readonly>' +
                    '</div>' +
                    '<div class="mb-3">' +
                    '<label class="form-label">권한</label>' +
                    '<select class="form-select" id="adminRole">' +
                    '<option value="ADMIN" ' + (data.role == 'ADMIN' ? 'selected' : '') + '>일반관리자</option>' +
                    '<option value="SUPER_ADMIN" ' + (data.role == 'SUPER_ADMIN' ? 'selected' : '') + '>슈퍼관리자</option>' +
                    '</select>' +
                    '</div>' +
                    '</form>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>' +
                    '<button type="button" class="btn btn-primary" onclick="saveAdminRole(\'' + adminId + '\')">저장</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

                // 기존 모달이 있으면 제거
                const existingModal = document.getElementById('adminRoleModal');
                if (existingModal) {
                    existingModal.remove();
                }

                // 새 모달 추가 및 표시
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                const modal = new bootstrap.Modal(document.getElementById('adminRoleModal'));
                modal.show();
            })
            .catch(error => {
                alert('관리자 정보를 불러오는데 실패했습니다.');
                console.error('Error:', error);
            });
    }

    // 관리자 권한 저장
    function saveAdminRole(adminId) {
        const role = document.getElementById('adminRole').value;

        fetch(`/api/admin/${adminId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: role })
        })
            .then(response => {
                if (response.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('adminRoleModal'));
                    modal.hide();
                    location.reload();
                } else {
                    throw new Error('권한 수정 실패');
                }
            })
            .catch(error => {
                alert('권한 수정에 실패했습니다.');
                console.error('Error:', error);
            });
    }

    // 관리자 삭제
    function deleteAdmin(adminId) {
        if (confirm('정말 이 관리자를 삭제하시겠습니까?')) {
            fetch(`/api/admin/${adminId}`, {
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
                    alert('관리자 삭제에 실패했습니다.');
                    console.error('Error:', error);
                });
        }
    }
    let adminModal;

    document.addEventListener('DOMContentLoaded', function() {
        adminModal = new bootstrap.Modal(document.getElementById('adminModal'));
    });

    function openAdminModal() {
        document.getElementById('adminForm').reset();
        document.getElementById('adminId').value = '';
        adminModal.show();
    }

    function openAdminDetailModal(id) {
        fetch(`<c:url value="/api/admin/${id}"/>`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('adminId').value = data.id;
                document.getElementById('employeeId').value = data.employeeId;
                document.getElementById('role').value = data.role;
                adminModal.show();
            });
    }

    function saveAdmin() {
        const form = document.getElementById('adminForm');
        const id = document.getElementById('adminId').value;
        const url = id ? `/api/admin/${id}` : '/api/admin';
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employeeId: document.getElementById('employeeId').value,
                role: document.getElementById('role').value
            })
        })
            .then(response => {
                if (response.ok) {
                    adminModal.hide();
                    location.reload();
                } else {
                    alert('처리 중 오류가 발생했습니다.');
                }
            });
    }

    function deleteAdmin(id) {
        if (confirm('정말 삭제하시겠습니까?')) {
            fetch(`<c:url value="/api/admin/${id}"/>`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        location.reload();
                    } else {
                        alert('삭제 중 오류가 발생했습니다.');
                    }
                });
        }
    }

    // 검색 폼 제출
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const params = new URLSearchParams(formData);
        location.href = `?${params.toString()}`;
    });
</script>