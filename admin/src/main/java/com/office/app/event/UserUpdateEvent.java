package com.office.app.event;

import com.office.app.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserUpdateEvent extends ApplicationEvent {
    private final User user;

    public UserUpdateEvent(Object source, User user) {
        super(source);
        this.user = user;
    }
}