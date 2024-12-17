package com.office.app.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.office.app.entity.User;
import com.office.app.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuthenticationSuccessHandlerImpl implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        // 인증된 사용자의 employeeId 가져오기
        String employeeId = authentication.getName();

        // 사용자 정보 조회
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 필요한 정보만 포함하는 응답 객체 생성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("success", true);
        responseData.put("employeeId", user.getEmployeeId());
        responseData.put("name", user.getName());
        responseData.put("department", user.getDepartment());
        responseData.put("position", user.getPosition());
        responseData.put("email", user.getEmail());
        responseData.put("passwordChangeRequired", user.isPasswordChangeRequired());
        responseData.put("role", user.getRole());
        // JSON 응답 생성
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(new ObjectMapper().writeValueAsString(responseData));
    }
}