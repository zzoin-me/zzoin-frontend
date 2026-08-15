<div align="center">
  <a href="https://zzoin.me">
    <img src="./public/logo-wordmark.svg" alt="Zzoin" width="220" />
  </a>

  <h3>대학생 프로젝트 팀원 연결 서비스</h3>
  <p>작은 아이디어와 뜻이 맞는 팀원들이 만나는 순간, 프로젝트가 시작됩니다.</p>

  <p>
    <img src="https://img.shields.io/badge/React_19-FF8B00?style=flat-square&logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript_6-FF8B00?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6" />
    <img src="https://img.shields.io/badge/Vite_8-FF8B00?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
    <img src="https://img.shields.io/badge/Capacitor_8-FF8B00?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor 8" />
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-FF8B00?style=flat-square&logo=apache&logoColor=white" alt="Apache License 2.0" /></a>
  </p>

  <p>
    <a href="https://zzoin.me"><strong>Live Service</strong></a>
    &nbsp;·&nbsp;
    <a href="https://github.com/zzoin-it/zzoin-frontend/releases/latest"><strong>Download App</strong></a>
    &nbsp;·&nbsp;
    <a href="https://app.notion.com/p/zzoin/3a261ab28946806e931ee227bde6aae8"><strong>Project Notion</strong></a>
  </p>
</div>

---

## 프로젝트 소개

Zzoin은 학교 커뮤니티의 경계를 넘어 관심사를 바탕으로 가장 잘 맞는 팀원을 연결하는 **대학생 프로젝트 팀원 연결 서비스**입니다.

프로젝트 등록부터 프로젝트 지원과 수락, 실시간 대화와 후기까지 파편화되어 있던 과정을 하나의 경험으로 이어갑니다.

데스크톱·태블릿·모바일 반응형 웹과 Capacitor 기반 태블릿·모바일 앱을 함께 제공합니다.

> **캠퍼스의 경계를 넘어, 당신의 아이디어가 완벽한 포트폴리오가 되는 곳**

## 주요 기능

| 영역 | 주요 기능 |
| --- | --- |
| 🔎 **정교한 탐색** | 직군·기술 스택·모집 인원·목표 조건별 검색과 추천 프로젝트 |
| 🚀 **원스톱 매칭** | 프로젝트 등록, 모집 역할, 추가 설문, 지원과 수락·거절 관리 |
| 🎓 **신뢰 기반 프로필** | 대학 이메일 인증, 직군·기술 스택·프로젝트 후기와 사용자 평가 |
| 💬 **커뮤니티** | 게시글, 댓글·대댓글, 좋아요와 저장을 통한 정보 공유 |
| ⚡ **프로젝트 협업** | 참여자들과의 실시간 대화, 서비스 알림과 모바일 푸시 알림 |
| 📱 **크로스 플랫폼** | 반응형 웹, Android·iOS 앱 |

## Zzoin 둘러보기

| 링크 | 내용 |
| --- | --- |
| [Zzoin 바로가기](https://zzoin.me) | 웹에서 Zzoin 이용하기 |
| [최신 앱 다운로드](https://github.com/zzoin-it/zzoin-frontend/releases/latest) | 최신 모바일 앱 배포 확인 |
| [프로젝트 Notion](https://app.notion.com/p/zzoin/3a261ab28946806e931ee227bde6aae8) | 기획 의도, MVP, 사이트맵, 기능 명세서, UseCase, FlowDiagram, API 명세서 |

## 로컬에서 시작하기

> Node.js 및 NPM이 기본 설치되어 있어야 합니다.  


API 주소를 별도로 지정하기 위해 저장소 루트에 `.env.local`을 생성하여 다음 내용을 넣습니다. ([.env.exmaple](.env.example) 파일 참고)

```env
VITE_API_BASE_URL=http://localhost:3300
VITE_WS_BASE_URL=http://localhost:3300
```

다음의 명령어를 통해 빌드 및 테스트 서버를 실행할 수 있습니다.

```bash
npm install
npm run dev
```

---

<p align="center">
  <sub>Copyright 2026 Zzoin · <a href="./LICENSE">Apache License 2.0</a></sub>
</p>
