package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CreateGroupRoomRequest {
    private String roomName;
    private List<String> members;
}

