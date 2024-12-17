package com.office.handler;

import com.office.app.dto.ErrorResponse;
import com.office.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRoomNotFoundException(
            RoomNotFoundException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.NOT_FOUND, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(RoomFullException.class)
    public ResponseEntity<ErrorResponse> handleRoomFullException(
            RoomFullException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.CONFLICT, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPasswordException(
            InvalidPasswordException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.UNAUTHORIZED, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(DuplicateParticipantException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateParticipantException(
            DuplicateParticipantException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.CONFLICT, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccessException(
            UnauthorizedAccessException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.UNAUTHORIZED, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(RoomClosedException.class)
    public ResponseEntity<ErrorResponse> handleRoomClosedException(
            RoomClosedException ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.BAD_REQUEST, 
            ex.getMessage(), 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");

        return createErrorResponse(
            HttpStatus.BAD_REQUEST, 
            errorMessage, 
            request.getDescription(false)
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        return createErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR, 
            "An unexpected error occurred", 
            request.getDescription(false)
        );
    }

    private ResponseEntity<ErrorResponse> createErrorResponse(
            HttpStatus status, String message, String path) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();

        return new ResponseEntity<>(errorResponse, status);
    }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.error("File size exceeded", e);
        ErrorResponse response = ErrorResponse.builder()
                .error("File Upload Error")
                .message("파일 크기가 제한을 초과합니다. (최대 50MB)")
                .build();
        return ResponseEntity.badRequest().body(response);
    }


    @ExceptionHandler(GCSException.class)
    public ResponseEntity<ErrorResponse> handleGCSException(GCSException e) {
        log.error("GCS operation failed", e);
        ErrorResponse response = ErrorResponse.builder()
                .error("File Operation Error")
                .message(e.getMessage())
                .build();
        return ResponseEntity.badRequest().body(response);
    }


    @ExceptionHandler(BoardAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleBoardAccessDeniedException(
            BoardAccessDeniedException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.FORBIDDEN,
                ex.getMessage(),
                request.getDescription(false)
        );
    }

    @ExceptionHandler(BoardNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBoardNotFoundException(
            BoardNotFoundException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getDescription(false)
        );
    }

    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePostNotFoundException(
            PostNotFoundException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getDescription(false)
        );
    }

    @ExceptionHandler(CommentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCommentNotFoundException(
            CommentNotFoundException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getDescription(false)
        );
    }
}