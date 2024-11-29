package com.office.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .title("Smart Office API")
                .description("스마트 오피스 시스템의 관리자 API 문서")
                .version("0.1.0")
                .contact(new Contact()
                        .name("TaeSan Choi")
                        .email("xotks7524@gmail.com")
                        .url("https://github.com/Tae4an/Smart-Office"));

        return new OpenAPI()
                .info(info);
    }
}
