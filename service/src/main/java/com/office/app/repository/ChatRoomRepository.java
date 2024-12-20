package com.office.app.repository;

import com.office.app.dto.ChatRoomDTO;
import com.office.app.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    // 사용자가 참여중인 활성화된 채팅방 목록 조회
    @Query("SELECT cr FROM ChatRoom cr JOIN ChatMember cm ON cr.id = cm.chatRoom.id " +
            "WHERE cm.user.employeeId = :employeeId " +
            "AND cm.isActive = true " +
            "AND cr.isActive = true")  // 채팅방 활성화 상태 체크 추가
    List<ChatRoom> findByEmployeeId(@Param("employeeId") String employeeId);

    // 1:1 채팅방 존재 여부 확인
    @Query("SELECT cr FROM ChatRoom cr JOIN ChatMember cm1 ON cr.id = cm1.chatRoom.id " +
            "JOIN ChatMember cm2 ON cr.id = cm2.chatRoom.id " +
            "WHERE cr.type = 'INDIVIDUAL' " +
            "AND cm1.user.employeeId = :employeeId1 " +
            "AND cm2.user.employeeId = :employeeId2 " +
            "AND cm1.isActive = true AND cm2.isActive = true " +
            "AND cr.isActive = true")  // 채팅방 활성화 상태 체크 추가
    Optional<ChatRoom> findIndividualRoom(@Param("employeeId1") String employeeId1,
                                          @Param("employeeId2") String employeeId2);

    @Query("SELECT new com.office.app.dto.ChatRoomDTO(" +
            "cr.id, cr.roomName, cr.type, cr.createdAt, " +
            "(SELECT COUNT(cm) FROM ChatMember cm WHERE cm.chatRoom = cr AND cm.isActive = true), " +
            "(SELECT COUNT(msg) FROM ChatMessage msg WHERE msg.chatRoom = cr AND msg.createdAt > " +
            "(SELECT cm2.lastReadTime FROM ChatMember cm2 WHERE cm2.chatRoom = cr AND cm2.user.employeeId = :employeeId)), " +
            "(SELECT msg FROM ChatMessage msg WHERE msg.chatRoom = cr ORDER BY msg.createdAt DESC LIMIT 1)) " +
            "FROM ChatRoom cr " +
            "WHERE cr.id IN (SELECT cm.chatRoom.id FROM ChatMember cm WHERE cm.user.employeeId = :employeeId AND cm.isActive = true) " +
            "AND cr.isActive = true")  // 채팅방 활성화 상태 체크 추가
    List<ChatRoomDTO> findRoomsWithDetailsByEmployeeId(@Param("employeeId") String employeeId);
}