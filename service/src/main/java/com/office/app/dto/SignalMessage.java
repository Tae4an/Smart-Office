package com.office.app.dto;

import lombok.Data;

@Data
public class SignalMessage {
    private String type;
    private String targetSessionId;
    private Object data;
    private String roomId;

}