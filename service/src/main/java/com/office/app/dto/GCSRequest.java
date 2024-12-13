package com.office.app.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * GCS 파일 업로드 요청을 위한 DTO 클래스
 */
@Data
public class GCSRequest {
    private String name;  // 업로드할 파일의 이름
    private MultipartFile file;   // 업로드할 파일 데이터를 담은 MultipartFile 객체
    private boolean isOCRUpload;
}
