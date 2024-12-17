package com.office.config;

import com.office.app.security.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    @Value("${spring.profiles.active}")
    private String activeProfile;

    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationSuccessHandlerImpl authenticationSuccessHandler;
    private final AuthenticationFailureHandlerImpl authenticationFailureHandler;
    private final LogoutSuccessHandlerImpl logoutSuccessHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // CSRF 보호 비활성화 (개발 환경)
                .authorizeHttpRequests(auth -> {
                    // 정적 리소스와 공개 경로 설정
                    auth.requestMatchers(
                                    "/",
                                    "/static/**",
                                    "/error",
                                    "/index.html",
                                    "/login",
                                    "/manifest.json",
                                    "/favicon.ico"
                            ).permitAll()
                            // WebSocket과 API 요청은 인증 필요
                            .requestMatchers("/ws/**").authenticated()
                            .requestMatchers("/api/**").authenticated()
                            .requestMatchers("/api/boards/**").hasAnyRole("MANAGER", "ADMIN", "SUPER_ADMIN")
                            .requestMatchers("/api/posts/**").hasAnyRole("USER", "MANAGER", "ADMIN", "SUPER_ADMIN")
                            .requestMatchers("/api/comments/**").hasAnyRole("USER", "MANAGER", "ADMIN", "SUPER_ADMIN")
                            .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN");

                    // 개발 환경에서 Swagger UI 접근 허용
                    if ("dev".equals(activeProfile)) {
                        auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-resources/**").permitAll();
                    }

                    auth.anyRequest().authenticated();
                })
                .userDetailsService(userDetailsService)
                // 세션 관리 설정
                .sessionManagement(session -> {
                    session
                            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                            .invalidSessionUrl("/")
                            .maximumSessions(1)  // 동시 세션 제한
                            .maxSessionsPreventsLogin(true)  // 중복 로그인 방지
                            .expiredUrl("/");
                    session.sessionFixation().newSession();  // 세션 고정 공격 방지
                })
                // 로그인 설정
                .formLogin(form -> {
                    form
                            .loginPage("/")
                            .loginProcessingUrl("/login")
                            .usernameParameter("employeeId")
                            .passwordParameter("password")
                            .successHandler(authenticationSuccessHandler)
                            .failureHandler(authenticationFailureHandler)
                            .permitAll();
                })
                // 로그아웃 설정
                .logout(logout -> {
                    logout
                            .logoutUrl("/logout")
                            .logoutSuccessUrl("/")
                            .deleteCookies("JSESSIONID")
                            .invalidateHttpSession(true)
                            .logoutSuccessHandler(logoutSuccessHandler);
                })
                // 예외 처리 설정
                .exceptionHandling(handling -> {
                    handling
                            .authenticationEntryPoint(authenticationEntryPoint)
                            .accessDeniedHandler(accessDeniedHandler);
                });

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}