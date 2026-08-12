# 2026-08-12 원격 병합 상태 점검

## 확인 대상

| 대상 | 원격 상태 | 판정 |
| --- | --- | --- |
| PR #33 `fix/deployment-security-hardening` → `main` | GitHub PR 화면에서 Open, `CLEAN`, `MERGEABLE`; verify 성공·deploy 스킵 | 충돌 없음 |
| `feat/ui-workspace-redesign` → `main` | GitHub 비교 화면에서 “Can’t automatically merge” 표시 | 충돌 있음 |

## 재현된 충돌 파일

`src/utils/calculator.test.js` 한 파일에서만 내용 충돌이 발생한다. 최신 main의 마을 공격력·인장 상태창 완성값 계약 회귀 테스트와 UI 브랜치의 직접 최종 피해 입력 회귀 테스트가 같은 삽입 위치를 경쟁한다.

## 해결본

로컬 브랜치 `feat/계산-작업영역-개선`은 두 테스트를 모두 보존해 충돌을 해소했으며, 보안·E2E 브랜치 `fix/배포-보안-e2e-관문` 위에서도 병합 트리가 CLEAN이다. 원격 원본 UI 브랜치에는 GitHub 연결 안정화 후 해결본을 반영해야 한다.
