package com.office.controller;

import com.office.app.dto.UserDTO;
import com.office.app.entity.User;
import com.office.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetails currentUser) {
        // 현재 사용자를 제외한 사용자 검색
        List<User> users = userRepository.findByNameContainingOrDepartmentContaining(
            keyword, keyword)
            .stream()
            .filter(user -> !user.getEmployeeId().equals(currentUser.getUsername()))
            .collect(Collectors.toList());

        List<UserDTO> userDTOs = users.stream()
            .map(user -> UserDTO.builder()
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .department(user.getDepartment())
                .position(user.getPosition())
                .build())
            .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }
}
