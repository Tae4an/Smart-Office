package com.office.controller;

import com.office.app.dto.AdminCreateRequest;
import com.office.app.dto.AdminResponse;
import com.office.app.dto.AdminRoleUpdateRequest;
import com.office.app.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminApiController {

    private final AdminService adminService;

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<AdminResponse> createAdmin(@Valid @RequestBody AdminCreateRequest request) {
        return ResponseEntity.ok(
            AdminResponse.from(
                adminService.createAdmin(request.getEmployeeId(), request.getRole())
            )
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<AdminResponse> getAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(
            AdminResponse.from(adminService.getAdminById(id))
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<AdminResponse> updateAdminRole(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleUpdateRequest request) {
        return ResponseEntity.ok(
            AdminResponse.from(
                adminService.updateAdminRole(id, request.getRole())
            )
        );
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        adminService.removeAdmin(id);
        return ResponseEntity.ok().build();
    }
}