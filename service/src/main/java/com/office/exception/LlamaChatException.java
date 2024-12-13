package com.office.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class LlamaChatException extends RuntimeException {
    private final HttpStatus status;

    public LlamaChatException(String message) {
        super(message);
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    public LlamaChatException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}