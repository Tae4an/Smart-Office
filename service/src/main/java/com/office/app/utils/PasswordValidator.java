package com.office.app.utils;

import org.springframework.stereotype.Component;

@Component
public class PasswordValidator {
    public void validate(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("비밀번호는 최소 8자 이상이어야 합니다.");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("비밀번호는 최소 1개의 대문자를 포함해야 합니다.");
        }
        
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("비밀번호는 최소 1개의 소문자를 포함해야 합니다.");
        }
        
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("비밀번호는 최소 1개의 숫자를 포함해야 합니다.");
        }
        
        if (!password.matches(".*[!@#$%^&*()\\-_=+\\\\|\\[{\\]};:'\",<.>/?].*")) {
            throw new IllegalArgumentException("비밀번호는 최소 1개의 특수문자를 포함해야 합니다.");
        }
    }
}