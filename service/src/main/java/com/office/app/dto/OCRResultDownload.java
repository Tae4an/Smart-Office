package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OCRResultDownload {
    private String fileName;
    private String content;
}