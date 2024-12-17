package com.office.controller;

import com.office.app.dto.OCRResultDTO;
import com.office.app.dto.OCRResultDownload;
import com.office.app.dto.OCRResultResponse;
import com.office.app.dto.OCRResultSaveRequest;
import com.office.app.service.OCRResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
@Slf4j
@RestController
@RequestMapping("/api/ocr/results")
@RequiredArgsConstructor
@Tag(name = "OCR Results", description = "OCR 결과 관리 API")
public class OCRResultController {
    private final OCRResultService ocrResultService;

    @Operation(summary = "OCR 결과 저장", description = "OCR 텍스트와 분석 결과를 저장합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공적으로 저장됨"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<OCRResultResponse> saveResult(
            @RequestBody @Valid OCRResultSaveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            OCRResultDTO savedResult = ocrResultService.saveResult(request, userDetails.getUsername());
            return ResponseEntity.ok(OCRResultResponse.builder()
                    .status("success")
                    .message("OCR 결과가 저장되었습니다.")
                    .data(savedResult)
                    .build());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid save request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(OCRResultResponse.builder()
                            .status("error")
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to save OCR result", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(OCRResultResponse.builder()
                            .status("error")
                            .message("OCR 결과 저장에 실패했습니다.")
                            .build());
        }
    }

    @Operation(summary = "사용자의 OCR 결과 목록 조회", description = "로그인한 사용자의 OCR 결과 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<OCRResultDTO>> getUserResults(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<OCRResultDTO> results = ocrResultService.getUserResults(userDetails.getUsername());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Failed to get user OCR results for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "OCR 결과 삭제", description = "특정 OCR 결과를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공적으로 삭제됨"),
            @ApiResponse(responseCode = "404", description = "결과를 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResult(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ocrResultService.deleteResult(id, userDetails.getUsername());
            return ResponseEntity.ok()
                    .body(Map.of(
                            "status", "success",
                            "message", "OCR 결과가 삭제되었습니다."
                    ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", "error",
                            "message", e.getMessage()
                    ));
        } catch (Exception e) {
            log.error("Failed to delete OCR result: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "error",
                            "message", "OCR 결과 삭제에 실패했습니다."
                    ));
        }
    }

    @Operation(summary = "OCR 결과 다운로드", description = "OCR 결과를 텍스트 파일로 다운로드합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공적으로 다운로드됨"),
            @ApiResponse(responseCode = "404", description = "결과를 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadResult(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            OCRResultDownload download = ocrResultService.getResultForDownload(id, userDetails.getUsername());

            // 한글 파일명 인코딩 처리
            String encodedFileName = URLEncoder.encode(download.getFileName(), StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");

            ByteArrayResource resource = new ByteArrayResource(
                    download.getContent().getBytes(StandardCharsets.UTF_8));

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(resource.contentLength())
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename*=UTF-8''" + encodedFileName)
                    .body(resource);
        } catch (IllegalArgumentException e) {
            log.warn("Download request for non-existent result: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to download OCR result: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "OCR 결과 상세 조회", description = "특정 OCR 결과의 상세 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공적으로 조회됨"),
            @ApiResponse(responseCode = "404", description = "결과를 찾을 수 없음")
    })
    @GetMapping("/{id}")
    public ResponseEntity<OCRResultDTO> getResult(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            OCRResultDTO result = ocrResultService.getResult(id, userDetails.getUsername());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to get OCR result: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}