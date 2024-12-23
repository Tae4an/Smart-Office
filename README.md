[![Build Status](http://211.188.62.189:8080/buildStatus/icon?job=SmartOffice&style=flat-square&subject=CI/CD)](http://211.188.62.189:8080/job/SmartOffice)

# 🚀 Smart Office Solution

혁신적인 업무 환경의 미래를 위한 올인원 스마트 오피스 솔루션

## 📑 프로젝트 개요

### 기본 정보
- **프로젝트명**: 스마트 오피스 솔루션
- **개발 기간**: 2024.10.24 - 2024.12.24
- **개발 팀**:
    - PL&PM: 최태산
    - Frontend: 이은범
    - Backend: 정연균, 최태산


## 💡 프로젝트 소개

### 배경
현재 기업들이 직면한 주요 문제점:
- 분산된 업무 도구로 인한 생산성 저하
- 하이브리드 근무 환경에서의 협업 어려움
- 실시간 소통 채널의 비효율성
- 통합된 업무 플랫폼 부재

### ✨ 핵심 기능

1. **AI 기반 스마트 근태관리**
    - 유연근무제 지원
    - AI 얼굴인식 기반 출퇴근
    - 근무 현황 대시보드
    - 자동 리포트 생성

2. **스마트 캘린더 시스템**
    - 다차원 일정 관리
    - AI 기반 일정 최적화
    - 외부 캘린더 동기화

3. **통합 커뮤니케이션**
    - 통합 게시판
    - AI 강화 실시간 메신저
    - HD 화상회의
    - 자동 회의록 생성

4. **스마트 워크스페이스**
    - 클라우드 드라이브
    - 스마트 북마크
    - OCR 기반 문서 관리
    - AI 기반 업무 비서

## 🛠 기술 스택

### Frontend
- React
- JavaScript
- HTML/CSS
- Bootstrap
- TensorFlow.js (얼굴 인식)

### Backend
- SpringBoot
- Java
- WebSocket
- WebRTC
- LLaMA 3.1 (AI)
- OpenCV (얼굴 인식)
- Upstage (OCR)

### Database
- MySQL
- JPA

### Development Tools
- IntelliJ IDEA
- VS Code
- Git/Github
- PostMan
- Swagger
- Workbench

## 🔒 보안 요구사항

### 인증/인가
- [x] JWT 토큰 기반 인증
- [x] 역할 기반 접근 제어
- [x] SSO 구현
- [x] 얼굴 인식 데이터 보안

### 데이터 보안
- [x] AES-256 암호화
- [x] SSL/TLS 적용
- [x] API 보안 강화
- [x] 생체 정보 암호화 저장

## 📋 개발 일정

```mermaid
gantt
    title 스마트 오피스 솔루션 개발 마스터 일정
    dateFormat YYYY-MM-DD
    axisFormat %m-%d
    excludes weekends

    section 프로젝트 초기화
    프로젝트 킥오프: milestone, start, 2024-10-22, 1d
    요구사항 분석: done, req, 2024-10-22, 4d
    아키텍처 설계: done, arch, after req, 3d
    개발 환경 구축: done, env, after arch, 3d

    section 인프라 구축
    컨테이너화 준비: done, docker, 2024-11-04, 4d
    CI/CD 파이프라인: done, cicd, after docker, 3d
    클라우드 인프라 설정: done, cloud, after cicd, 3d

    section AI 기능 개발
    얼굴 인식 모델: done, face, 2024-11-11, 5d
    OCR 기능 개발: done, ocr, after face, 4d
    AI 챗봇 통합: done, chatbot, after ocr, 5d

    section 웹 애플리케이션
    프론트엔드 개발: done, frontend, 2024-11-25, 5d
    백엔드 개발: done, backend, 2024-11-25, 5d
    WebRTC 통합: done, webrtc, after frontend, 4d
    실시간 채팅 구현: done, chat, after webrtc, 3d

    section 데이터베이스 및 로깅
    Redis 데이터베이스: done, redis, 2024-12-09, 3d
    ELK 스택 구축: done, elk, after redis, 3d
    시스템 모니터링 설정: done, monitor, after elk, 2d

    section 부가 기능
    게시판 시스템: done, board, 2024-12-12, 3d
    파일 관리 시스템: done, filemanage, after board, 2d
    지도 서비스 연동: done, maps, after filemanage, 2d

    section 최종 단계
    통합 테스트: crit, integration, 2024-12-16, 3d
    성능 최적화: crit, optimization, 2024-12-16, 5d
    최종 배포: milestone, deploy, after optimization, 1d
```

## 👥 Target Users

### 관리자 페르소나
- **김영호** (42세, IT팀 과장)
    - IT팀 7년차 베테랑
    - 시스템 운영/관리 전문가
    - 통합 관리 시스템 및 보안 강화 요구

### 일반 직원 페르소나
- **이미라** (29세, 기획팀 대리)
    - 기획팀 3년차
    - 하이브리드 근무자
    - 올인원 플랫폼 및 효율적 협업 도구 요구

## 🚀 Getting Started

### Prerequisites
```bash
node >= 16.0.0
java >= 17
mysql >= 8.0
```

### Installation
```bash
# Frontend
cd frontend
npm install
npm start

# Backend
cd backend
./gradlew build
java -jar build/libs/smart-office-0.0.1-SNAPSHOT.jar
```
