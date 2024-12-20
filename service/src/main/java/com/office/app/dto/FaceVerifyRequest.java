package com.office.app.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class FaceVerifyRequest {
    private MultipartFile file;      // 얼굴 이미지 파일
    private String employeeId;       // 직원 ID (헤더에서 추출)
}
