package com.office.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.office.app.entity.Calendar;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
    List<Calendar> findByUserEmployeeId(String employeeId);
    void deleteByIdAndUserEmployeeId(Long id, String employeeId);
}