package com.office.app.security;

import com.office.app.entity.User;
import com.office.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String employeeId) throws UsernameNotFoundException {
        if (employeeId == null || employeeId.trim().isEmpty()) {
            throw new UsernameNotFoundException("사번을 입력해주세요.");
        }

        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + employeeId));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmployeeId())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }
}