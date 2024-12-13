package com.office.app.service;

import com.office.app.dto.OCRResponse;
import com.office.exception.OCRProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class OCRService {

    private final RestTemplate restTemplate;

    @Value("${fast-api.api.base-url}")
    private String ocrApiBaseUrl;

    public OCRResponse processOCR(String storedFileName) {
        try {
            // storedFileName에서 'img/' 접두어 제거
            String filename = storedFileName;
            if (storedFileName.startsWith("img/")) {
                filename = storedFileName.substring(4); // "img/" 제거
            }

            String url = UriComponentsBuilder
                    .fromHttpUrl(ocrApiBaseUrl)
                    .path("/api/v1/ocr/process")
                    .queryParam("filename", filename)
                    .build()
                    .toUriString();

            log.info("Sending OCR request to: {} with filename: {}", url, filename);

            // HTTP 헤더 설정 추가
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // 요청 바디 생성
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("filename", filename);

            // HTTP 엔티티 생성
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            OCRResponse response = restTemplate.postForObject(
                    url,
                    requestEntity,
                    OCRResponse.class
            );

            if (response == null) {
                throw new OCRProcessingException("OCR response is null");
            }

            if (!"success".equals(response.getStatus())) {
                throw new OCRProcessingException("OCR processing failed: " + response.getStatus());
            }

            log.info("Successfully received OCR response for file: {}", filename);
            log.debug("OCR Response data: {}", response.getData());

            return response;

        } catch (Exception e) {
            log.error("Error processing OCR for file: {}", storedFileName, e);
            throw new OCRProcessingException("OCR 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
}