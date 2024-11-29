package com.office.app.service;

import com.office.app.entity.User;
import com.office.app.dto.*;
import com.office.app.repository.UserRepository;
import java.util.List;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    private static final String DEFAULT_PASSWORD = "User123!@#";

    @Transactional
    public User createUser(UserCreateDto dto) {
        // 사번 중복 체크
        if (userRepository.existsById(dto.getEmployeeId())) {
            throw new IllegalStateException("이미 존재하는 사번입니다: " + dto.getEmployeeId());
        }

        // 이메일 중복 체크
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다: " + dto.getEmail());
        }

        return userRepository.save(User.builder()
                .employeeId(dto.getEmployeeId())
                .password(passwordEncoder.encode(dto.getPassword()))
                .name(dto.getName())
                .department(dto.getDepartment())
                .position(dto.getPosition())
                .email(dto.getEmail())
                .passwordChangeRequired(true)
                .build());
    }

    public User getUser(String employeeId) {
        return userRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + employeeId));
    }

    @Transactional
    public User updateUser(String employeeId, UserUpdateDto dto) {
        User user = getUser(employeeId);

        // 이메일 중복 체크 (자신의 이메일은 제외)
        if (!user.getEmail().equals(dto.getEmail()) && 
            userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다: " + dto.getEmail());
        }

        user.setName(dto.getName());
        user.setDepartment(dto.getDepartment());
        user.setPosition(dto.getPosition());
        user.setEmail(dto.getEmail());

        return user;
    }

    @Transactional
    public void deleteUser(String employeeId) {
        if (!userRepository.existsById(employeeId)) {
            throw new EntityNotFoundException("사용자를 찾을 수 없습니다: " + employeeId);
        }
        userRepository.deleteById(employeeId);
    }

    @Transactional
    public void resetPassword(String employeeId) {
        User user = getUser(employeeId);
        user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        user.setPasswordChangeRequired(true);
    }
    
    @Transactional
    public void changePassword(String employeeId, String currentPassword, String newPassword) {
        User user = getUser(employeeId);

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 새 비밀번호와 현재 비밀번호가 같은지 확인
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        // 새 비밀번호 설정
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(false);
    }

    public Page<UserListResponse> searchUsers(String keyword, String department, Pageable pageable) {
        return userRepository.findByKeywordAndDepartment(keyword, department, pageable)
                .map(UserListResponse::from);
    }

    public List<String> getAllDepartments() {
        return userRepository.findDistinctDepartments();
    }
}