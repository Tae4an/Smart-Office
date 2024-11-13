package com.office.app.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.*;
import com.office.app.dto.GCSRequest;
import com.office.app.dto.GCSResponse;
import com.office.exception.GCSException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// 로깅을 위한 Slf4j 로거 설정
@Slf4j
@Service
public class GCSService {

    // GCS 버킷 이름을 application 설정에서 주입
    @Value("${spring.cloud.gcp.storage.bucket}")
    private String bucketName;

    // GCS 인증 키 파일 위치를 application 설정에서 주입
    @Value("${GOOGLE_APPLICATION_CREDENTIALS}")
    private String keyFileName;

    private Storage storage;

    /**
     * GCS 서비스 초기화 메서드
     * 
     * @throws GCSException 초기화 실패 시 예외 발생
     */
    @PostConstruct
    public void init() throws GCSException {
        try {
            InputStream keyFile = ResourceUtils.getURL(keyFileName).openStream();
            storage = StorageOptions.newBuilder()
                    .setCredentials(GoogleCredentials.fromStream(keyFile))
                    .build()
                    .getService();
            log.info("GCS Service initialized successfully");
        } catch (IOException e) {
            log.error("Failed to initialize GCS Service", e);
            throw new GCSException("Failed to initialize GCS service", e);
        }
    }

    /**
     * 파일을 GCS에 업로드하는 메서드
     * 
     * @param request 업로드할 파일 정보를 담은 GCSRequest 객체
     * @return 업로드 결과를 담은 GCSResponse 객체
     * @throws GCSException 업로드 실패 시 예외 발생
     */
    public GCSResponse uploadObject(GCSRequest request) throws GCSException {
        validateUploadRequest(request);

        try {
            MultipartFile file = request.getFile();
            String fileName = generateUniqueFileName(file.getOriginalFilename());

            BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fileName)
                    .setContentType(file.getContentType())
                    .build();

            Blob blob = storage.create(blobInfo, file.getInputStream());

            return createGCSResponse(blob);
        } catch (IOException e) {
            log.error("Failed to upload file: {}", request.getFile().getOriginalFilename(), e);
            throw new GCSException("Failed to upload file", e);
        }
    }

    /**
     * GCS에서 파일을 다운로드하는 메서드
     * 
     * @param fileName 다운로드할 파일 이름
     * @return 다운로드한 파일 정보를 담은 GCSResponse 객체
     * @throws GCSException 다운로드 실패 시 예외 발생
     */
    public GCSResponse downloadObject(String fileName) throws GCSException {
        try {
            Blob blob = storage.get(bucketName, fileName);
            if (blob == null) {
                throw new GCSException("File not found: " + fileName);
            }
            return createGCSResponse(blob);
        } catch (StorageException e) {
            log.error("Failed to download file: {}", fileName, e);
            throw new GCSException("Failed to download file", e);
        } catch (GCSException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * GCS에서 파일을 삭제하는 메서드
     * 
     * @param fileName 삭제할 파일 이름
     * @throws GCSException 삭제 실패 시 예외 발생
     */
    public void deleteObject(String fileName) throws GCSException {
        try {
            boolean deleted = storage.delete(bucketName, fileName);
            if (!deleted) {
                throw new GCSException("File not found: " + fileName);
            }
            log.info("Successfully deleted file: {}", fileName);
        } catch (StorageException e) {
            log.error("Failed to delete file: {}", fileName, e);
            throw new GCSException("Failed to delete file", e);
        } catch (GCSException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * GCS에 저장된 파일 목록을 조회하는 메서드
     * 
     * @return 파일 목록을 담은 List<GCSResponse> 객체
     * @throws GCSException 파일 목록 조회 실패 시 예외 발생
     */
    public List<GCSResponse> listObjects() throws GCSException {
        try {
            List<GCSResponse> responses = new ArrayList<>();
            storage.list(bucketName).iterateAll()
                    .forEach(blob -> responses.add(createGCSResponse(blob)));
            return responses;
        } catch (StorageException e) {
            log.error("Failed to list objects", e);
            throw new GCSException("Failed to list objects", e);
        }
    }

    /**
     * 업로드 요청의 유효성을 검사하는 메서드
     * 
     * @param request 업로드할 파일 정보를 담은 GCSRequest 객체
     * @throws GCSException 유효하지 않은 요청 시 예외 발생
     */
    private void validateUploadRequest(GCSRequest request) throws GCSException {
        if (request == null || request.getFile() == null) {
            throw new GCSException("Upload request or file cannot be null");
        }
        if (request.getFile().isEmpty()) {
            throw new GCSException("File cannot be empty");
        }
    }

    /**
     * 고유한 파일 이름을 생성하는 메서드
     * 
     * @param originalFileName 원본 파일 이름
     * @return 고유한 이름으로 생성된 파일 이름
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = StringUtils.getFilenameExtension(originalFileName);
        return UUID.randomUUID().toString() + (extension != null ? "." + extension : "");
    }

    /**
     * Blob 객체로부터 GCSResponse 객체를 생성하는 메서드
     * 
     * @param blob GCS의 Blob 객체
     * @return 생성된 GCSResponse 객체
     */
    private GCSResponse createGCSResponse(Blob blob) {
        return GCSResponse.builder()
                .fileName(blob.getName())
                .downloadUrl(blob.getMediaLink())
                .fileSize(blob.getSize())
                .contentType(blob.getContentType())
                .uploadTime(Instant.ofEpochMilli(blob.getCreateTime()).toString())
                .build();
    }
}
