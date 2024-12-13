package com.office.controller;

import com.office.app.dto.LlamaChatRequest;
import com.office.app.dto.LlamaChatResponse;
import com.office.app.entity.LlamaChatHistory;
import com.office.app.service.LlamaChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Tag(name = "LLaMA Chat", description = "LLaMA 챗봇 API")
@RestController
@RequestMapping("/api/llama-chat")
@RequiredArgsConstructor
public class LlamaController {
    private final LlamaChatService llamaChatService;

    @Operation(
            summary = "챗봇과 대화하기",
            description = "LLaMA 모델과 대화를 시작합니다. 대화 컨텍스트를 유지합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "성공적으로 응답을 받았습니다",
                    content = @Content(schema = @Schema(implementation = LlamaChatResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = LlamaChatResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 오류가 발생했습니다",
                    content = @Content(schema = @Schema(implementation = LlamaChatResponse.class))
            )
    })
    @PostMapping
    public ResponseEntity<LlamaChatResponse> chat(
            @RequestBody LlamaChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // 사용자 입력이 없는 경우 자기소개 프롬프트 설정
            if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                request.setPrompt("안녕하세요! 자기소개 해주세요.");
                request.setSystemPrompt("당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 한국어로 자연스럽게 대화해주세요.");
            }

            // 사용자 정보와 함께 서비스 호출
            LlamaChatResponse response = llamaChatService.chat(request, userDetails.getUsername());

            if ("실패".equals(response.getStatus())) {
                return ResponseEntity.internalServerError().body(response);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LlamaChatResponse errorResponse = new LlamaChatResponse();
            errorResponse.setStatus("실패");
            errorResponse.setError(e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @Operation(
            summary = "채팅 이력 조회",
            description = "사용자의 이전 대화 내역을 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "성공적으로 채팅 이력을 조회했습니다",
                    content = @Content(schema = @Schema(implementation = LlamaChatHistory.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = LlamaChatHistory.class))
            )
    })
    @GetMapping("/history")
    public ResponseEntity<List<LlamaChatHistory>> getLlamaChatHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            List<LlamaChatHistory> history = llamaChatService.getLlamaChatHistory(userDetails.getUsername());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(
            summary = "채팅 이력 삭제",
            description = "사용자의 모든 대화 내역을 삭제합니다."
    )
    @DeleteMapping("/history")
    public ResponseEntity<Void> clearLlamaChatHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            llamaChatService.clearLlamaChatHistory(userDetails.getUsername());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}