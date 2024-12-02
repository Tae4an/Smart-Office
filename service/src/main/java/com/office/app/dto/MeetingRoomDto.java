package com.office.app.dto;

import lombok.Data;
import lombok.Builder;
import com.office.app.domain.RoomStatus;
import java.time.LocalDateTime;

@Data
@Builder
public class MeetingRoomDto {
    private String roomId;
    private String roomName;
    private String description;
    private String hostId;
    private int maxParticipants;
    private LocalDateTime createdAt;
    private RoomStatus status;
    private int currentParticipants;
    private boolean hasPassword;
}
