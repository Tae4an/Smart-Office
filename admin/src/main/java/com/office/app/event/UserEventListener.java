package com.office.app.event;

import com.office.app.entity.User;
import com.office.app.security.AdminUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserEventListener {
    
    private final SessionRegistry sessionRegistry;
    
    @EventListener
    public void handleUserUpdateEvent(UserUpdateEvent event) {
        User updatedUser = event.getUser();
        
        // 해당 사용자의 모든 세션을 찾아서 만료시킴
        sessionRegistry.getAllPrincipals().stream()
            .filter(principal -> principal instanceof AdminUserDetails)
            .map(principal -> (AdminUserDetails) principal)
            .filter(details -> details.getUsername().equals(updatedUser.getEmployeeId()))
            .forEach(details -> {
                sessionRegistry.getAllSessions(details, false)
                    .forEach(SessionInformation::expireNow);
            });
    }
}