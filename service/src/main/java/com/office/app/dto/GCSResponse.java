package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

/**
 * GCS 작업의 응답 정보를 담는 DTO 클래스
 */
@Data
@Builder
public class GCSResponse {
    private String fileName;  // 파일 이름
    private String downloadUrl;  // 파일 다운로드 URL
    private Long fileSize;  // 파일 크기 (바이트 단위)
    private String contentType;  // 파일 MIME 타입
    private String uploadTime;  // 파일 업로드 시간 (ISO 형식의 문자열)
}
