package com.office.app.repository;

import com.office.app.domain.AdminRole;
import com.office.app.entity.Admin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUser_EmployeeId(String employeeId);
    boolean existsByUser_EmployeeId(String employeeId);

    @Query("SELECT a FROM Admin a JOIN FETCH a.user WHERE a.role = :role")
    List<Admin> findAllByRoleWithUser(@Param("role") AdminRole role);

    Page<Admin> findAllByRole(AdminRole role, Pageable pageable);

    @Query("SELECT a FROM Admin a JOIN FETCH a.user u " +
            "WHERE (:role is null OR a.role = :role) " +
            "AND (:keyword is null OR :keyword = '' OR " +
            "u.employeeId LIKE %:keyword% OR " +
            "u.name LIKE %:keyword% OR " +
            "u.department LIKE %:keyword%)")
    Page<Admin> searchAdmins(@Param("keyword") String keyword,
                            @Param("role") AdminRole role,
                            Pageable pageable);

    long countByRole(AdminRole role);

}