package com.office.config;

import com.office.app.security.AdminUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import jakarta.servlet.DispatcherType;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.security.web.header.writers.frameoptions.XFrameOptionsHeaderWriter;

import java.net.URLEncoder;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AdminUserDetailsService adminUserDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final SessionRegistry sessionRegistry;


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.FORWARD).permitAll()
                        .requestMatchers(
                                "/",
                                "/admin/login",
                                "/auth/login",
                                "/error",
                                "/static/**"
                        ).permitAll()
                        .requestMatchers("/admin/super/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/admin/management/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/admin/login")
                        .loginProcessingUrl("/auth/login")
                        .defaultSuccessUrl("/admin/dashboard", true)
                        .failureHandler((request, response, exception) -> {
                            String errorMessage = "Invalid credentials";
                            if (exception instanceof LockedException) {
                                errorMessage = "Account is locked";
                            }
                            response.sendRedirect("/admin/login?error=" + URLEncoder.encode(errorMessage, "UTF-8"));
                        })
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/admin/logout")
                        .logoutSuccessUrl("/admin/login?logout=true")
                        .invalidateHttpSession(true)  // 세션 무효화
                        .deleteCookies("JSESSIONID")  // 쿠키 삭제
                        .clearAuthentication(true)  // 인증 정보 제거
                )
                // 세션 관리 설정
                .sessionManagement(session -> session
                        .maximumSessions(1)  // 동시 세션 제한
                        .maxSessionsPreventsLogin(true)  // 중복 로그인 방지
                        .sessionRegistry(sessionRegistry)  // SessionRegistry 설정
                        .expiredUrl("/admin/login?expired=true")  // 세션 만료 시 리다이렉트
                )
                // 보안 헤더 설정
                .headers(headers -> headers
                        .addHeaderWriter(new XFrameOptionsHeaderWriter(
                                XFrameOptionsHeaderWriter.XFrameOptionsMode.SAMEORIGIN))  // 클릭재킹 방지
                        .contentSecurityPolicy(config ->
                                config.policyDirectives("default-src 'self'; " +
                                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com; " +
                                        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com; " +
                                        "font-src 'self' data: https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com; " +
                                        "img-src 'self' data:;"))
                );
        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(adminUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }
}