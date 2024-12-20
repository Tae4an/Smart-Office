package com.office.app.dto;

import com.office.app.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private MessageType type;           // 메시지 타입 (ENTER, CHAT, LEAVE, ERROR)
    private Long id;                    // 메시지 ID
    private Long roomId;                // 채팅방 ID
    private String senderId;            // 발신자 ID (employeeId)
    private String senderName;          // 발신자 이름
    private String content;             // 메시지 내용
    private LocalDateTime timestamp;    // 메시지 전송 시간
    private MessageStatus status;       // 메시지 상태 (전송중, 전송완료, 읽음)

    public enum MessageType {
        ENTER,  // 입장
        CHAT,   // 채팅
        LEAVE,  // 퇴장
        ERROR   // 에러
    }

    enum MessageStatus {
        SENDING,    // 전송 중
        SENT,       // 전송 완료
        READ        // 읽음
    }

    // Entity -> DTO 변환 메서드
    public static ChatMessageDTO from(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .roomId(message.getChatRoom().getId())
                .senderId(message.getSender().getEmployeeId())
                .senderName(message.getSender().getName())
                .content(message.getContent())
                .type(convertToMessageType(message.getMessageType()))
                .timestamp(message.getCreatedAt())
                .status(MessageStatus.SENT) // 기본값으로 SENT 설정
                .build();
    }

    // MessageType 변환 메서드
    public static MessageType convertToMessageType(ChatMessage.MessageType type) {
        if (Objects.requireNonNull(type) == ChatMessage.MessageType.SYSTEM) {
            return MessageType.ENTER;
        }
        return MessageType.CHAT;
    }
}