package com.office.app.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DepartmentStats {
    private List<String> labels;  // 부서명
    private List<Long> data;      // 사용자 수
}