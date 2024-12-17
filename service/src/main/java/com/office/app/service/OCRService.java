package com.office.app.service;

import com.office.app.dto.OCRResponse;
import com.office.app.dto.LlamaChatRequest;
import com.office.app.dto.LlamaChatResponse;
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
    private final LlamaChatService llamaChatService;

    @Value("${fast-api.api.base-url}")
    private String ocrApiBaseUrl;

    private static final String DOCUMENT_ANALYSIS_PROMPT =
            "다음 문서를 분석하고 아래 항목들을 제공해주세요:\n" +
                    "1. 문서 종류: 어떤 종류의 문서인지 분류해주세요\n" +
                    "2. 핵심 요약: 문서의 주요 내용을 3줄로 요약해주세요\n" +
                    "3. 주요 키워드: 문서에서 중요한 키워드 5개를 추출해주세요\n" +
                    "4. 추가 분석: 문서의 특이사항이나 주목할 만한 점을 설명해주세요\n\n" +
                    "분석할 문서 내용:\n";

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

            OCRResponse ocrResponse = restTemplate.postForObject(
                    url,
                    requestEntity,
                    OCRResponse.class
            );

            if (ocrResponse == null) {
                throw new OCRProcessingException("OCR response is null");
            }

            if (!"success".equals(ocrResponse.getStatus())) {
                throw new OCRProcessingException("OCR processing failed: " + ocrResponse.getStatus());
            }

            log.info("Successfully received OCR response for file: {}", filename);
            log.debug("OCR Response data: {}", ocrResponse.getData());

            // LLaMA를 통한 문서 분석 수행
            String extractedText = ocrResponse.getData().getText();
            LlamaChatResponse analysis = analyzeDocument(extractedText);

            // 분석 결과를 OCR 응답에 추가
            ocrResponse.setAnalysis(analysis.getResponse());

            log.info("Document analysis completed for file: {}", filename);
            log.debug("Analysis result: {}", analysis.getResponse());

            return ocrResponse;

        } catch (Exception e) {
            log.error("Error processing OCR for file: {}", storedFileName, e);
            throw new OCRProcessingException("OCR 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * LLaMA를 사용하여 문서 분석을 수행하는 private 메서드
     */
    private LlamaChatResponse analyzeDocument(String documentText) {
        try {
            LlamaChatRequest analysisRequest = new LlamaChatRequest();
            analysisRequest.setPrompt(DOCUMENT_ANALYSIS_PROMPT + documentText);
            analysisRequest.setSystemPrompt(
                    "당신은 전문적인 문서 분석가입니다. " +
                            "문서의 내용을 정확하게 이해하고 구조화된 분석 결과를 제공해주세요. " +
                            "전문 용어가 있다면 적절히 설명해주시고, 문맥을 고려하여 의미있는 인사이트를 제공해주세요."
            );

            LlamaChatResponse analysis = llamaChatService.chat(analysisRequest, "SYSTEM");

            // 상태 체크 수정: "success" 또는 "성공" 둘 다 허용
            if (!"success".equals(analysis.getStatus()) && !"성공".equals(analysis.getStatus())) {
                throw new OCRProcessingException("Document analysis failed: " + analysis.getStatus());
            }

            return analysis;
        } catch (Exception e) {
            log.error("Error analyzing document with LLaMA", e);
            throw new OCRProcessingException("문서 분석 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
}