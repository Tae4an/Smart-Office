package com.office.app.dto;

import com.office.app.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String employeeId;
    private String name;
    private String department;
    private String position;
    private String email;
    private boolean passwordChangeRequired;
    
    public static LoginResponse from(User user) {
        return LoginResponse.builder()
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .department(user.getDepartment())
                .position(user.getPosition())
                .email(user.getEmail())
                .passwordChangeRequired(user.isPasswordChangeRequired())
                .build();
    }
}