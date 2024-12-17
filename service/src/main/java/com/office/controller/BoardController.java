package com.office.controller;

import com.office.app.dto.BoardDTO;
import com.office.app.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@Tag(name = "게시판 관리", description = "게시판 관리를 위한 API")
public class BoardController {
    private final BoardService boardService;

    @Operation(summary = "부서별 게시판 목록 조회", description = "특정 부서의 게시판 목록을 조회합니다")
    @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = BoardDTO.class)))
    @GetMapping("/department/{departmentCode}")
    public ResponseEntity<List<BoardDTO>> getBoardsByDepartment(
            @Parameter(description = "부서 코드") @PathVariable String departmentCode) {
        List<BoardDTO> boards = boardService.getBoardsByDepartment(departmentCode);
        return ResponseEntity.ok(boards);
    }

    @Operation(summary = "새 게시판 생성", description = "새로운 게시판을 생성합니다 (관리자 전용)")
    @ApiResponse(responseCode = "201", description = "게시판 생성 성공",
            content = @Content(schema = @Schema(implementation = BoardDTO.class)))
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardDTO> createBoard(
            @Parameter(description = "게시판 상세 정보") @RequestBody BoardDTO boardDTO,
            Authentication authentication) {
        String adminEmployeeId = authentication.getName();
        BoardDTO createdBoard = boardService.createBoard(boardDTO, adminEmployeeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
    }

    @Operation(summary = "게시판 수정", description = "기존 게시판을 수정합니다 (관리자 전용)")
    @ApiResponse(responseCode = "200", description = "게시판 수정 성공",
            content = @Content(schema = @Schema(implementation = BoardDTO.class)))
    @PutMapping("/{boardId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardDTO> updateBoard(
            @Parameter(description = "게시판 ID") @PathVariable Long boardId,
            @Parameter(description = "수정할 게시판 정보") @RequestBody BoardDTO boardDTO,
            Authentication authentication) {
        String adminEmployeeId = authentication.getName();
        BoardDTO updatedBoard = boardService.updateBoard(boardId, boardDTO, adminEmployeeId);
        return ResponseEntity.ok(updatedBoard);
    }

    @Operation(summary = "게시판 삭제", description = "게시판을 삭제합니다 (관리자 전용)")
    @ApiResponse(responseCode = "200", description = "게시판 삭제 성공")
    @DeleteMapping("/{boardId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBoard(
            @Parameter(description = "게시판 ID") @PathVariable Long boardId,
            Authentication authentication) {
        String adminEmployeeId = authentication.getName();
        boardService.deleteBoard(boardId, adminEmployeeId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "게시판 접근 권한 확인", description = "사용자가 특정 부서의 게시판에 접근 권한이 있는지 확인합니다")
    @ApiResponse(responseCode = "200", description = "접근 권한 확인 완료",
            content = @Content(schema = @Schema(implementation = Map.class)))
    @GetMapping("/access")
    public ResponseEntity<Map<String, Boolean>> checkBoardAccess(
            @Parameter(description = "부서") @RequestParam String department,
            Authentication authentication) {
        String employeeId = authentication.getName();
        boolean canAccess = boardService.checkDepartmentAccess(employeeId, department);
        Map<String, Boolean> response = new HashMap<>();
        response.put("canAccess", canAccess);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "모든 게시판 조회", description = "모든 게시판 목록을 조회합니다")
    @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = BoardDTO.class)))
    @GetMapping("/all")
    public ResponseEntity<List<BoardDTO>> getAllBoards() {
        List<BoardDTO> boards = boardService.getAllBoards();
        return ResponseEntity.ok(boards);
    }
}
