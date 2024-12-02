package com.office.interceptor;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class WebSocketHandshakeInterceptor extends HttpSessionHandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            HttpSession session = servletRequest.getServletRequest().getSession(false);

            if (session != null) {
                // Spring Security 컨텍스트에서 인증 정보 가져오기
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                if (auth != null && auth.isAuthenticated()) {
                    String userId = auth.getName(); // 인증된 사용자의 ID를 가져옴
                    attributes.put("X-User-Id", userId);
                    log.debug("WebSocket handshake - User ID added to attributes: {}", userId);
                } else {
                    log.warn("WebSocket handshake - No authenticated user found");
                    return false; // 인증되지 않은 사용자는 연결 거부
                }
            } else {
                log.warn("WebSocket handshake - No session found");
                return false; // 세션이 없는 경우 연결 거부
            }
        }

        return super.beforeHandshake(request, response, wsHandler, attributes);
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception ex) {
        if (ex != null) {
            log.error("Error during WebSocket handshake", ex);
        }
        super.afterHandshake(request, response, wsHandler, ex);
    }
}