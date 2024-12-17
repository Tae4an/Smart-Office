package com.office.controller;

import com.office.app.domain.AdminRole;
import com.office.app.dto.UserListResponse;
import com.office.app.dto.UserSearchDto;
import com.office.app.service.AdminService;
import com.office.app.service.DashboardService;
import com.office.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@Slf4j
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping("/list")
    public String adminList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,  // AdminRole -> String으로 변경
            @PageableDefault(size = 10) Pageable pageable,
            Model model
    ) {
        model.addAttribute("adminList", adminService.searchAdmins(keyword, role, pageable));
        model.addAttribute("keyword", keyword);
        model.addAttribute("role", role);
        model.addAttribute("contentPage", "admin/list.jsp");
        return "index";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        model.addAttribute("contentPage", "admin/profile.jsp");
        return "index";
    }

    @GetMapping("/password")
    public String password(Model model) {
        model.addAttribute("contentPage", "admin/password.jsp");
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("stats", dashboardService.getDashboardStats());
        model.addAttribute("departmentStats", dashboardService.getDepartmentStats());
        model.addAttribute("adminStats", dashboardService.getAdminRoleStats());
        model.addAttribute("recentUsers", dashboardService.getRecentUsers(10));

        model.addAttribute("contentPage", "admin/dashboard.jsp");
        return "index";
    }

    @GetMapping("/users")
    public String userList(UserSearchDto searchDto,
                           @PageableDefault(size = 20) Pageable pageable,  // 페이지 사이즈를 20으로 수정
                           Model model) {
        model.addAttribute("departments", userService.getAllDepartments());

        Page<UserListResponse> users = userService.searchUsers(
                searchDto.getKeyword(),
                searchDto.getDepartment(),
                pageable
        );
        model.addAttribute("users", users);

        model.addAttribute("contentPage", "admin/users.jsp");
        return "index";
    }
}