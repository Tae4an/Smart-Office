package com.office.app.entity;

import com.office.app.domain.RoomStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_room")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingRoom {
    @Id
    private String roomId;

    @NotNull
    private String roomName;

    private String description;  // 추가

    @NotNull
    private String hostId;

    @Min(2)
    @Max(6)
    private int maxParticipants;

    private String password;

    @NotNull
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private RoomStatus status = RoomStatus.ACTIVE;

}