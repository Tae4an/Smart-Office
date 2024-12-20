package com.office.controller;

import com.office.app.dto.*;
import com.office.app.entity.ChatMember;
import com.office.app.entity.ChatMessage;
import com.office.app.entity.ChatRoom;
import com.office.app.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomDTO> getRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ChatRoom room = chatService.getRoom(roomId);
        ChatRoomDTO roomDTO = chatService.getRoomWithDetails(room, userDetails.getUsername());
        return ResponseEntity.ok(roomDTO);
    }
    // 채팅방 목록 조회
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getRooms(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ChatRoom> rooms = chatService.getRoomsByEmployeeId(userDetails.getUsername());
        List<ChatRoomDTO> roomDTOs = rooms.stream()
                .map(room -> chatService.getRoomWithDetails(room, userDetails.getUsername()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(roomDTOs);
    }

    // 1:1 채팅방 생성
    @PostMapping("/rooms/individual")
    public ResponseEntity<ChatRoomDTO> createIndividualRoom(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String targetEmployeeId) {
        ChatRoom room = chatService.getOrCreateIndividualRoom(
                userDetails.getUsername(),
                targetEmployeeId
        );
        return ResponseEntity.ok(ChatRoomDTO.from(room));
    }

    // 그룹 채팅방 생성
    @PostMapping("/rooms/group")
    public ResponseEntity<ChatRoomDTO> createGroupRoom(
            @RequestBody CreateGroupRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        request.getMembers().add(userDetails.getUsername()); // 생성자도 멤버에 추가
        ChatRoom room = chatService.createGroupRoom(request.getRoomName(), request.getMembers());
        return ResponseEntity.ok(ChatRoomDTO.from(room));
    }

    // 채팅방 메시지 이력 조회
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<ChatMessageDTO>> getRoomMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<ChatMessage> messages = chatService.getRoomMessages(roomId, page, size);
        return ResponseEntity.ok(messages.map(ChatMessageDTO::from));
    }

    // 메시지 읽음 처리
    @PostMapping("/rooms/{roomId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        chatService.markAsRead(roomId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    // 채팅방 나가기
    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        chatService.leaveRoom(roomId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    // 채팅방 멤버 조회
    @GetMapping("/rooms/{roomId}/members")
    public ResponseEntity<List<ChatMemberDTO>> getRoomMembers(@PathVariable Long roomId) {
        List<ChatMember> members = chatService.getRoomMembers(roomId);
        List<ChatMemberDTO> memberDTOs = members.stream()
                .map(ChatMemberDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(memberDTOs);
    }
}