package com.office.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OCRResultDTO {
    private Long id;
    private String fileName;
    private String originalFileName;
    private Boolean hasOCR;
    private Boolean hasAnalysis;
    private Double confidence;
    private String ocrText;
    private String analysisText;
    private LocalDateTime createdAt;
    private String userId;      // employeeId
    private String userName;    // 사용자 이름
    private String department;  // 부서
}