package com.office.controller;

import com.office.app.dto.GCSRequest;
import com.office.app.dto.GCSResponse;
import com.office.exception.GCSException;
import com.office.app.service.GCSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 로깅을 위한 Slf4j 로거와 자동으로 생성자 주입을 설정하는 Lombok 애노테이션을 추가
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/gcs")
public class GCSController {

    // GCS 서비스와의 상호작용을 담당하는 서비스 객체
    private final GCSService gcsService;

    /**
     * 파일 업로드를 위한 API 엔드포인트
     * 
     * @param gcsRequest 업로드할 파일 정보를 포함한 요청 객체
     * @return 업로드 결과를 포함한 GCSResponse 객체를 ResponseEntity로 반환
     * @throws GCSException 업로드 과정에서 발생한 예외
     */
    @PostMapping("/upload")
    public ResponseEntity<GCSResponse> uploadObject(@ModelAttribute GCSRequest gcsRequest) throws GCSException {
        return ResponseEntity.ok(gcsService.uploadObject(gcsRequest));
    }

    /**
     * 파일 다운로드를 위한 API 엔드포인트
     * 
     * @param fileName 다운로드할 파일 이름
     * @return 다운로드 결과를 포함한 GCSResponse 객체를 ResponseEntity로 반환
     * @throws GCSException 다운로드 과정에서 발생한 예외
     */
    @GetMapping("/download/{fileName}")
    public ResponseEntity<GCSResponse> downloadObject(@PathVariable String fileName) throws GCSException {
        return ResponseEntity.ok(gcsService.downloadObject(fileName));
    }

    /**
     * 파일 삭제를 위한 API 엔드포인트
     * 
     * @param fileName 삭제할 파일 이름
     * @return 삭제 작업의 성공 여부를 나타내는 ResponseEntity<Void> 객체 반환
     * @throws GCSException 삭제 과정에서 발생한 예외
     */
    @DeleteMapping("/{fileName}")
    public ResponseEntity<Void> deleteObject(@PathVariable String fileName) throws GCSException {
        gcsService.deleteObject(fileName);
        return ResponseEntity.ok().build();
    }

    /**
     * GCS에 저장된 모든 파일 목록을 조회하기 위한 API 엔드포인트
     * 
     * @return 파일 목록을 포함한 List<GCSResponse> 객체를 ResponseEntity로 반환
     * @throws GCSException 파일 목록 조회 과정에서 발생한 예외
     */
    @GetMapping("/list")
    public ResponseEntity<List<GCSResponse>> listObjects() throws GCSException {
        return ResponseEntity.ok(gcsService.listObjects());
    }

    /**
     * GCSException 발생 시 예외를 처리하여 에러 메시지를 반환하는 핸들러
     * 
     * @param e 발생한 GCSException 객체
     * @return 에러 메시지를 포함한 ResponseEntity<String> 객체 반환
     */
    @ExceptionHandler(GCSException.class)
    public ResponseEntity<String> handleGCSException(GCSException e) {
        log.error("GCS operation failed", e); // 에러 발생 시 로그 기록
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
