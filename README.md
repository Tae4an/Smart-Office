## Spring Boot & React & AI 서비스 기반 스마트 오피스 솔루션
![메인화면](https://github.com/user-attachments/assets/d020ad5c-1f89-4eea-b856-aec754380444)
AI 기술과 클라우드 기반의 통합 업무 환경을 구축하여 기업의 업무 효율성을 향상시키는 스마트 오피스 솔루션입니다.

## 시연 영상
[![시연 영상](https://github.com/user-attachments/assets/299a8905-fde8-44b1-b216-c65287a5f8b4)](https://www.youtube.com/watch?v=lOQpA_LLj4w)

## 시스템 아키텍처
![service](https://github.com/user-attachments/assets/e7c6805a-81bf-4a7a-a2ce-b10eda686ee9)

### Team Members
- **프로젝트명**: 스마트 오피스 솔루션
- **개발 기간**: 2024.10.24 - 2024.12.23

| 역할 | 이름 | 전문 분야 | 연락처 |
|------|------|----------|--------|
| **팀장 & 풀스택** | 최태산 | 시스템 설계/통합, DevOps | xotks7524@gmail.com |
| **AI/ML** | 정연균 | 음성처리, 감정분석 | jungyk411@sunmoon.ac.kr |
| **프론트엔드** | 이은범 | Flutter, 모바일 개발 | bum17822@naver.com |

## Tech Stack
![image](https://github.com/user-attachments/assets/4472faa3-99aa-436c-be01-af76d55b3485)


## 주요 기능
- **얼굴인식 출퇴근 관리**: DeepFace 기반 실시간 인증
- **화상회의**: WebRTC 기반 실시간 소통
- **OCR & 문서분석**: AI 기반 문서 자동화
- **업무 챗봇**: LLaMA 3.2 기반 선택형 응답
- **통계 & 모니터링**: ELK Stack 기반 데이터 분석


### 핵심 구성
- Docker 기반 컨테이너화
- Jenkins CI/CD 파이프라인
- Redis 캐싱 및 JWT 관리
- ELK Stack 로그 분석
- MSA 기반 확장 가능 구조

## 주요 기술 특징
1. **확장성**
- Docker 컨테이너화
- MSA 기반 설계
- Jenkins CI/CD

2. **AI 기술 통합**
- DeepFace 얼굴인식
- Upstage OCR
- LLaMA 3.2 챗봇

3. **실시간 처리**
- WebRTC P2P 연결
- Redis 캐싱
- WebSocket 실시간 통신

4. **보안 및 모니터링**
- JWT 기반 인증
- ELK Stack 로그 분석
- Redis 토큰 관리

## 실행 방법
```bash
# Clone repository
git clone [repository URL]

# Docker 컨테이너 실행
docker-compose up -d
```
