package com.office.app.validator;

import com.office.exception.GCSException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
@Component
@Slf4j
public class FileValidator {
    @Value("${file.max-size:52428800}") // 50MB 기본값
    private long maxFileSize;

    @Value("#{'${file.allowed-types}'.split(',')}")
    private List<String> allowedTypes;

    private static final List<String> OCR_ALLOWED_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "application/pdf"
    );

    public void validateFile(MultipartFile file, boolean isOCRUpload) throws GCSException {
        log.info("Validating file: name={}, size={}, contentType={}, isOCR={}",
                file.getOriginalFilename(), file.getSize(), file.getContentType(), isOCRUpload);

        if (file.getSize() > maxFileSize) {
            String maxSizeMB = String.format("%.1f", maxFileSize / (1024.0 * 1024.0));
            throw new GCSException(String.format("파일 크기가 %sMB를 초과합니다.", maxSizeMB));
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new GCSException("파일 형식을 확인할 수 없습니다.");
        }

        if (isOCRUpload) {
            if (!OCR_ALLOWED_TYPES.contains(contentType)) {
                log.warn("Unsupported OCR file type: {}", contentType);
                throw new GCSException("OCR은 JPG, PNG, PDF 파일만 지원합니다.");
            }
        } else {
            // 기존 일반 파일 검증 로직
            List<String> trimmedTypes = allowedTypes.stream()
                    .map(String::trim)
                    .collect(Collectors.toList());

            if (!trimmedTypes.contains(contentType)) {
                log.warn("Unsupported file type: {}", contentType);
                log.debug("Allowed types: {}", trimmedTypes);
                throw new GCSException("지원하지 않는 파일 형식입니다. 지원되는 형식: " +
                        String.join(", ", trimmedTypes));
            }
        }
    }
}