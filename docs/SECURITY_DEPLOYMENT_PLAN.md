# 배포 보안 계획 및 실행 기록

**범위:** `C:\GitHub\MobiNogi fighter season2` 내부 소스·의존성·GitHub Actions·GitHub Pages 배포 설정만 점검한다. 로컬 컴퓨터의 다른 폴더·운영체제 설정은 접근하지 않는다.

## 위협 모델
| 보호 대상 | 주요 위험 | 통제 방식 |
|---|---|---|
| 로컬 개발 환경 | 비밀 파일·개인 키가 Git에 포함되어 원격 저장소와 Pages로 노출 | `.env`·키 파일 무시, 정적·이력 비밀 패턴 점검, 비밀을 클라이언트 코드에 두지 않음 |
| 배포 파이프라인 | 변조된 Action 태그·과도한 토큰 권한·검증 없는 배포 | Action SHA 고정, 기본 읽기 권한, 배포 작업에만 Pages 쓰기 권한, PR 품질 검증 |
| 공개 정적 사이트 | 외부 스크립트·예상치 못한 연결·XSS 확산 | CSP, 엄격한 리퍼러 정책, 정적 self-only 연결 정책 |
| 의존성 | 알려진 취약점·잠금 파일 외 설치 훅 | production audit, lockfile dry run, CI `npm ci --ignore-scripts` |

## 점검 결과 및 조치
| 항목 | 점검 결과 | 조치 | 상태 |
|---|---|---|---|
| production 의존성 | `npm audit --omit=dev` 취약점 0건 | 결과를 `results/security-production-audit.json`에 보관 | PASS |
| 잠금 파일 | `npm ci --dry-run --ignore-scripts` 통과 | CI도 동일한 설치 훅 차단 방식으로 변경 | PASS |
| 비밀정보 | 현재 추적 파일과 전체 Git 이력에서 고위험 토큰·개인 키 패턴 0건 | `.env`, 키·인증서 확장자 무시 규칙 추가 | PASS |
| Actions 공급망 | 태그 참조와 단일 작업의 Pages 쓰기 권한 발견 | 모든 외부 Action을 확인된 SHA로 고정하고 verify/deploy 작업 권한 분리 | 완화됨 |
| Pages 클라이언트 | 외부 네트워크 의존성 없음 | CSP와 `no-referrer` 메타 정책 추가, Chrome 콘솔 오류를 유발하는 meta CSP의 `frame-ancestors` 제외 | 완화됨 |
| 브라우저 E2E | 기존 verify는 단위·커버리지·빌드만 실행 | Chromium에서 데스크톱·모바일 렌더링, 마을 공격력 입력, DPS 재계산, 예시 프리셋, 브라우저 오류 0건을 별도 실행 | PASS |
| GitHub 보안 기능 | secret scanning·push protection 활성, Dependabot 보안 업데이트 비활성, main 보호 없음 | Dependabot와 main 보호 규칙은 보안 PR 통과 후 저장소 설정에서 적용 | 대기 |

## 배포 승인 기준
1. `npm run lint`, `npm run test:coverage`, `npm run build`, `npm run test:e2e`는 분리 실행하되 모두 통과해야 하며, 이 결합 결과와 production dependency audit이 배포 승인 기준이다.
2. 변경 워크플로는 SHA 고정 Action과 최소 권한 원칙을 유지해야 한다.
3. `.env`·키 파일·토큰이 추적되면 안 되며, 발견 즉시 커밋 이력 정리와 자격 증명 폐기를 우선한다.
4. CSP가 배포 UI의 정적 스크립트·스타일·이미지를 차단하지 않아야 한다.
5. main은 PR 기반 검토와 `verify` 통과 없이는 변경하지 않도록 보호한다.

## 한계와 운영 주의
- GitHub Pages는 정적 호스팅이므로 서버 측 비밀 저장·응답 헤더 커스터마이징을 제공하지 않는다. 비밀값·개인 API 키를 프론트엔드에 넣으면 CSP와 무관하게 공개된다.
- CSP 메타 정책은 가능한 정적 페이지 방어층이며, 응답 헤더 기반 CSP·HSTS·X-Frame-Options를 대체하지 않는다. 특히 `frame-ancestors`는 meta CSP에서 지원되지 않아 포함하지 않으며, 프레이밍 차단은 호스팅 응답 헤더를 제어할 수 있을 때 별도로 적용한다.
- 외부 기준 DPS 계약과 계산 정확성 검증은 별도 품질 게이트이며, 본 보안 작업의 PASS가 계산기 병합 승인을 의미하지 않는다.
