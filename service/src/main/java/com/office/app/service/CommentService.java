package com.office.app.service;

import com.office.app.domain.RequireDepartmentManagerAccess;
import com.office.app.dto.CommentDTO;
import com.office.app.entity.Comment;
import com.office.app.entity.User;
import com.office.app.repository.CommentRepository;
import com.office.app.repository.PostRepository;
import com.office.app.repository.UserRepository;
import com.office.exception.BoardAccessDeniedException;
import com.office.exception.CommentNotFoundException;
import com.office.exception.PostNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    // 특정 게시글의 댓글 조회
    public List<CommentDTO> getCommentsByPost(Long postId) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
        return comments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 댓글 생성
    public CommentDTO createComment(CommentDTO commentDTO, String employeeId) {
        // 게시글 존재 여부 확인
        postRepository.findById(commentDTO.getPostId())
                .orElseThrow(() -> new PostNotFoundException("존재하지 않는 게시글입니다."));

        // 사용자 존재 여부 확인
        userRepository.findById(employeeId)
                .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        Comment comment = Comment.builder()
                .postId(commentDTO.getPostId())
                .authorEmployeeId(employeeId)
                .content(commentDTO.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }

    // 댓글 수정
    public CommentDTO updateComment(Long commentId, CommentDTO commentDTO, String employeeId) {
        Comment existingComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("존재하지 않는 댓글입니다."));

        // 댓글 작성자 확인
        if (!existingComment.getAuthorEmployeeId().equals(employeeId)) {
            throw new BoardAccessDeniedException("댓글 수정 권한이 없습니다.");
        }

        existingComment.setContent(commentDTO.getContent());
        Comment updatedComment = commentRepository.save(existingComment);
        return convertToDTO(updatedComment);
    }

    // 댓글 삭제
    @RequireDepartmentManagerAccess
    public void deleteComment(Long commentId, String employeeId) {
        Comment existingComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("존재하지 않는 댓글입니다."));

        // 댓글 작성자 확인
        if (!existingComment.getAuthorEmployeeId().equals(employeeId)) {
            throw new BoardAccessDeniedException("댓글 삭제 권한이 없습니다.");
        }

        commentRepository.delete(existingComment);
    }

    // DTO 변환 메서드
    private CommentDTO convertToDTO(Comment comment) {
        User author = userRepository.findById(comment.getAuthorEmployeeId())
                .orElse(null);
        return CommentDTO.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .authorEmployeeId(comment.getAuthorEmployeeId())
                .authorName(author != null ? author.getName() : "Unknown User")
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}