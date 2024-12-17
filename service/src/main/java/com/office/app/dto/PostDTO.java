package com.office.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String authorEmployeeId;
    private String authorName;
    private Long boardId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}