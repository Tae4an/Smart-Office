package com.office.app.dto;

import com.office.app.entity.ChatMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMemberDTO {
    private Long id;
    private String employeeId;    // 사용자 ID
    private String name;          // 사용자 이름
    private String department;    // 부서
    private String position;      // 직급
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private boolean isActive;

    public static ChatMemberDTO from(ChatMember member) {
        return ChatMemberDTO.builder()
                .id(member.getId())
                .employeeId(member.getUser().getEmployeeId())
                .name(member.getUser().getName())
                .department(member.getUser().getDepartment())
                .position(member.getUser().getPosition())
                .joinedAt(member.getJoinedAt())
                .leftAt(member.getLeftAt())
                .isActive(member.isActive())
                .build();
    }
}