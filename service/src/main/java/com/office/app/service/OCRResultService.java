package com.office.app.service;

import com.office.app.dto.OCRResultDTO;
import com.office.app.dto.OCRResultDownload;
import com.office.app.dto.OCRResultSaveRequest;
import com.office.app.entity.OCRResult;
import com.office.app.entity.User;
import com.office.app.repository.OCRResultRepository;
import com.office.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OCRResultService {
    private final OCRResultRepository ocrResultRepository;
    private final UserRepository userRepository;

    public OCRResultDTO saveResult(OCRResultSaveRequest request, String employeeId) {
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + employeeId));

        OCRResult ocrResult = OCRResult.builder()
                .fileName(request.getFileName())
                .originalFileName(request.getFileName())
                .hasOCR(request.getOcrText() != null)
                .hasAnalysis(request.getAnalysisText() != null)
                .confidence(request.getConfidence())
                .ocrText(request.getOcrText())
                .analysisText(request.getAnalysisText())
                .user(user)
                .build();

        OCRResult savedResult = ocrResultRepository.save(ocrResult);
        return convertToDTO(savedResult);
    }

    public List<OCRResultDTO> getUserResults(String employeeId) {
        return ocrResultRepository.findByUser_EmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    @Transactional
    public void deleteResult(Long id, String employeeId) {
        if (!ocrResultRepository.existsByIdAndUser_EmployeeId(id, employeeId)) {
            throw new IllegalArgumentException("OCR result not found or unauthorized");
        }
        ocrResultRepository.deleteByIdAndUser_EmployeeId(id, employeeId);
        log.info("Deleted OCR result id: {}, employeeId: {}", id, employeeId);
    }

    public OCRResultDownload getResultForDownload(Long id, String employeeId) {
        OCRResult result = ocrResultRepository.findByIdAndUser_EmployeeId(id, employeeId)
                .orElseThrow(() -> new IllegalArgumentException("OCR result not found or unauthorized"));

        StringBuilder content = new StringBuilder();
        if (result.getHasOCR()) {
            content.append("=== OCR 텍스트 추출 결과 ===\n")
                    .append("파일명: ").append(result.getOriginalFileName()).append("\n")
                    .append("추출 시간: ").append(result.getCreatedAt()).append("\n")
                    .append("신뢰도: ").append(String.format("%.2f%%", result.getConfidence() * 100)).append("\n\n")
                    .append(result.getOcrText()).append("\n\n");
        }
        if (result.getHasAnalysis()) {
            content.append("=== AI 문서 분석 결과 ===\n")
                    .append("분석 시간: ").append(result.getCreatedAt()).append("\n\n")
                    .append(result.getAnalysisText());
        }

        String fileName = String.format("%s_%s_result.txt",
                result.getOriginalFileName().replaceFirst("[.][^.]+$", ""),
                result.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        return OCRResultDownload.builder()
                .fileName(fileName)
                .content(content.toString())
                .build();
    }
    public OCRResultDTO getResult(Long id, String employeeId) {
        OCRResult result = ocrResultRepository.findByIdAndUser_EmployeeId(id, employeeId)
                .orElseThrow(() -> new IllegalArgumentException("OCR result not found or unauthorized"));

        return convertToDTO(result);
    }

    private OCRResultDTO convertToDTO(OCRResult entity) {
        return OCRResultDTO.builder()
                .id(entity.getId())
                .fileName(entity.getFileName())
                .originalFileName(entity.getOriginalFileName())
                .hasOCR(entity.getHasOCR())
                .hasAnalysis(entity.getHasAnalysis())
                .confidence(entity.getConfidence())
                .ocrText(entity.getOcrText())
                .analysisText(entity.getAnalysisText())
                .createdAt(entity.getCreatedAt())
                .userId(entity.getUser().getEmployeeId())
                .userName(entity.getUser().getName())        // 사용자 이름 추가
                .department(entity.getUser().getDepartment()) // 부서 정보 추가
                .build();
    }
}