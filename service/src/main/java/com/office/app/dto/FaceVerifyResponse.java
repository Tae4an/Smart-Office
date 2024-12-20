package com.office.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaceVerifyResponse {
    private boolean verified;        // 인증 성공 여부
    private double distance;         // 얼굴 간 거리 (유사도 측정값)
    private double threshold;        // 임계값 (이 값보다 distance가 작으면 동일인으로 판단)
    private String model;           // 사용된 얼굴 인식 모델
    private double similarityScore; // 유사도 점수 (1 - distance)

    @Builder.Default
    private boolean success = true;  // API 응답 성공 여부
    private String message;          // 에러 메시지 (실패 시)
}
