package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    private long totalUsers;
    private long totalAdmins;
    private long totalDepartments;
    private long newUsersToday;
}