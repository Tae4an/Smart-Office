package com.office.app.dto;

import com.office.app.domain.AdminRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateRequest {
    @NotNull(message = "관리자 권한은 필수입니다")
    private AdminRole role;
}