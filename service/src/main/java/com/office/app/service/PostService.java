package com.office.app.service;

import com.office.app.dto.PageResponse;
import com.office.app.dto.PostDTO;
import com.office.app.entity.Board;
import com.office.app.entity.Post;
import com.office.app.entity.User;
import com.office.app.repository.BoardRepository;
import com.office.app.repository.PostRepository;
import com.office.app.repository.UserRepository;
import com.office.exception.BoardAccessDeniedException;
import com.office.exception.BoardNotFoundException;
import com.office.exception.PostNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;

    public PageResponse<PostDTO> getPostsByBoard(Long boardId, int page, int size) {
        log.debug("Fetching posts for board {} with page {} and size {}", boardId, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findByBoardIdOrderByCreatedAtDesc(boardId, pageable);

        log.debug("Found {} posts out of {} total",
                postPage.getNumberOfElements(), postPage.getTotalElements());

        List<PostDTO> postDTOs = postPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        PageResponse<PostDTO> response = new PageResponse<>(
                postDTOs,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalPages(),
                postPage.getTotalElements()
        );

        log.debug("Returning page response with {} items", response.getContent().size());

        return response;
    }

    public PostDTO createPost(PostDTO postDTO, String employeeId) {
        // 게시글 작성 권한 및 부서 체크 로직
        User user = userRepository.findById(employeeId)
                .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        Board board = boardRepository.findById(postDTO.getBoardId())
                .orElseThrow(() -> new BoardNotFoundException("존재하지 않는 게시판입니다."));

//        // 사용자의 부서와 게시판의 부서 코드 일치 여부 확인
//        if (!board.getDepartmentCode().equals(user.getDepartment())) {
//            throw new BoardAccessDeniedException("해당 게시판에 글을 작성할 권한이 없습니다.");
//        }

        // DTO를 엔티티로 변환
        Post post = Post.builder()
                .title(postDTO.getTitle())
                .content(postDTO.getContent())
                .boardId(postDTO.getBoardId())
                .build();

        post.setAuthorEmployeeId(employeeId);
        Post savedPost = postRepository.save(post);

        // 저장된 엔티티를 다시 DTO로 변환
        return PostDTO.builder()
                .id(savedPost.getId())
                .title(savedPost.getTitle())
                .content(savedPost.getContent())
                .boardId(savedPost.getBoardId())
                .authorEmployeeId(savedPost.getAuthorEmployeeId())
                .createdAt(savedPost.getCreatedAt())
                .updatedAt(savedPost.getUpdatedAt())
                .build();
    }


    public PageResponse<PostDTO> searchPosts(Long boardId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.searchPosts(boardId, keyword, pageable);

        List<PostDTO> postDTOs = postPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                postDTOs,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalPages(),
                postPage.getTotalElements()
        );
    }

    // 게시글 상세 조회
    @Cacheable(value = "postCache", key = "#postId")
    public PostDTO getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("존재하지 않는 게시글입니다."));

        return PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .boardId(post.getBoardId())
                .authorEmployeeId(post.getAuthorEmployeeId())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    // 게시글 수정
    @CacheEvict(value = "postCache", key = "#postId")
    public PostDTO updatePost(Long postId, PostDTO postDTO, String employeeId) {
        // 게시글 존재 및 작성자 확인
        Post existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("존재하지 않는 게시글입니다."));

        // 작성자 일치 여부 확인
        if (!existingPost.getAuthorEmployeeId().equals(employeeId)) {
            throw new BoardAccessDeniedException("게시글 수정 권한이 없습니다.");
        }

        // 게시글 정보 업데이트
        existingPost.setTitle(postDTO.getTitle());
        existingPost.setContent(postDTO.getContent());

        Post updatedPost = postRepository.save(existingPost);

        return PostDTO.builder()
                .id(updatedPost.getId())
                .title(updatedPost.getTitle())
                .content(updatedPost.getContent())
                .boardId(updatedPost.getBoardId())
                .authorEmployeeId(updatedPost.getAuthorEmployeeId())
                .createdAt(updatedPost.getCreatedAt())
                .updatedAt(updatedPost.getUpdatedAt())
                .build();
    }

    // 게시글 삭제
    public void deletePost(Long postId, String employeeId) {
        // 게시글 존재 및 작성자 확인
        Post existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("존재하지 않는 게시글입니다."));

        // 작성자 일치 여부 확인
        if (!existingPost.getAuthorEmployeeId().equals(employeeId)) {
            throw new BoardAccessDeniedException("게시글 삭제 권한이 없습니다.");
        }

        // 게시글 삭제
        postRepository.delete(existingPost);
    }

    private PostDTO convertToDTO(Post post) {
        User author = userRepository.findById(post.getAuthorEmployeeId())
                .orElse(null);
        log.info("Post:{}",post);
        return PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .boardId(post.getBoardId())
                .authorEmployeeId(post.getAuthorEmployeeId())
                .authorName(author != null ? author.getName() : "Unknown User")
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}