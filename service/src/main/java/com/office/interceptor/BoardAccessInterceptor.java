package com.office.interceptor;

import com.office.app.domain.CheckBoardAccess;
import com.office.app.domain.CheckPostOwnership;
import com.office.app.entity.Board;
import com.office.app.entity.Post;
import com.office.app.entity.User;
import com.office.app.repository.BoardRepository;
import com.office.app.repository.PostRepository;
import com.office.app.repository.UserRepository;
import com.office.exception.BoardAccessDeniedException;
import com.office.exception.BoardNotFoundException;
import com.office.exception.PostNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.HandlerMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

// 권한 체크 인터셉터
@Component
@RequiredArgsConstructor
public class BoardAccessInterceptor implements HandlerInterceptor {
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final PostRepository postRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {
        
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        
        // 부서 접근 권한 체크
        CheckBoardAccess boardAccessAnnotation =
            handlerMethod.getMethodAnnotation(CheckBoardAccess.class);
        if (boardAccessAnnotation != null) {
            return checkBoardAccess(request, boardAccessAnnotation);
        }

        // 게시글 소유권 체크
        CheckPostOwnership postOwnershipAnnotation =
            handlerMethod.getMethodAnnotation(CheckPostOwnership.class);
        if (postOwnershipAnnotation != null) {
            return checkPostOwnership(request, postOwnershipAnnotation);
        }

        return true;
    }

    private boolean checkBoardAccess(HttpServletRequest request, CheckBoardAccess annotation) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String employeeId = authentication.getName();
        
        User user = userRepository.findById(employeeId)
            .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        // 파라미터에서 boardId 추출
        String boardIdParam = request.getParameter(annotation.paramName());
        if (boardIdParam == null) {
            throw new BoardAccessDeniedException("게시판 ID가 필요합니다.");
        }

        Long boardId = Long.parseLong(boardIdParam);
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new BoardNotFoundException("존재하지 않는 게시판입니다."));

        // 부서 일치 여부 확인
        if (!board.getDepartmentCode().equals(user.getDepartment())) {
            throw new BoardAccessDeniedException("해당 게시판에 접근 권한이 없습니다.");
        }

        return true;
    }

    private boolean checkPostOwnership(HttpServletRequest request, CheckPostOwnership annotation) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String employeeId = authentication.getName();

        // 파라미터에서 postId 추출
        String postIdParam = request.getParameter(annotation.paramName());
        if (postIdParam == null) {
            throw new PostNotFoundException("게시글 ID가 필요합니다.");
        }

        Long postId = Long.parseLong(postIdParam);
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException("존재하지 않는 게시글입니다."));

        // 게시글 작성자와 현재 사용자 일치 여부 확인
        if (!post.getAuthorEmployeeId().equals(employeeId)) {
            throw new BoardAccessDeniedException("게시글 수정/삭제 권한이 없습니다.");
        }

        return true;
    }
}