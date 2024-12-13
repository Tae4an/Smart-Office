package com.office.app.dto;

import com.office.app.entity.Calendar;
import com.office.app.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarDTO {
    private Long id;
    private String employeeId;
    private String title;
    private LocalDateTime start;
    private LocalDateTime end;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Entity -> DTO 변환
    public static CalendarDTO from(Calendar entity) {
        return CalendarDTO.builder()
                .id(entity.getId())
                .employeeId(entity.getUser().getEmployeeId())
                .title(entity.getTitle())
                .start(entity.getStart())
                .end(entity.getEnd())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    // DTO -> Entity 변환
    public Calendar toEntity(User user) {
        Calendar calendar = new Calendar();
        calendar.setTitle(this.title);
        calendar.setStart(this.start);
        calendar.setEnd(this.end);
        calendar.setUser(user);
        return calendar;
    }
}