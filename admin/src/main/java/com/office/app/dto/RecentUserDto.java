package com.office.app.dto;

import com.office.app.entity.User;
import lombok.Builder;
import lombok.Data;
import java.time.format.DateTimeFormatter;

@Data
@Builder
public class RecentUserDto {
    private String employeeId;
    private String name;
    private String department;
    private String position;
    private String createdAt;
    
    public static RecentUserDto from(User user) {
        return RecentUserDto.builder()
            .employeeId(user.getEmployeeId())
            .name(user.getName())
            .department(user.getDepartment())
            .position(user.getPosition())
            .createdAt(user.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
            .build();
    }
}