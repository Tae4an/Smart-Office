package com.office.app.repository;

import com.office.app.entity.OCRResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OCRResultRepository extends JpaRepository<OCRResult, Long> {
    List<OCRResult> findByUser_EmployeeIdOrderByCreatedAtDesc(String employeeId);
    Optional<OCRResult> findByIdAndUser_EmployeeId(Long id, String employeeId);
    void deleteByIdAndUser_EmployeeId(Long id, String employeeId);
    boolean existsByIdAndUser_EmployeeId(Long id, String employeeId);
}