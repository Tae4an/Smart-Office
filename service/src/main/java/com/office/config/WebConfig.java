package com.office.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Web 설정을 담당하는 Configuration 클래스
 * 정적 리소스 처리 및 SPA 라우팅을 위한 설정을 포함
 */
@Slf4j
@Configuration
public class WebConfig implements WebMvcConfigurer {


    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
    }

    @Controller
    public static class ReactController {
        @GetMapping(value = {
                "/",  // 루트 경로
                "/{x:[\\w\\-]+}",  // 단일 경로 세그먼트 (예: /home, /about)
                "/{x:^(?!api|ws|swagger-ui|v3|static).*$}/**/{y:[\\w\\-]+}"  // API 등을 제외한 중첩 경로
        })
        public String getIndex() {
            return "forward:/index.html";
        }
    }
}