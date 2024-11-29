package com.office.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDto {

    @NotBlank(message = "사번은 필수입니다")
    @Pattern(regexp = "^[0-9]{6}$", message = "사번은 6자리 숫자여야 합니다")
    private String employeeId;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$",
            message = "비밀번호는 8~20자리이며 영문, 숫자, 특수문자를 포함해야 합니다")
    private String password;

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