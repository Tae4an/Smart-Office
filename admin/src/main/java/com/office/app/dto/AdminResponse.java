package com.office.app.dto;

import com.office.app.domain.AdminRole;
import com.office.app.entity.Admin;
import lombok.Builder;
import lombok.Data;
import java.time.format.DateTimeFormatter;

@Data
@Builder
public class AdminResponse {
    private Long id;
    private String employeeId;
    private String name;
    private String department;
    private String position;
    private String email;
    private AdminRole role;
    private String createdAt;
    
    public static AdminResponse from(Admin admin) {
        return AdminResponse.builder()
            .id(admin.getId())
            .employeeId(admin.getUser().getEmployeeId())
            .name(admin.getUser().getName())
            .department(admin.getUser().getDepartment())
            .position(admin.getUser().getPosition())
            .email(admin.getUser().getEmail())
            .role(admin.getRole())
            .createdAt(admin.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
            .build();
    }
}