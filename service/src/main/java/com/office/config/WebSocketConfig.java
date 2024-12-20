package com.office.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.office.app.service.MeetingChatService;
import com.office.app.service.MeetingRoomService;
import com.office.handler.ChatWebSocketHandler;
import com.office.handler.WebRTCSignalingHandler;
import com.office.interceptor.WebSocketHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    private final ObjectMapper objectMapper;
    private final MeetingRoomService meetingRoomService;
    private final MeetingChatService meetingChatService;
    private final ChatWebSocketHandler chatWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webRTCSignalingHandler(), "/ws/signaling")
                .addInterceptors(new WebSocketHandshakeInterceptor())
                .setAllowedOrigins("*"); // 프로덕션 환경에서는 구체적인 오리진을 지정

        // 채팅 웹소켓 핸들러 등록
        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                .addInterceptors(new WebSocketHandshakeInterceptor())
                .setAllowedOrigins("*");
    }

    @Bean
    public WebRTCSignalingHandler webRTCSignalingHandler() {
        return new WebRTCSignalingHandler(
                objectMapper,
                meetingRoomService,
                meetingChatService
        );
    }
}