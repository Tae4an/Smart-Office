package com.office.controller;

import com.office.app.dto.PasswordChangeRequest;
import com.office.app.dto.UserCreateDto;
import com.office.app.dto.UserDetailResponse;
import com.office.app.dto.UserUpdateDto;
import com.office.app.security.AdminUserDetails;
import com.office.app.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserApiController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDetailResponse> createUser(@Valid @RequestBody UserCreateDto dto) {
        return ResponseEntity.ok(
            UserDetailResponse.from(userService.createUser(dto))
        );
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<UserDetailResponse> getUser(@PathVariable String employeeId) {
        return ResponseEntity.ok(
            UserDetailResponse.from(userService.getUser(employeeId))
        );
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<UserDetailResponse> updateUser(
            @PathVariable String employeeId,
            @Valid @RequestBody UserUpdateDto dto) {
        return ResponseEntity.ok(
            UserDetailResponse.from(userService.updateUser(employeeId, dto))
        );
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String employeeId) {
        userService.deleteUser(employeeId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{employeeId}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable String employeeId) {
        userService.resetPassword(employeeId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{employeeId}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable String employeeId,
            @Valid @RequestBody PasswordChangeRequest request,
            @AuthenticationPrincipal AdminUserDetails userDetails) {
        // 본인 비밀번호만 변경 가능
        if (!employeeId.equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        userService.changePassword(employeeId, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}