package com.office.app.repository;

import com.office.app.entity.LlamaChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LlamaChatHistoryRepository extends JpaRepository<LlamaChatHistory, Long> {
    List<LlamaChatHistory> findByUserIdOrderByCreatedAtDesc(String userId);
    List<LlamaChatHistory> findTop5ByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByUserId(String userId);
}