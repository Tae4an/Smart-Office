package com.office.app.service;

import com.office.app.dto.GCSRequest;
import com.office.app.dto.GCSResponse;
import com.office.app.dto.PostAttachmentDownloadDTO;
import com.office.app.entity.Post;
import com.office.app.entity.PostAttachment;
import com.office.app.repository.PostAttachmentRepository;
import com.office.app.repository.PostRepository;
import com.office.exception.GCSException;
import com.office.exception.PostNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostAttachmentService {
    private final GCSService gcsService;
    private final PostAttachmentRepository postAttachmentRepository;
    private final PostRepository postRepository;

    public List<PostAttachment> uploadPostAttachments(List<MultipartFile> files, Long postId, String employeeId)
            throws GCSException {
        // 게시글 존재 여부 확인
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("존재하지 않는 게시글입니다."));

        List<PostAttachment> attachments = new ArrayList<>();

        for (MultipartFile file : files) {
            // GCS에 파일 업로드
            GCSRequest gcsRequest = new GCSRequest();
            gcsRequest.setFile(file);

            GCSResponse gcsResponse = gcsService.uploadObject(gcsRequest, employeeId, false);

            // PostAttachment 엔티티 생성
            PostAttachment attachment = PostAttachment.builder()
                    .postId(postId)
                    .storedFileName(gcsResponse.getFileName())
                    .originalFileName(gcsResponse.getOriginalFileName())
                    .downloadUrl(gcsResponse.getDownloadUrl())
                    .fileSize(gcsResponse.getFileSize())
                    .contentType(gcsResponse.getContentType())
                    .build();

            attachments.add(postAttachmentRepository.save(attachment));
        }

        return attachments;
    }

    public PostAttachmentDownloadDTO downloadAttachment(Long postId, Long fileId, String employeeId)
            throws GCSException, FileNotFoundException {
        // 첨부파일 조회
        PostAttachment attachment = postAttachmentRepository.findByIdAndPostId(fileId, postId)
                .orElseThrow(() -> new FileNotFoundException("파일을 찾을 수 없습니다."));

        // GCS에서 파일 다운로드
        GCSResponse gcsResponse = gcsService.downloadObject(attachment.getStoredFileName(), employeeId);

        try {
            return PostAttachmentDownloadDTO.builder()
                    .resource(new UrlResource(new URL(gcsResponse.getDownloadUrl())))
                    .contentType(attachment.getContentType())
                    .originalFileName(attachment.getOriginalFileName())
                    .build();
        } catch (MalformedURLException e) {
            log.error("Invalid URL for file download", e);
            throw new GCSException("파일 다운로드 URL 생성 실패", e);
        }
    }

    public void deleteAttachment(Long postId, Long fileId, String employeeId) throws GCSException, FileNotFoundException {
        PostAttachment attachment = postAttachmentRepository.findByIdAndPostId(fileId, postId)
                .orElseThrow(() -> new FileNotFoundException("파일을 찾을 수 없습니다."));

        // GCS에서 파일 삭제
        gcsService.deleteObject(attachment.getStoredFileName(), employeeId);

        // DB에서 첨부파일 정보 삭제
        postAttachmentRepository.delete(attachment);
    }

    public List<PostAttachment> getPostAttachments(Long postId) {
        return postAttachmentRepository.findByPostId(postId);
    }
}