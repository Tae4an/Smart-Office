package com.office.app.service;

import com.office.app.dto.LlamaChatRequest;
import com.office.app.dto.LlamaChatResponse;
import com.office.app.entity.LlamaChatHistory;
import com.office.app.repository.LlamaChatHistoryRepository;
import com.office.config.LlamaApiConfig;
import com.office.exception.LlamaChatException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlamaChatService {
    private final RestTemplate llamaRestTemplate;
    private final LlamaApiConfig llamaApiConfig;
    private final LlamaChatHistoryRepository llamaChatHistoryRepository;

    @Retryable(
            value = {Exception.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000)
    )
    @Transactional
    public LlamaChatResponse chat(LlamaChatRequest request, String userId) {
        String apiUrl = llamaApiConfig.getBaseUrl() + "/api/v1/llama/chat";

        // 최근 대화 컨텍스트 가져오기
        List<LlamaChatHistory> recentHistory =
                llamaChatHistoryRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);

        // 컨텍스트 포함한 요청 생성
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("prompt", request.getPrompt());
        requestBody.put("systemPrompt", request.getSystemPrompt());
        requestBody.put("context", recentHistory.stream()
                .map(h -> Map.of(
                        "role", h.getUserId().equals(userId) ? "user" : "assistant",
                        "content", h.getUserId().equals(userId) ? h.getPrompt() : h.getResponse()
                ))
                .toList());

        // API 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        try {
            // API 호출
            LlamaChatResponse response = llamaRestTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    LlamaChatResponse.class
            ).getBody();

            if (response == null || response.getResponse() == null) {
                log.error("Empty response received from API");
                throw new LlamaChatException("API 응답이 비어있습니다.");
            }

            // 채팅 내역 저장
            LlamaChatHistory history = new LlamaChatHistory();
            history.setUserId(userId);
            history.setPrompt(request.getPrompt());
            history.setSystemPrompt(request.getSystemPrompt());
            history.setResponse(response.getResponse());
            llamaChatHistoryRepository.save(history);

            log.debug("Chat completed successfully for user: {}", userId);
            return response;

        } catch (Exception e) {
            log.error("Chat failed for user: {}", userId, e);
            throw new LlamaChatException("챗봇 응답 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<LlamaChatHistory> getLlamaChatHistory(String userId) {
        return llamaChatHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void clearLlamaChatHistory(String userId) {
        llamaChatHistoryRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<LlamaChatHistory> getRecentChatContext(String userId) {
        return llamaChatHistoryRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
    }
}