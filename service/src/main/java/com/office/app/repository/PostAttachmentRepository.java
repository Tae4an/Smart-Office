package com.office.app.repository;

import com.office.app.entity.PostAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostAttachmentRepository extends JpaRepository<PostAttachment, Long> {
    List<PostAttachment> findByPostId(Long postId);

    // 특정 게시글의 특정 첨부파일 조회
    Optional<PostAttachment> findByIdAndPostId(Long id, Long postId);

    // 특정 게시글의 모든 첨부파일 삭제
    void deleteByPostId(Long postId);

    // 특정 파일명으로 첨부파일 조회
    Optional<PostAttachment> findByStoredFileName(String storedFileName);

    // 특정 게시글의 첨부파일 수 조회
    long countByPostId(Long postId);
}