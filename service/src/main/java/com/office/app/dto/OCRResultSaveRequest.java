package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OCRResultSaveRequest {
    private String fileName;
    private String ocrText;
    private String analysisText;
    private Double confidence;
}