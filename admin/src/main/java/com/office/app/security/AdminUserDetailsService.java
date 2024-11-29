package com.office.app.security;

import com.office.app.entity.Admin;
import com.office.app.entity.User;
import com.office.app.repository.AdminRepository;
import com.office.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String employeeId) throws UsernameNotFoundException {
        User user = userRepository.findById(employeeId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + employeeId));

        Admin admin = adminRepository.findByUser_EmployeeId(employeeId)
            .orElseThrow(() -> new UsernameNotFoundException("Not an admin user: " + employeeId));

        return new AdminUserDetails(user, admin);
    }
}