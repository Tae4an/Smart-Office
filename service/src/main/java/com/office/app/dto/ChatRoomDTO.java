package com.office.app.dto;

import com.office.app.entity.ChatRoom;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatRoomDTO {
    private Long id;
    private String roomName;
    private ChatRoom.RoomType type;
    private LocalDateTime createdAt;
    private int memberCount;
    private long unreadCount;
    private ChatMessageDTO lastMessage;

    public static ChatRoomDTO from(ChatRoom room) {
        return ChatRoomDTO.builder()
                .id(room.getId())
                .roomName(room.getRoomName())
                .type(room.getType())
                .createdAt(room.getCreatedAt())
                .build();
    }
}