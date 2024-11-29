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
public class ViewController {
    private final DashboardService dashboardService;
    private final UserService userService;
    private final AdminService adminService;


    @GetMapping("/")
    public String root() {
        return "redirect:/admin/login";
    }

    @RequestMapping("/login")
    public String loginPage() {
        log.info("admin login page");
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        // 대시보드 통계 데이터 추가
        model.addAttribute("stats", dashboardService.getDashboardStats());
        model.addAttribute("departmentStats", dashboardService.getDepartmentStats());
        model.addAttribute("adminStats", dashboardService.getAdminRoleStats());
        model.addAttribute("recentUsers", dashboardService.getRecentUsers(10));

        // 컨텐츠 페이지 설정
        model.addAttribute("contentPage", "admin/dashboard.jsp");
        return "index";
    }

    @GetMapping("/list")
    public String adminList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AdminRole role,
            @PageableDefault(size = 10) Pageable pageable,
            Model model
    ) {
        // AdminService의 searchAdmins 메서드 호출
        model.addAttribute("adminList", adminService.searchAdmins(keyword, role, pageable));
        model.addAttribute("keyword", keyword);
        model.addAttribute("role", role);
        model.addAttribute("contentPage", "admin/list.jsp");
        return "index";
    }



    @GetMapping("/users")
    public String userList(UserSearchDto searchDto,
                           @PageableDefault(size = 10) Pageable pageable,
                           Model model) {
        // 부서 목록 조회
        model.addAttribute("departments", userService.getAllDepartments());

        // 사용자 목록 조회 (페이징, 검색 조건 적용)
        Page<UserListResponse> users = userService.searchUsers(
                searchDto.getKeyword(),
                searchDto.getDepartment(),
                pageable
        );
        model.addAttribute("users", users);

        // 컨텐츠 페이지 설정
        model.addAttribute("contentPage", "admin/users.jsp");
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
}