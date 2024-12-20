package com.office.controller;

import com.office.app.dto.FaceVerifyRequest;
import com.office.app.dto.FaceVerifyResponse;
import com.office.app.service.FaceVerifyService;
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
@RequestMapping("/api/verify")
@RequiredArgsConstructor
@Tag(name = "Face Verification", description = "얼굴 인증 API")
public class FaceVerifyController {

    private final FaceVerifyService faceVerifyService;

    @Operation(summary = "얼굴 인증 처리", description = "직원의 얼굴 이미지를 검증합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "인증 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/face")
    public ResponseEntity<FaceVerifyResponse> verifyFace(
            @Parameter(description = "얼굴 이미지", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "직원 ID", required = true)
            @RequestHeader("X-User-Id") String employeeId) {

        log.info("얼굴 인증 요청 - employeeId: {}", employeeId);

        FaceVerifyRequest request = new FaceVerifyRequest();
        request.setFile(file);
        request.setEmployeeId(employeeId);

        FaceVerifyResponse response = faceVerifyService.verifyFace(request);

        return response.isSuccess() 
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }
}
