package com.office.app.repository;

import com.office.app.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // 채팅방의 메시지 목록 조회 (페이징)
    Page<ChatMessage> findByChatRoomIdOrderByCreatedAtDesc(Long roomId, Pageable pageable);
    
    // 특정 시점 이후의 메시지 조회
    List<ChatMessage> findByChatRoomIdAndCreatedAtAfterOrderByCreatedAtAsc(
        Long roomId, LocalDateTime after);

    Optional<ChatMessage> findFirstByChatRoomIdOrderByCreatedAtDesc(Long roomId);

    // 읽지 않은 메시지 수 조회
    @Query("SELECT COUNT(cm) FROM ChatMessage cm " +
           "WHERE cm.chatRoom.id = :roomId " +
           "AND cm.createdAt > :lastReadTime " +
           "AND cm.sender.employeeId != :employeeId")
    long countUnreadMessages(@Param("roomId") Long roomId,
                           @Param("lastReadTime") LocalDateTime lastReadTime,
                           @Param("employeeId") String employeeId);


}

