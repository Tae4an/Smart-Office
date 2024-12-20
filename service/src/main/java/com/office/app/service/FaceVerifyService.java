package com.office.app.service;

import com.office.app.dto.FaceVerifyRequest;
import com.office.app.dto.FaceVerifyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class FaceVerifyService {
    private final RestTemplate restTemplate;
    private final RedisService redisService;

    @Value("${fast-api.api.base-url}")
    private String fastApiBaseUrl;

    private static final String FACE_VERIFY_KEY_PREFIX = "face:verify:";
    private static final int CACHE_TIMEOUT = 60;

    public FaceVerifyResponse verifyFace(FaceVerifyRequest request) {
        String employeeId = request.getEmployeeId();
        String cacheKey = FACE_VERIFY_KEY_PREFIX + employeeId;

        try {
            // 1. Redis에 이미지 저장 (TTL 5초)
            byte[] imageData = request.getFile().getBytes();
            redisService.setWithExpiration(cacheKey, imageData, CACHE_TIMEOUT, TimeUnit.SECONDS);
            log.info("이미지 캐시 저장 완료 - employeeId: {}", employeeId);

            // 2. FastAPI 엔드포인트 호출 - 경로 수정
            String url = UriComponentsBuilder
                    .fromHttpUrl(fastApiBaseUrl)
                    .path("/api/v1/face/verify/") // FastAPI 라우터 경로와 일치하도록 수정
                    .path(employeeId)
                    .build()
                    .toUriString();

            log.debug("FastAPI 요청 URL: {}", url); // URL 디버그 로그 추가

            log.info("Sending face verification request - employeeId: {}", employeeId);

            ResponseEntity<FaceVerifyResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    createHttpEntity(employeeId),
                    FaceVerifyResponse.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Face verification failed");
            }

            log.info("Face verification completed - employeeId: {}, verified: {}", 
                    employeeId, response.getBody().isVerified());

            return response.getBody();

        } catch (Exception e) {
            log.error("얼굴 인증 처리 중 오류 발생 - employeeId: {}, error: {}", employeeId, e.getMessage());
            return FaceVerifyResponse.builder()
                    .success(false)
                    .message("얼굴 인증 처리 중 오류가 발생했습니다: " + e.getMessage())
                    .build();
        }
    }

    private HttpEntity<?> createHttpEntity(String employeeId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("X-User-Id", employeeId);
        return new HttpEntity<>(headers);
    }
}
