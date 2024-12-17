package com.office.app.repository;

import com.office.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    boolean existsByEmail(String email);
    
    Optional<User> findByEmail(String email);
    
    @Query("SELECT DISTINCT u.department FROM User u ORDER BY u.department")
    List<String> findDistinctDepartments();
    
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR u.employeeId LIKE %:keyword% OR u.name LIKE %:keyword%) AND " +
           "(:department IS NULL OR :department = '' OR u.department = :department)")
    Page<User> findByKeywordAndDepartment(
            @Param("keyword") String keyword,
            @Param("department") String department,
            Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "u.employeeId IN (SELECT DISTINCT a.user.employeeId FROM Admin a)")
    List<User> findAllAdminUsers();
    
    @Query("SELECT u FROM User u WHERE " +
           "u.department = :department AND " +
           "u.employeeId NOT IN (SELECT DISTINCT a.user.employeeId FROM Admin a)")
    List<User> findNonAdminUsersByDepartment(@Param("department") String department);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    List<User> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT new map(u.department as dept, COUNT(u) as count) " +
            "FROM User u GROUP BY u.department")
    List<Map<String, Object>> countByDepartment();

}