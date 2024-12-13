package com.office.config;

import com.office.exception.LlamaChatException;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;

/**
 * LLaMA API 연동을 위한 설정 클래스
 * API 호출에 필요한 기본 설정값들을 관리하고 RestTemplate Bean을 제공
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "llama.api")  // application.yml/properties에서 llama.api로 시작하는 설정값들을 이 클래스의 필드와 매핑
public class LlamaApiConfig {

    /**
     * LLaMA API 서버의 기본 URL
     * application.yml에서 llama.api.base-url 값을 주입받음
     */
    @Value("${fast-api.api.base-url}")
    private String baseUrl;

    /**
     * API 서버 연결 시도 제한 시간 (밀리초)
     * 기본값: 5000ms (5초)
     */
    private int connectTimeout = 5000;

    /**
     * API 응답 대기 제한 시간 (밀리초)
     * 기본값: 30000ms (30초)
     */
    private int readTimeout = 30000;

    /**
     * LLaMA API 호출을 위한 RestTemplate Bean 생성
     * 스프링의 HTTP 클라이언트로 사용됨
     *
     * @return LLaMA API 전용 RestTemplate 인스턴스
     * 추가 가능한 설정들:
     * - 타임아웃 설정
     * - 재시도 정책
     * - 에러 핸들러
     * - 인터셉터 등
     */
    @Bean
    public RestTemplate llamaRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);

        RestTemplate restTemplate = new RestTemplate(factory);

        restTemplate.setErrorHandler(new ResponseErrorHandler() {
            @Override
            public boolean hasError(ClientHttpResponse response) throws IOException {
                return response.getStatusCode().isError();
            }

            @Override
            public void handleError(ClientHttpResponse response) throws IOException {
                throw new LlamaChatException("API 호출 중 오류 발생: " + response.getStatusCode());
            }
        });

        return restTemplate;
    }
}