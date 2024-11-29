package com.office.app.security;

import com.office.app.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticationEventListener {
    private final AdminService adminService;
    private static final Logger log = LoggerFactory.getLogger(AuthenticationEventListener.class);

    @EventListener
    public void onAuthenticationSuccess(AuthenticationSuccessEvent event) {
        String employeeId = event.getAuthentication().getName();
        log.info("Admin login success: {}", employeeId);
    }

    @EventListener
    public void onAuthenticationFailure(AuthenticationFailureBadCredentialsEvent event) {
        String employeeId = event.getAuthentication().getName();
        log.warn("Admin login failed: {}", employeeId);
    }
}