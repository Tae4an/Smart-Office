package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OCRResultResponse {
    private String status;
    private String message;
    private OCRResultDTO data;
}