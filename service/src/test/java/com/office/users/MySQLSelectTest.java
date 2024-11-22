package com.office.users;

import com.office.app.dto.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import jakarta.persistence.EntityManager;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class MySQLSelectTest {

    @Autowired
    private EntityManager em;

    @Test
    public void findUserById() {
        // when
        User user = em.find(User.class, 1);

        // then
        assertThat(user).isNotNull();
        
        // print user info
        System.out.println("\n=== User Info ===");
        System.out.println("ID: " + user.getId());
        System.out.println("Username: " + user.getUsername());
        System.out.println("Email: " + user.getEmail());
        System.out.println("Created At: " + user.getCreatedAt());
        System.out.println("Updated At: " + user.getUpdatedAt());
    }
}