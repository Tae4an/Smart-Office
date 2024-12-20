package com.office.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.office.app.dto.ChatMessageDTO;
import com.office.app.entity.ChatMessage;
import com.office.app.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;

import static com.office.app.dto.ChatMessageDTO.convertToMessageType;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final ChatService chatService;

    // roomId -> Set<WebSocketSession> 매핑
    private final Map<Long, Set<WebSocketSession>> chatRoomSessions = new ConcurrentHashMap<>();
    // employeeId -> WebSocketSession 매핑
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    // session -> roomId 매핑 (현재 세션이 어느 방에 있는지 추적)
    private final Map<WebSocketSession, Long> sessionRoomMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String employeeId = getEmployeeIdFromSession(session);
        String userName = getUserNameFromSession(session);

        if (employeeId != null && userName != null) {
            log.info("WebSocket 연결 성공 - employeeId: {}, userName: {}", employeeId, userName);
            userSessions.put(employeeId, session);
        } else {
            log.error("WebSocket 연결 실패 - 사용자 정보 없음");
            try {
                session.close();
            } catch (IOException e) {
                log.error("세션 종료 중 에러 발생", e);
            }
        }
    }



    private String getEmployeeIdFromSession(WebSocketSession session) {
        Map<String, Object> attributes = session.getAttributes();
        return (String) attributes.get("X-User-Id");
    }

    private String getUserNameFromSession(WebSocketSession session) {
        Map<String, Object> attributes = session.getAttributes();
        return (String) attributes.get("X-User-Name");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String employeeId = getEmployeeIdFromSession(session);
        if (employeeId != null) {
            userSessions.remove(employeeId);
            Long roomId = sessionRoomMap.remove(session);
            if (roomId != null) {
                chatRoomSessions.getOrDefault(roomId, Collections.newSetFromMap(new ConcurrentHashMap<>()))
                        .remove(session);
            }
        }
        log.info("WebSocket 연결 종료 - employeeId: {}", employeeId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        ChatMessageDTO chatMessageDTO = objectMapper.readValue(payload, ChatMessageDTO.class);

        try {
            switch (chatMessageDTO.getType()) {
                case ENTER:
                    handleEnterMessage(session, chatMessageDTO);
                    break;
                case CHAT:
                    handleChatMessage(session, chatMessageDTO);
                    break;
                case LEAVE:
                    handleLeaveMessage(session, chatMessageDTO);
                    break;
            }
        } catch (Exception e) {
            log.error("메시지 처리 중 오류 발생", e);
            sendErrorMessage(session, "메시지 처리 중 오류가 발생했습니다.");
        }
    }

    private void handleEnterMessage(WebSocketSession session, ChatMessageDTO message) throws IOException {
        Long roomId = message.getRoomId();
        log.debug("Entering room: {}, Session: {}", roomId, session.getId());

        // 이전 방에서 나가기
        Long previousRoomId = sessionRoomMap.get(session);
        if (previousRoomId != null) {
            Set<WebSocketSession> previousSessions = chatRoomSessions.get(previousRoomId);
            if (previousSessions != null) {
                previousSessions.remove(session);
            }
        }

        // 새로운 방에 입장
        chatRoomSessions.computeIfAbsent(roomId, k ->
                Collections.newSetFromMap(new ConcurrentHashMap<>())).add(session);
        sessionRoomMap.put(session, roomId);

        log.debug("Current room sessions: {}", chatRoomSessions);
        log.debug("Session room mapping: {}", sessionRoomMap);

        // 세션의 현재 방 정보 업데이트
        sessionRoomMap.put(session, roomId);

        // 입장 메시지 저장 및 브로드캐스트
        ChatMessage savedMessage = chatService.saveMessage(
                roomId,
                message.getSenderId(),
                message.getSenderName() + "님이 입장하셨습니다.",
                ChatMessage.MessageType.SYSTEM
        );

        // 입장 메시지는 모든 사용자에게 전송하도록 수정
        Set<WebSocketSession> sessions = chatRoomSessions.get(roomId);
        if (sessions != null) {
            String messageJson = objectMapper.writeValueAsString(convertToDTO(savedMessage));
            TextMessage textMessage = new TextMessage(messageJson);

            sessions.forEach(s -> {
                try {
                    s.sendMessage(textMessage);
                } catch (IOException e) {
                    log.error("메시지 전송 실패", e);
                }
            });
        }
    }

    private void handleChatMessage(WebSocketSession session, ChatMessageDTO message) throws IOException {
        Long roomId = message.getRoomId();
        if (roomId == null) {
            sendErrorMessage(session, "채팅방 ID가 없습니다.");
            return;
        }

        // 메시지 발신자의 현재 방 ID와 메시지의 방 ID가 일치하는지 확인
        Long currentRoomId = sessionRoomMap.get(session);
        if (currentRoomId == null || !currentRoomId.equals(roomId)) {
            sendErrorMessage(session, "현재 채팅방에서만 메시지를 보낼 수 있습니다.");
            return;
        }

        ChatMessage savedMessage = chatService.saveMessage(
                roomId,
                message.getSenderId(),
                message.getContent(),
                ChatMessage.MessageType.TEXT
        );

        broadcastMessage(roomId, convertToDTO(savedMessage));
    }

    private void handleLeaveMessage(WebSocketSession session, ChatMessageDTO message) throws IOException {
        Long roomId = message.getRoomId();
        chatRoomSessions.getOrDefault(roomId, Collections.newSetFromMap(new ConcurrentHashMap<>())).remove(session);
        sessionRoomMap.remove(session);

        ChatMessage savedMessage = chatService.saveMessage(
                roomId,
                message.getSenderId(),
                message.getSenderName() + "님이 퇴장하셨습니다.",
                ChatMessage.MessageType.SYSTEM
        );

        broadcastMessage(roomId, convertToDTO(savedMessage));
    }

    private void broadcastMessage(Long roomId, ChatMessageDTO message) throws IOException {
        Set<WebSocketSession> sessions = chatRoomSessions.get(roomId);
        log.debug("Broadcasting to room: {}, Sessions: {}", roomId, sessions);

        if (sessions != null && !sessions.isEmpty()) {
            String messageJson = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(messageJson);

            for (WebSocketSession session : sessions) {
                try {
                    String sessionEmployeeId = getEmployeeIdFromSession(session);
                    // 세션이 유효한지 확인
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                        log.debug("Message sent to session: {}", sessionEmployeeId);
                    } else {
                        log.debug("Session closed, removing: {}", sessionEmployeeId);
                        sessions.remove(session);
                    }
                } catch (IOException e) {
                    log.error("메시지 전송 실패. Session: {}", session.getId(), e);
                }
            }
        } else {
            log.warn("No sessions found for room: {}", roomId);
        }
    }
    private void sendErrorMessage(WebSocketSession session, String errorMessage) throws IOException {
        ChatMessageDTO errorDTO = ChatMessageDTO.builder()
                .type(ChatMessageDTO.MessageType.ERROR)
                .content(errorMessage)
                .build();

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(errorDTO)));
    }


    private ChatMessageDTO convertToDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .roomId(message.getChatRoom().getId())
                .senderId(message.getSender().getEmployeeId())
                .senderName(message.getSender().getName())
                .content(message.getContent())
                .type(convertToMessageType(message.getMessageType()))
                .timestamp(message.getCreatedAt())
                .build();
    }


}