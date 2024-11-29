package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminRoleStats {
    private long superAdminCount;
    private long adminCount;
}