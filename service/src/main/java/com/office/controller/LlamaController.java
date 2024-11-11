package com.office.controller;

import com.office.app.dto.ChatResponse;
import com.office.app.dto.ChatRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api")
@Slf4j
public class LlamaController {

    private final WebClient webClient;

    public LlamaController() {
        this.webClient = WebClient.builder()
                .baseUrl("http://localhost:8000")  // FastAPI 서버 주소
                .build();
    }

    @PostMapping("/chat")
    public Mono<ChatResponse> chat(@RequestBody ChatRequest request) {
        return webClient.post()
                .uri("/api/llama/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .doOnError(e -> log.error("Chat request failed: ", e))
                .onErrorReturn(new ChatResponse("오류가 발생했습니다.", "error"));
    }

    @GetMapping("/test")
    public Mono<ChatResponse> testChat() {
        ChatRequest request = new ChatRequest("안녕하세요, 자기소개 해주세요.");
        return chat(request);
    }
}