package com.office.controller;

import com.office.app.dto.GCSRequest;
import com.office.app.dto.GCSResponse;
import com.office.app.dto.OCRResponse;
import com.office.app.service.GCSService;
import com.office.app.service.OCRService;
import com.office.exception.OCRProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@Slf4j
@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@Tag(name = "OCR", description = "OCR 이미지 처리 API")
public class OCRController {

    private final GCSService gcsService;
    private final OCRService ocrService;

    @Operation(summary = "OCR 이미지 업로드 및 처리",
            description = "이미지를 GCS에 업로드하고 OCR 처리를 수행합니다. 이미지는 자동으로 img 폴더에 저장됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OCR 처리 성공",
                    content = @Content(schema = @Schema(implementation = OCRResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "500", description = "서버 오류",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PostMapping("/upload")
    public ResponseEntity<OCRResponse> uploadAndProcessOCR(
            @Parameter(description = "업로드할 이미지 파일 (지원 형식: JPG, PNG, GIF, PDF)", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "업로드하는 사용자 ID", required = true)
            @RequestHeader("X-User-Id") String employeeId) {
        try {
            GCSRequest gcsRequest = new GCSRequest();
            gcsRequest.setFile(file);
            GCSResponse gcsResponse = gcsService.uploadObject(gcsRequest, employeeId, true);

            OCRResponse ocrResponse = ocrService.processOCR(gcsResponse.getFileName());
            log.info("OCR Response: {}", ocrResponse);

            return ResponseEntity.ok(ocrResponse);
        } catch (Exception e) {
            log.error("Failed to process OCR request", e);
            throw new OCRProcessingException("OCR 처리 중 오류가 발생했습니다", e);
        }
    }
}