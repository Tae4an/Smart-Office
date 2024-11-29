package com.office.app.service;

import com.office.app.domain.AdminRole;
import com.office.app.dto.AdminRoleStats;
import com.office.app.dto.DashboardStats;
import com.office.app.dto.DepartmentStats;
import com.office.app.dto.RecentUserDto;
import com.office.app.entity.User;
import com.office.app.repository.AdminRepository;
import com.office.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardService {
    
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    public DashboardStats getDashboardStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        
        return DashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalAdmins(adminRepository.count())
                .totalDepartments(userRepository.findDistinctDepartments().size())
                .newUsersToday(userRepository.countByCreatedAtAfter(startOfDay))
                .build();
    }

    public DepartmentStats getDepartmentStats() {
        List<Map<String, Object>> departmentCounts = userRepository.countByDepartment();

        List<String> departments = departmentCounts.stream()
                .map(map -> (String) map.get("dept"))
                .collect(Collectors.toList());

        List<Long> counts = departmentCounts.stream()
                .map(map -> ((Number) map.get("count")).longValue())
                .collect(Collectors.toList());

        return DepartmentStats.builder()
                .labels(departments)
                .data(counts)
                .build();
    }

    public AdminRoleStats getAdminRoleStats() {
        return AdminRoleStats.builder()
                .superAdminCount(adminRepository.countByRole(AdminRole.SUPER_ADMIN))
                .adminCount(adminRepository.countByRole(AdminRole.ADMIN))
                .build();
    }

    public List<RecentUserDto> getRecentUsers(int limit) {
        return userRepository.findTop10ByOrderByCreatedAtDesc()
            .stream()
            .map(RecentUserDto::from)
            .collect(Collectors.toList());
    }
}