package com.office.app.service;

import com.office.app.domain.RequireAdminAccess;
import com.office.app.domain.RequireDepartmentManagerAccess;
import com.office.app.dto.BoardDTO;
import com.office.app.entity.Board;
import com.office.app.entity.User;
import com.office.app.repository.BoardRepository;
import com.office.app.repository.UserRepository;
import com.office.exception.BoardAccessDeniedException;
import com.office.exception.BoardNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    // 특정 부서의 게시판 목록 조회
    public List<BoardDTO> getBoardsByDepartment(String departmentCode) {
        List<Board> boards = boardRepository.findByDepartmentCode(departmentCode);
        return boards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 게시판 생성 (관리자 전용)
    @RequireDepartmentManagerAccess(departmentCode = "#departmentCode")
    public BoardDTO createBoard(BoardDTO boardDTO, String adminEmployeeId) {
        // 관리자 여부 확인 로직 추가 필요
        User admin = userRepository.findById(adminEmployeeId)
                .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        // 관리자 권한 체크 로직 추가 (예: 관리자 역할 확인)
        if (!isAdminUser(admin)) {
            throw new BoardAccessDeniedException("게시판 생성 권한이 없습니다.");
        }

        Board board = Board.builder()
                .name(boardDTO.getName())
                .departmentCode(boardDTO.getDepartmentCode())
                .description(boardDTO.getDescription())
                .isActive(true)
                .build();

        Board savedBoard = boardRepository.save(board);
        return convertToDTO(savedBoard);
    }

    // 게시판 정보 수정
    @RequireAdminAccess
    public BoardDTO updateBoard(Long boardId, BoardDTO boardDTO, String adminEmployeeId) {
        Board existingBoard = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("존재하지 않는 게시판입니다."));

        User admin = userRepository.findById(adminEmployeeId)
                .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        // 관리자 권한 및 부서 일치 확인
        if (!isAdminUser(admin) || !existingBoard.getDepartmentCode().equals(admin.getDepartment())) {
            throw new BoardAccessDeniedException("게시판 수정 권한이 없습니다.");
        }

        existingBoard.setName(boardDTO.getName());
        existingBoard.setDescription(boardDTO.getDescription());
        existingBoard.setActive(boardDTO.isActive());

        Board updatedBoard = boardRepository.save(existingBoard);
        return convertToDTO(updatedBoard);
    }

    // 게시판 삭제
    @RequireAdminAccess
    public void deleteBoard(Long boardId, String adminEmployeeId) {
        Board existingBoard = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("존재하지 않는 게시판입니다."));

        User admin = userRepository.findById(adminEmployeeId)
                .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        // 관리자 권한 및 부서 일치 확인
        if (!isAdminUser(admin) || !existingBoard.getDepartmentCode().equals(admin.getDepartment())) {
            throw new BoardAccessDeniedException("게시판 삭제 권한이 없습니다.");
        }

        boardRepository.delete(existingBoard);
    }

    // 관리자 여부 확인 메서드 (구체적인 로직은 시스템 요구사항에 맞게 구현)
    private boolean isAdminUser(User user) {
        // 예: 관리자 역할 확인 로직
        return "ADMIN".equals(user.getPosition()) || "MANAGER".equals(user.getPosition());
    }

    // DTO 변환 메서드
    private BoardDTO convertToDTO(Board board) {
        return BoardDTO.builder()
                .id(board.getId())
                .name(board.getName())
                .departmentCode(board.getDepartmentCode())
                .description(board.getDescription())
                .createdAt(board.getCreatedAt())
                .isActive(board.isActive())
                .build();
    }

    public boolean checkDepartmentAccess(String employeeId, String departmentCode) {
        // 1. 사용자 조회
        User user = userRepository.findById(employeeId)
                .orElseThrow(() -> new BoardAccessDeniedException("유효하지 않은 사용자입니다."));

        // 2. 부서 일치 여부 확인
        // 관리자의 경우 모든 부서 접근 가능
        if (user.getRole() == User.UserRole.ADMIN ||
                user.getRole() == User.UserRole.SUPER_ADMIN) {
            return true;
        }

        // 일반 사용자는 자신의 부서 게시판만 접근 가능
        return user.getDepartment().equals(departmentCode);
    }
    public List<BoardDTO> getAllBoards() {
        List<Board> boards = boardRepository.findAll();
        return boards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}