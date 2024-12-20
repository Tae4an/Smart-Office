package com.office.app.repository;

import com.office.app.entity.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {
    // 채팅방의 활성 멤버 목록 조회
    List<ChatMember> findByChatRoomIdAndIsActiveTrue(Long roomId);
    
    // 특정 사용자의 특정 채팅방 멤버십 조회
    Optional<ChatMember> findByChatRoomIdAndUserEmployeeId(Long roomId, String employeeId);
    
    // 채팅방의 멤버 수 조회
    @Query("SELECT COUNT(cm) FROM ChatMember cm WHERE cm.chatRoom.id = :roomId AND cm.isActive = true")
    long countActiveMembersByRoomId(@Param("roomId") Long roomId);
}
