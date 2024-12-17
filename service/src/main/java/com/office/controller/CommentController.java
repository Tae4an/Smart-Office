package com.office.controller;

import com.office.app.dto.CommentDTO;
import com.office.app.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "댓글 관리", description = "댓글 관리를 위한 API")
public class CommentController {
    private final CommentService commentService;

    @Operation(summary = "게시글별 댓글 조회", description = "특정 게시글의 모든 댓글을 조회합니다")
    @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = CommentDTO.class)))
    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPost(
            @Parameter(description = "게시글 ID") @PathVariable Long postId) {
        List<CommentDTO> comments = commentService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "댓글 생성", description = "새로운 댓글을 생성합니다")
    @ApiResponse(responseCode = "201", description = "댓글 생성 성공",
            content = @Content(schema = @Schema(implementation = CommentDTO.class)))
    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @Parameter(description = "댓글 정보") @RequestBody CommentDTO commentDTO,
            Authentication authentication) {
        String employeeId = authentication.getName();
        CommentDTO createdComment = commentService.createComment(commentDTO, employeeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @Operation(summary = "댓글 수정", description = "기존 댓글을 수정합니다")
    @ApiResponse(responseCode = "200", description = "댓글 수정 성공",
            content = @Content(schema = @Schema(implementation = CommentDTO.class)))
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @Parameter(description = "댓글 ID") @PathVariable Long commentId,
            @Parameter(description = "수정할 댓글 정보") @RequestBody CommentDTO commentDTO,
            Authentication authentication) {
        String employeeId = authentication.getName();
        CommentDTO updatedComment = commentService.updateComment(commentId, commentDTO, employeeId);
        return ResponseEntity.ok(updatedComment);
    }

    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다")
    @ApiResponse(responseCode = "200", description = "댓글 삭제 성공")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "댓글 ID") @PathVariable Long commentId,
            Authentication authentication) {
        String employeeId = authentication.getName();
        commentService.deleteComment(commentId, employeeId);
        return ResponseEntity.ok().build();
    }
}
