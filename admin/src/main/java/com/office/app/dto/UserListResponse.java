package com.office.app.dto;

import com.office.app.entity.User;
import lombok.Builder;
import lombok.Data;
import java.time.format.DateTimeFormatter;

@Data
@Builder
public class UserListResponse {
    private String employeeId;
    private String name;
    private String department;
    private String position;
    private String email;
    private String createdAt;

    public static UserListResponse from(User user) {
        return UserListResponse.builder()
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .department(user.getDepartment())
                .position(user.getPosition())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .build();
    }
}