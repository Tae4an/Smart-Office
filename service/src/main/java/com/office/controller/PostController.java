package com.office.controller;

import com.office.app.dto.PageResponse;
import com.office.app.dto.PostAttachmentDownloadDTO;
import com.office.app.dto.PostDTO;
import com.office.app.entity.Post;
import com.office.app.entity.PostAttachment;
import com.office.app.service.PostAttachmentService;
import com.office.app.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "게시글 관리", description = "게시글 관리를 위한 API")
public class PostController {
    private final PostService postService;
    private final PostAttachmentService postAttachmentService;

    @Operation(summary = "게시판별 게시글 목록 조회", description = "특정 게시판의 게시글 목록을 조회합니다. 키워드 검색도 가능합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = PageResponse.class)))
    @ApiResponse(responseCode = "500", description = "서버 오류")
    @GetMapping("/{boardId}")
    public ResponseEntity<PageResponse<PostDTO>> getBoardPosts(
            @Parameter(description = "게시판 ID") @PathVariable Long boardId,
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "검색 키워드") @RequestParam(required = false) String keyword
    ) {
        try {
            PageResponse<PostDTO> response;
            if (keyword != null && !keyword.isEmpty()) {
                response = postService.searchPosts(boardId, keyword, page, size);
            } else {
                response = postService.getPostsByBoard(boardId, page, size);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            return new ResponseEntity<>(response, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching posts for board {}: {}", boardId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "새 게시글 작성", description = "새로운 게시글을 작성하고 첨부파일을 업로드합니다.")
    @ApiResponse(responseCode = "201", description = "게시글 생성 성공",
            content = @Content(schema = @Schema(implementation = PostDTO.class)))
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDTO> createPost(
            @Parameter(description = "게시글 정보") @RequestPart(value = "postData") PostDTO postDTO,
            @Parameter(description = "첨부 파일") @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();
        PostDTO createdPost = postService.createPost(postDTO, employeeId);

        if (attachments != null && !attachments.isEmpty()) {
            postAttachmentService.uploadPostAttachments(attachments, createdPost.getId(), employeeId);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @Operation(summary = "게시글 첨부파일 조회", description = "특정 게시글의 첨부파일 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = PostAttachment.class)))
    @GetMapping("/{postId}/attachments")
    public ResponseEntity<List<PostAttachment>> getPostAttachments(
            @Parameter(description = "게시글 ID") @PathVariable Long postId) {
        List<PostAttachment> attachments = postAttachmentService.getPostAttachments(postId);
        return ResponseEntity.ok(attachments);
    }

    @Operation(summary = "게시글 상세 조회", description = "특정 게시글의 상세 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = PostDTO.class)))
    @GetMapping("/detail/{postId}")
    public ResponseEntity<PostDTO> getPostDetail(
            @Parameter(description = "게시글 ID") @PathVariable Long postId) {
        PostDTO postDTO = postService.getPostById(postId);
        return ResponseEntity.ok(postDTO);
    }

    @Operation(summary = "게시글 수정", description = "기존 게시글을 수정합니다.")
    @ApiResponse(responseCode = "200", description = "수정 성공",
            content = @Content(schema = @Schema(implementation = PostDTO.class)))
    @PutMapping("/{postId}")
    public ResponseEntity<PostDTO> updatePost(
            @Parameter(description = "게시글 ID") @PathVariable Long postId,
            @Parameter(description = "수정할 게시글 정보") @RequestBody PostDTO postDTO,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();
        PostDTO updatedPost = postService.updatePost(postId, postDTO, employeeId);
        return ResponseEntity.ok(updatedPost);
    }

    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "삭제 성공")
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @Parameter(description = "게시글 ID") @PathVariable Long postId,
            Authentication authentication
    ) {
        String employeeId = authentication.getName();
        postService.deletePost(postId, employeeId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "첨부파일 다운로드", description = "게시글의 첨부파일을 다운로드합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "파일 다운로드 성공"),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{postId}/attachments/{fileId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @Parameter(description = "게시글 ID") @PathVariable Long postId,
            @Parameter(description = "파일 ID") @PathVariable Long fileId,
            Authentication authentication) throws FileNotFoundException {
        String employeeId = authentication.getName();

        PostAttachmentDownloadDTO downloadInfo =
                postAttachmentService.downloadAttachment(postId, fileId, employeeId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(downloadInfo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + URLEncoder.encode(downloadInfo.getOriginalFileName(), StandardCharsets.UTF_8) + "\"")
                .body(downloadInfo.getResource());
    }
}