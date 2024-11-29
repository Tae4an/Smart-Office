package com.office.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PasswordChangeRequest {
    @NotBlank(message = "현재 비밀번호는 필수입니다")
    private String currentPassword;
    
    @NotBlank(message = "새 비밀번호는 필수입니다")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$",
            message = "비밀번호는 8~20자리이며 영문, 숫자, 특수문자를 포함해야 합니다")
    private String newPassword;
}