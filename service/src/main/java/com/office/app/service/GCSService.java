package com.office.app.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.storage.*;
import com.office.app.dto.GCSRequest;
import com.office.app.dto.GCSResponse;
import com.office.app.entity.FileInfo;
import com.office.app.entity.User;
import com.office.app.repository.FileInfoRepository;
import com.office.app.repository.UserRepository;
import com.office.app.validator.FileValidator;
import com.office.exception.GCSException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class GCSService {

    @Value("${spring.cloud.gcp.storage.bucket}")
    private String bucketName;

    @Value("${GOOGLE_APPLICATION_CREDENTIALS}")
    private String keyFileName;

    private Storage storage;

    // FileInfo 엔티티 관리를 위한 레포지토리 주입
    private final FileInfoRepository fileInfoRepository;
    // User 엔티티 조회를 위한 레포지토리 주입
    private final UserRepository userRepository;

    private final FileValidator fileValidator;

    /**
     * GCS 서비스 초기화 메서드
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
     * 파일 업로드 시:
     * 1. 사용자와 파일 유효성 검증
     * 2. GCS에 파일 업로드
     * 3. FileInfo 엔티티에 원본 파일명 포함하여 저장
     */
    public GCSResponse uploadObject(GCSRequest request, String employeeId, boolean isOCRUpload) throws GCSException {
        validateUploadRequest(request);
        fileValidator.validateFile(request.getFile(),isOCRUpload);

        try {
            User uploader = userRepository.findById(employeeId)
                    .orElseThrow(() -> new GCSException("User not found: " + employeeId));

            MultipartFile file = request.getFile();
            String originalFileName = file.getOriginalFilename();
            String storedFileName = generateUniqueFileName(originalFileName, isOCRUpload);

            // Content Type 설정 추가
            BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, storedFileName)
                    .setContentType(file.getContentType())
                    .setContentDisposition("inline; filename=\"" + originalFileName + "\"")
                    .build();

            // 파일 업로드
            Blob blob = storage.create(blobInfo, file.getInputStream());

            // Signed URL 생성
            URL signedUrl = blob.signUrl(15, TimeUnit.MINUTES,
                    Storage.SignUrlOption.withV4Signature(),
                    Storage.SignUrlOption.signWith(ServiceAccountCredentials.fromStream(
                            ResourceUtils.getURL(keyFileName).openStream()
                    ))
            );

            // FileInfo 저장
            FileInfo fileInfo = FileInfo.builder()
                    .originalFileName(originalFileName)
                    .storedFileName(storedFileName)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .downloadUrl(signedUrl.toString())
                    .uploadTime(LocalDateTime.now())
                    .uploader(uploader)
                    .build();

            FileInfo savedFileInfo = fileInfoRepository.save(fileInfo);

            return createGCSResponse(blob, savedFileInfo.getOriginalFileName());
        } catch (IOException e) {
            log.error("Failed to upload file: {}", request.getFile().getOriginalFilename(), e);
            throw new GCSException("Failed to upload file", e);
        }
    }
    /**
     * 파일 다운로드 시:
     * 1. FileInfo에서 employeeId와 일치하는 파일 정보 조회
     * 2. GCS에서 파일 정보 조회 및 Signed URL 생성
     * 3. 원본 파일명과 함께 다운로드 정보 응답
     *
     * @param fileName 저장된 파일명
     * @param employeeId 다운로드 요청한 사용자 ID
     * @throws GCSException 파일을 찾을 수 없거나 접근 권한이 없는 경우
     */
    public GCSResponse downloadObject(String fileName, String employeeId) throws GCSException {
        try {
            // 1. 파일 정보 조회 및 사용자 권한 확인
            FileInfo fileInfo = fileInfoRepository.findByStoredFileNameAndUploader_EmployeeId(fileName, employeeId)
                    .orElseThrow(() -> new GCSException("File not found or no permission: " + fileName));

            log.info("Downloading file: originalName={}, requester={}",
                    fileInfo.getOriginalFileName(), employeeId);

            // 2. GCS에서 파일 조회
            Blob blob = storage.get(bucketName, fileName);
            if (blob == null) {
                throw new GCSException("File not found in GCS: " + fileName);
            }

            // 3. Signed URL 생성 (15분 유효)
            URL signedUrl = blob.signUrl(15, TimeUnit.MINUTES,
                    Storage.SignUrlOption.withV4Signature(),
                    Storage.SignUrlOption.signWith(ServiceAccountCredentials.fromStream(
                            ResourceUtils.getURL(keyFileName).openStream()
                    ))
            );

            // 4. 다운로드 응답 생성
            GCSResponse response = GCSResponse.builder()
                    .fileName(blob.getName())
                    .originalFileName(fileInfo.getOriginalFileName())
                    .downloadUrl(signedUrl.toString())
                    .fileSize(blob.getSize())
                    .contentType(fileInfo.getContentType())
                    .uploadTime(Instant.ofEpochMilli(blob.getCreateTime()).toString())
                    .build();

            log.info("Download response generated: {}", response);
            return response;
        } catch (StorageException | IOException e) {
            log.error("Failed to download file: {}", fileName, e);
            throw new GCSException("Failed to download file", e);
        }
    }

    /**
     * 파일 삭제 시:
     * 1. FileInfo에서 employeeId와 일치하는 파일 정보 조회
     * 2. GCS에서 파일 삭제
     * 3. DB에서 파일 정보 삭제
     *
     * @param fileName 삭제할 파일명
     * @param employeeId 삭제 요청한 사용자 ID
     * @throws GCSException 파일을 찾을 수 없거나 접근 권한이 없는 경우
     */
    public void deleteObject(String fileName, String employeeId) throws GCSException {
        try {
            // 1. 파일 정보 조회 및 사용자 권한 확인
            FileInfo fileInfo = fileInfoRepository.findByStoredFileNameAndUploader_EmployeeId(fileName, employeeId)
                    .orElseThrow(() -> new GCSException("File not found or no permission: " + fileName));

            log.info("Deleting file: originalName={}, requester={}",
                    fileInfo.getOriginalFileName(), employeeId);

            // 2. GCS에서 파일 삭제
            boolean deleted = storage.delete(bucketName, fileName);
            if (!deleted) {
                throw new GCSException("File not found in GCS: " + fileName);
            }

            // 3. DB에서 파일 정보 삭제
            fileInfoRepository.delete(fileInfo);

            log.info("Successfully deleted file: originalName={}, storedName={}",
                    fileInfo.getOriginalFileName(), fileName);
        } catch (StorageException e) {
            log.error("Failed to delete file: {}", fileName, e);
            throw new GCSException("Failed to delete file", e);
        }
    }
    /**
     * 전체 파일 목록을 조회하는 메서드
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
     * 사용자별 파일 목록 조회 시:
     * 1. FileInfo에서 사용자의 파일 목록 조회
     * 2. 각 파일의 GCS 정보와 원본 파일명 조합하여 응답
     */
    public List<GCSResponse> listUserObjects(String employeeId) throws GCSException {
        try {
            List<FileInfo> userFiles = fileInfoRepository.findByUploader_EmployeeId(employeeId);
            List<GCSResponse> responses = new ArrayList<>();

            userFiles.forEach(fileInfo -> {
                Blob blob = storage.get(bucketName, fileInfo.getStoredFileName());
                if (blob != null) {
                    responses.add(createGCSResponse(blob, fileInfo.getOriginalFileName()));
                }
            });

            return responses;
        } catch (StorageException e) {
            log.error("Failed to list user objects", e);
            throw new GCSException("Failed to list user objects", e);
        }
    }

    // 기존 private 메서드들은 동일하게 유지
    private void validateUploadRequest(GCSRequest request) throws GCSException {
        if (request == null || request.getFile() == null) {
            throw new GCSException("Upload request or file cannot be null");
        }
        if (request.getFile().isEmpty()) {
            throw new GCSException("File cannot be empty");
        }
    }

    private String generateUniqueFileName(String originalFileName, boolean isOCRUpload) {
        String extension = StringUtils.getFilenameExtension(originalFileName);
        String uuid = UUID.randomUUID().toString();

        // OCR 업로드인 경우 img/ 폴더에 저장
        if (isOCRUpload) {
            return "img/" + uuid + (extension != null ? "." + extension : "");
        }
        return uuid + (extension != null ? "." + extension : "");
    }

    /**
     * GCS 응답 생성 시 원본 파일명을 포함
     */
    private GCSResponse createGCSResponse(Blob blob, String originalFileName) {
        return GCSResponse.builder()
                .fileName(blob.getName())
                .originalFileName(originalFileName)  // 원본 파일명 추가
                .downloadUrl(blob.getMediaLink())
                .fileSize(blob.getSize())
                .contentType(blob.getContentType())
                .uploadTime(Instant.ofEpochMilli(blob.getCreateTime()).toString())
                .build();
    }

    /**
     * 기존 createGCSResponse 메서드는 원본 파일명 없이 호출되는 경우를 위해 오버로딩
     */
    private GCSResponse createGCSResponse(Blob blob) {
        return createGCSResponse(blob, null);
    }
}