package com.office.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Value("${spring.profiles.active}")
    private String activeProfile;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> {
                    // 항상 허용할 경로
                    auth.requestMatchers(
                            "/",
                            "/static/**",
                            "/error",
                            "/index.html",
                            "/login",
                            "/ws/**"
                    ).permitAll();

                    // 개발 환경에서만 Swagger UI 접근 허용
                    if ("dev".equals(activeProfile)) {
                        auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-resources/**").permitAll();
                    }

                    // 나머지 모든 요청은 인증 필요
                    auth.anyRequest().authenticated();
                })
                .formLogin(form -> {
                    form
                            .loginPage("/")  // 커스텀 로그인 페이지 경로 지정
                            .loginProcessingUrl("/login")  // 로그인 처리 URL
                            .usernameParameter("employeeId")  // 사용자 ID 파라미터명 변경
                            .passwordParameter("password")   // 비밀번호 파라미터명 변경
                            .defaultSuccessUrl("/home")
                            .failureUrl("/?error=true")
                            .permitAll();
                })
                .sessionManagement(session -> {
                    session.maximumSessions(1)
                            .maxSessionsPreventsLogin(true);
                    session.sessionFixation().changeSessionId();
                })
                .logout(logout -> {
                    logout.logoutSuccessUrl("/")
                            .invalidateHttpSession(true)
                            .deleteCookies("JSESSIONID");
                });

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}