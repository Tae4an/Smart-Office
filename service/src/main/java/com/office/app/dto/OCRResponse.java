package com.office.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class OCRResponse {
    private String status;
    private OCRResultData data;
    private String analysis;

    @Data
    public static class OCRResultData {
        private String apiVersion;
        private double confidence;
        private OCRMetadata metadata;
        private String mimeType;
        private String modelVersion;
        private int numBilledPages;
        private List<OCRPage> pages;
        private boolean stored;
        private String text;
    }

    @Data
    public static class OCRMetadata {
        private List<OCRPageMetadata> pages;
    }

    @Data
    public static class OCRPageMetadata {
        private int height;
        private int page;
        private int width;
    }

    @Data
    public static class OCRPage {
        private double confidence;
        private int height;
        private int id;
        private String text;
        private int width;
        private List<OCRWord> words;
    }

    @Data
    public static class OCRWord {
        private OCRBoundingBox boundingBox;
        private double confidence;
        private int id;
        private String text;
    }

    @Data
    public static class OCRBoundingBox {
        private List<OCRVertex> vertices;
    }

    @Data
    public static class OCRVertex {
        private int x;
        private int y;
    }
}