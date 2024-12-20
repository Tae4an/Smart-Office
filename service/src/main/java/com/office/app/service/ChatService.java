package com.office.app.service;

import com.office.app.dto.ChatMessageDTO;
import com.office.app.dto.ChatRoomDTO;
import com.office.app.entity.ChatMember;
import com.office.app.entity.ChatMessage;
import com.office.app.entity.ChatRoom;
import com.office.app.entity.User;
import com.office.app.repository.ChatMemberRepository;
import com.office.app.repository.ChatMessageRepository;
import com.office.app.repository.ChatRoomRepository;
import com.office.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.webjars.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    // 기존 방이 없을 때 새로운 방이 생성
    public ChatRoom getOrCreateIndividualRoom(String employeeId1, String employeeId2) {
        return chatRoomRepository
                .findIndividualRoom(employeeId1, employeeId2)
                .orElseGet(() -> createIndividualRoom(employeeId1, employeeId2));
    }

    private ChatRoom createIndividualRoom(String employeeId1, String employeeId2) {
        // 상대방 사용자 정보 조회
        User targetUser = userRepository.findById(employeeId2)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 채팅방 생성
        ChatRoom chatRoom = ChatRoom.builder()
                .type(ChatRoom.RoomType.INDIVIDUAL)
                .roomName(targetUser.getName())  // 상대방 이름을 방 이름으로 설정
                .isActive(true)
                .build();

        chatRoomRepository.save(chatRoom);

        // 두 사용자를 채팅방 멤버로 추가
        addMemberToRoom(chatRoom.getId(), employeeId1);
        addMemberToRoom(chatRoom.getId(), employeeId2);

        return chatRoom;
    }
    // 그룹 채팅방 생성
    @Transactional
    public ChatRoom createGroupRoom(String roomName, List<String> memberIds) {
        ChatRoom chatRoom = ChatRoom.builder()
                .type(ChatRoom.RoomType.GROUP)
                .roomName(roomName)
                .isActive(true)
                .build();

        chatRoomRepository.save(chatRoom);

        // 멤버 추가
        memberIds.forEach(memberId ->
                addMemberToRoom(chatRoom.getId(), memberId));

        // 시스템 메시지로 그룹 생성 기록
        saveMessage(
                chatRoom.getId(),
                memberIds.get(0), // 생성자
                "그룹이 생성되었습니다.",
                ChatMessage.MessageType.SYSTEM
        );

        return chatRoom;
    }
    // 채팅방 멤버 추가
    private ChatMember addMemberToRoom(Long roomId, String employeeId) {
        ChatMember chatMember = ChatMember.builder()
                .chatRoom(chatRoomRepository.findById(roomId)
                        .orElseThrow(() -> new NotFoundException("채팅방을 찾을 수 없습니다.")))
                .user(userRepository.findById(employeeId)
                        .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다.")))
                .joinedAt(LocalDateTime.now())
                .isActive(true)
                .build();

        return chatMemberRepository.save(chatMember);
    }

    // 메시지 저장
    public ChatMessage saveMessage(Long roomId, String senderId, String content,
                                   ChatMessage.MessageType messageType) {
        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoomRepository.findById(roomId)
                        .orElseThrow(() -> new NotFoundException("채팅방을 찾을 수 없습니다.")))
                .sender(userRepository.findById(senderId)
                        .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다.")))
                .content(content)
                .messageType(messageType)
                .build();

        return chatMessageRepository.save(message);
    }

    // 읽지 않은 메시지 수 조회
    public long getUnreadMessageCount(Long roomId, String employeeId) {
        ChatMember member = chatMemberRepository
                .findByChatRoomIdAndUserEmployeeId(roomId, employeeId)
                .orElseThrow(() -> new NotFoundException("채팅방 멤버를 찾을 수 없습니다."));

        return chatMessageRepository.countUnreadMessages(
                roomId, member.getLastReadTime(), employeeId);
    }
    // 사용자의 채팅방 목록 조회 메서드 추가
    public List<ChatRoom> getRoomsByEmployeeId(String employeeId) {
        return chatRoomRepository.findByEmployeeId(employeeId);
    }

    // 채팅방의 메시지 이력 조회 (페이징 처리)
    public Page<ChatMessage> getRoomMessages(Long roomId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(roomId, pageable);
    }

    // 메시지 읽음 처리
    public void markAsRead(Long roomId, String employeeId) {
        ChatMember member = chatMemberRepository
                .findByChatRoomIdAndUserEmployeeId(roomId, employeeId)
                .orElseThrow(() -> new NotFoundException("채팅방 멤버를 찾을 수 없습니다."));

        member.setLastReadTime(LocalDateTime.now());
        chatMemberRepository.save(member);
    }

    // 채팅방 정보 조회
    public ChatRoom getRoom(Long roomId) {
        return chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("채팅방을 찾을 수 없습니다."));
    }

    // 채팅방 멤버 목록 조회
    public List<ChatMember> getRoomMembers(Long roomId) {
        return chatMemberRepository.findByChatRoomIdAndIsActiveTrue(roomId);
    }

    // 채팅방 나가기
    public void leaveRoom(Long roomId, String employeeId) {
        ChatMember member = chatMemberRepository
                .findByChatRoomIdAndUserEmployeeId(roomId, employeeId)
                .orElseThrow(() -> new NotFoundException("채팅방 멤버를 찾을 수 없습니다."));

        member.setActive(false);
        member.setLeftAt(LocalDateTime.now());
        chatMemberRepository.save(member);

        // 그룹 채팅방의 경우 모든 멤버가 나갔는지 확인
        long activeMembers = chatMemberRepository.countActiveMembersByRoomId(roomId);
        if (activeMembers == 0) {
            ChatRoom room = getRoom(roomId);
            room.setActive(false);  // ChatRoom 엔티티에 active 필드 추가 필요
            chatRoomRepository.save(room);
        }
    }
    // ChatService에 추가
    public ChatRoomDTO getRoomWithDetails(ChatRoom room, String currentUserId) {
        ChatRoomDTO dto = ChatRoomDTO.from(room);

        // 멤버 수 설정
        dto.setMemberCount((int) chatMemberRepository.countActiveMembersByRoomId(room.getId()));

        // 읽지 않은 메시지 수 설정
        dto.setUnreadCount(getUnreadMessageCount(room.getId(), currentUserId));

        // 마지막 메시지 설정
        chatMessageRepository.findFirstByChatRoomIdOrderByCreatedAtDesc(room.getId())
                .ifPresent(message -> dto.setLastMessage(ChatMessageDTO.from(message)));

        return dto;
    }
}