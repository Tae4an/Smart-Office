package com.office.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LlamaChatRequest {
    private String prompt;
    private String systemPrompt;
    private List<Map<String, String>> context;
}