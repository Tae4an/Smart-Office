package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private String employeeId;
    private String name;
    private String department;
    private String position;
}