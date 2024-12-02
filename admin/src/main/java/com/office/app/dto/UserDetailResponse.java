package com.office.app.dto;

import com.office.app.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.format.DateTimeFormatter;

@Data
@Builder
public class UserDetailResponse {
    private String employeeId;
    private String name;
    private String department;
    private String position;
    private String email;
    private String createdAt;
    private String updatedAt;

    public static UserDetailResponse from(User user) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return UserDetailResponse.builder()
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .department(user.getDepartment())
                .position(user.getPosition())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt().format(formatter))
                .updatedAt(user.getUpdatedAt().format(formatter))
                .build();
    }
}