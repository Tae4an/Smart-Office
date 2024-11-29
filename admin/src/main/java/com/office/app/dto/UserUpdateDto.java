package com.office.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDto {
    
    @NotBlank(message = "이름은 필수입니다")
    @Pattern(regexp = "^[가-힣]{2,10}$", message = "이름은 2~10자리의 한글이어야 합니다")
    private String name;
    
    @NotBlank(message = "부서는 필수입니다")
    private String department;
    
    @NotBlank(message = "직급은 필수입니다")
    private String position;
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
}