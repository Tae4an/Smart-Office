package com.office.app.security;

import com.office.app.entity.Admin;
import com.office.app.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class AdminUserDetails implements UserDetails {
    private final User user;
    private final Admin admin;
    private final Collection<? extends GrantedAuthority> authorities;

    public AdminUserDetails(User user, Admin admin) {
        this.user = user;
        this.admin = admin;
        this.authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + admin.getRole().name())
        );
    }

    @Override
    public String getUsername() {
        return user.getEmployeeId();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}