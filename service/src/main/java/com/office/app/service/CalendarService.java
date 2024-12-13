package com.office.app.service;

import com.office.app.dto.CalendarDTO;
import com.office.app.entity.Calendar;
import com.office.app.entity.User;
import com.office.app.repository.CalendarRepository;
import com.office.app.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CalendarService {
    
    private final CalendarRepository calendarRepository;
    private final UserRepository userRepository;

    public List<Calendar> getUserEvents(String employeeId) {
        return calendarRepository.findByUserEmployeeId(employeeId);
    }
    public Calendar createEvent(String employeeId, CalendarDTO calendarDTO) {
        User user = userRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Calendar calendar = calendarDTO.toEntity(user);
        return calendarRepository.save(calendar);
    }

    public Calendar updateEvent(Long id, String employeeId, CalendarDTO calendarDTO) {
        Calendar existingCalendar = calendarRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Calendar not found"));

        if (!existingCalendar.getUser().getEmployeeId().equals(employeeId)) {
            throw new AccessDeniedException("Not authorized to update this event");
        }

        existingCalendar.setTitle(calendarDTO.getTitle());
        existingCalendar.setStart(calendarDTO.getStart());
        existingCalendar.setEnd(calendarDTO.getEnd());

        return calendarRepository.save(existingCalendar);
    }
    
    public void deleteEvent(Long id, String employeeId) {
        calendarRepository.deleteByIdAndUserEmployeeId(id, employeeId);
    }
    
    public void deleteAllUserEvents(String employeeId) {
        List<Calendar> events = calendarRepository.findByUserEmployeeId(employeeId);
        calendarRepository.deleteAll(events);
    }
}