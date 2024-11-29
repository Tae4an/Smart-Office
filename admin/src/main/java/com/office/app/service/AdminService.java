package com.office.app.service;

import com.office.app.domain.AdminRole;
import com.office.app.entity.Admin;
import com.office.app.entity.User;
import com.office.app.repository.AdminRepository;
import com.office.app.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    @Transactional
    public Admin createAdmin(String employeeId, AdminRole role) {
        User user = userRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + employeeId));
            
        if (adminRepository.existsByUser_EmployeeId(employeeId)) {
            throw new IllegalStateException("Admin already exists for user: " + employeeId);
        }
        
        Admin admin = Admin.builder()
            .user(user)
            .role(role)
            .build();
            
        return adminRepository.save(admin);
    }
    
    @Transactional
    public void removeAdmin(Long adminId) {
        adminRepository.deleteById(adminId);
    }
    
    @Transactional
    public Admin updateAdminRole(Long adminId, AdminRole newRole) {
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new EntityNotFoundException("Admin not found with ID: " + adminId));
        
        admin.setRole(newRole);
        return adminRepository.save(admin);
    }
    
    public Admin getAdminByEmployeeId(String employeeId) {
        return adminRepository.findByUser_EmployeeId(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Admin not found for employee: " + employeeId));
    }
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
    
    public List<Admin> getAdminsByRole(AdminRole role) {
        return adminRepository.findAllByRoleWithUser(role);
    }
    
    public boolean isAdmin(String employeeId) {
        return adminRepository.existsByUser_EmployeeId(employeeId);
    }


    // 페이징 처리된 전체 관리자 목록
    public Page<Admin> getAllAdmins(Pageable pageable) {
        return adminRepository.findAll(pageable);
    }

    // 역할별 페이징 처리된 관리자 목록
    public Page<Admin> getAdminsByRole(AdminRole role, Pageable pageable) {
        return adminRepository.findAllByRole(role, pageable);
    }

    // ID로 관리자 조회 (상세 보기용)
    public Admin getAdminById(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with ID: " + id));
    }

    // 검색 기능 추가
    public Page<Admin> searchAdmins(String keyword, AdminRole role, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return role == null ? getAllAdmins(pageable) : getAdminsByRole(role, pageable);
        }

        return adminRepository.searchAdmins(keyword, role, pageable);
    }
}