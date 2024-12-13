package com.office.controller;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import com.office.app.dto.GCSRequest;
import com.office.app.dto.GCSResponse;
import com.office.app.entity.FileInfo;
import com.office.app.repository.FileInfoRepository;
import com.office.exception.GCSException;
import com.office.app.service.GCSService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/gcs")
@Tag(name = "Google Cloud Storage", description = "GCS 파일 관리 API")
public class GCSController {

    @Value("${spring.cloud.gcp.storage.bucket}")
    private String bucketName;
    private final Storage storage;
    private final FileInfoRepository fileInfoRepository;
    private final GCSService gcsService;

    @Operation(summary = "파일 업로드", description = "GCS에 파일을 업로드하고 업로드한 사용자 정보와 함께 저장합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "업로드 성공",
                    content = @Content(schema = @Schema(implementation = GCSResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @PostMapping("/upload")
    public ResponseEntity<GCSResponse> uploadObject(
            @Parameter(description = "업로드할 파일 정보", required = true)
            @ModelAttribute GCSRequest gcsRequest,
            @Parameter(description = "업로드하는 사용자 ID", required = true)
            @RequestHeader("X-User-Id") String employeeId) throws GCSException {
        return ResponseEntity.ok(gcsService.uploadObject(gcsRequest, employeeId, false));
    }

    @Operation(summary = "파일 다운로드", description = "GCS에서 파일을 다운로드합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "다운로드 성공",
                    content = @Content(mediaType = "application/octet-stream")),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음")
    })
    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadObject(
            @PathVariable String fileName,
            @RequestHeader("X-User-Id") String employeeId) throws GCSException {
        try {
            // 파일 정보 조회
            FileInfo fileInfo = fileInfoRepository.findByStoredFileNameAndUploader_EmployeeId(fileName, employeeId)
                    .orElseThrow(() -> new GCSException("File not found or no permission: " + fileName));

            // GCS에서 파일 다운로드
            Blob blob = storage.get(bucketName, fileName);
            if (blob == null) {
                throw new GCSException("File not found in GCS: " + fileName);
            }

            // 파일 데이터를 ByteArrayResource로 변환
            ByteArrayResource resource = new ByteArrayResource(blob.getContent());

            // Content-Disposition 헤더 설정 - RFC 5987 형식 사용
            String encodedFilename = URLEncoder.encode(fileInfo.getOriginalFileName(), StandardCharsets.UTF_8)
                    .replace("+", "%20");
            String contentDisposition = String.format("attachment; filename=\"%s\"; filename*=UTF-8''%s",
                    encodedFilename, encodedFilename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                    .contentLength(blob.getSize())
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to download file: {}", fileName, e);
            throw new GCSException("Failed to download file", e);
        }
    }

    @Operation(summary = "파일 삭제", description = "GCS에서 파일을 삭제하고 관련 정보를 DB에서도 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음")
    })
    @DeleteMapping("/{fileName}")
    public ResponseEntity<Void> deleteObject(
            @Parameter(description = "삭제할 파일명", required = true)
            @PathVariable String fileName,
            @Parameter(description = "삭제 요청하는 사용자 ID", required = true)
            @RequestHeader("X-User-Id") String employeeId) throws GCSException {
        gcsService.deleteObject(fileName, employeeId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "전체 파일 목록 조회", description = "GCS에 저장된 모든 파일 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = GCSResponse.class))),
            @ApiResponse(responseCode = "400", description = "조회 실패",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    @GetMapping("/list")
    public ResponseEntity<List<GCSResponse>> listObjects() throws GCSException {
        return ResponseEntity.ok(gcsService.listObjects());
    }

    @Operation(summary = "사용자별 파일 목록 조회", description = "특정 사용자가 업로드한 파일 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = GCSResponse.class))),
            @ApiResponse(responseCode = "400", description = "조회 실패",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @GetMapping("/user/{employeeId}")
    public ResponseEntity<List<GCSResponse>> listUserObjects(
            @Parameter(description = "조회할 사용자 ID", required = true)
            @PathVariable String employeeId) throws GCSException {
        return ResponseEntity.ok(gcsService.listUserObjects(employeeId));
    }

    @ExceptionHandler(GCSException.class)
    public ResponseEntity<String> handleGCSException(GCSException e) {
        log.error("GCS operation failed", e);
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}