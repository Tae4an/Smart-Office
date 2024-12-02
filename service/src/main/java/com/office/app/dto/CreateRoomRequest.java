package com.office.app.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Data
public class CreateRoomRequest {
    @NotBlank(message = "Room name is required")
    @Size(min = 3, message = "Room name must be at least 3 characters")
    private String roomName;

    private String description;  // 추가

    @Min(value = 2, message = "Minimum participants is 2")
    @Max(value = 6, message = "Maximum participants is 6")
    private int maxParticipants;

    @Size(min = 4, message = "Password must be at least 4 characters")
    private String password;
}
