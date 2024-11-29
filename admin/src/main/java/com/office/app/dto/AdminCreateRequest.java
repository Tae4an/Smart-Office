package com.office.app.dto;

import com.office.app.domain.AdminRole;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminCreateRequest {
    @NotEmpty(message = "사번은 필수입니다")
    private String employeeId;
    
    @NotNull(message = "관리자 권한은 필수입니다")
    private AdminRole role;
}
