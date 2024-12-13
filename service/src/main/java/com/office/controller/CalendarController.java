package com.office.controller;

import com.office.app.dto.CalendarDTO;
import com.office.app.entity.Calendar;
import com.office.app.service.CalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar", description = "캘린더 이벤트 관리 API")
public class CalendarController {

    private final CalendarService service;

    @Operation(
            summary = "사용자 일정 조회",
            description = "로그인한 사용자의 모든 캘린더 일정을 조회합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "일정 조회 성공",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Calendar.class)))
    )
    @GetMapping
    public ResponseEntity<List<CalendarDTO>> getUserEvents(@RequestHeader("X-User-Id") String employeeId) {
        return ResponseEntity.ok(service.getUserEvents(employeeId).stream()
                .map(CalendarDTO::from)
                .collect(Collectors.toList()));
    }

    @Operation(
            summary = "일정 생성",
            description = "새로운 캘린더 일정을 생성합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "일정 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @PostMapping
    public ResponseEntity<CalendarDTO> createEvent(
            @RequestHeader("X-User-Id") String employeeId,
            @RequestBody CalendarDTO calendarDTO) {
        Calendar savedCalendar = service.createEvent(employeeId, calendarDTO);
        return ResponseEntity.ok(CalendarDTO.from(savedCalendar));
    }


    @Operation(
            summary = "일정 수정",
            description = "기존 캘린더 일정을 수정합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "일정 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "403", description = "수정 권한 없음"),
            @ApiResponse(responseCode = "404", description = "일정을 찾을 수 없음")
    })
    @PutMapping("/{id}")
    public ResponseEntity<CalendarDTO> updateEvent(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String employeeId,
            @RequestBody CalendarDTO calendarDTO) {
        Calendar updatedCalendar = service.updateEvent(id, employeeId, calendarDTO);
        return ResponseEntity.ok(CalendarDTO.from(updatedCalendar));
    }

    @Operation(
            summary = "일정 삭제",
            description = "특정 캘린더 일정을 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "일정 삭제 성공"),
            @ApiResponse(responseCode = "403", description = "삭제 권한 없음"),
            @ApiResponse(responseCode = "404", description = "일정을 찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @Parameter(description = "일정 ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "사용자 사번", required = true)
            @RequestHeader("X-User-Id") String employeeId) {
        service.deleteEvent(id, employeeId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "모든 일정 삭제",
            description = "사용자의 모든 캘린더 일정을 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "모든 일정 삭제 성공"),
            @ApiResponse(responseCode = "403", description = "삭제 권한 없음")
    })
    @DeleteMapping
    public ResponseEntity<Void> deleteAllEvents(
            @Parameter(description = "사용자 사번", required = true)
            @RequestHeader("X-User-Id") String employeeId) {
        service.deleteAllUserEvents(employeeId);
        return ResponseEntity.noContent().build();
    }
}