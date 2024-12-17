package com.office.aspect;

import com.office.app.domain.RequireAdminAccess;
import com.office.app.domain.RequireDepartmentManagerAccess;
import com.office.app.entity.User;
import com.office.app.repository.UserRepository;
import com.office.exception.BoardAccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class AccessControlAspect {
    private final UserRepository userRepository;

    @Around("@annotation(requireDepartmentManagerAccess)")
    public Object checkDepartmentManagerAccess(
            ProceedingJoinPoint joinPoint,
            RequireDepartmentManagerAccess requireDepartmentManagerAccess
    ) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String employeeId = authentication.getName();

        User user = userRepository.findById(employeeId)
                .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        // 부서 관리자 또는 시스템 관리자 권한 확인
        if (!(user.getRole() == User.UserRole.MANAGER ||
                user.getRole() == User.UserRole.ADMIN)) {
            throw new BoardAccessDeniedException("해당 작업에 대한 권한이 없습니다.");
        }

        // 특정 부서 코드가 지정된 경우 추가 검증
        String departmentCode = requireDepartmentManagerAccess.departmentCode();
        if (!departmentCode.isEmpty() && !user.getDepartment().equals(departmentCode)) {
            throw new BoardAccessDeniedException("해당 부서에 대한 권한이 없습니다.");
        }

        return joinPoint.proceed();
    }

    @Around("@annotation(requireAdminAccess)")
    public Object checkAdminAccess(
            ProceedingJoinPoint joinPoint,
            RequireAdminAccess requireAdminAccess
    ) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String employeeId = authentication.getName();

        User user = userRepository.findById(employeeId)
                .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        // 시스템 관리자 권한 확인
        if (requireAdminAccess.systemAdmin() &&
                user.getRole() != User.UserRole.SUPER_ADMIN) {
            throw new BoardAccessDeniedException("시스템 관리자 권한이 필요합니다.");
        }

        // 일반 관리자 권한 확인
        if (!requireAdminAccess.systemAdmin() &&
                !(user.getRole() == User.UserRole.ADMIN ||
                        user.getRole() == User.UserRole.SUPER_ADMIN)) {
            throw new BoardAccessDeniedException("관리자 권한이 필요합니다.");
        }

        return joinPoint.proceed();
    }
}