package com.office.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/statistics")
public class StatisticsController {

    @GetMapping("/board")
    public String board(Model model) {
        model.addAttribute("contentPage", "statistics/board.jsp");  // 경로 수정
        return "index";
    }

    @GetMapping("/attendance")
    public String attendance(Model model) {
        model.addAttribute("contentPage", "statistics/attendance.jsp");  // 경로 수정
        return "index";
    }

    @GetMapping("/department")
    public String department(Model model) {
        model.addAttribute("contentPage", "statistics/department.jsp");  // 경로 수정
        return "index";
    }
}
