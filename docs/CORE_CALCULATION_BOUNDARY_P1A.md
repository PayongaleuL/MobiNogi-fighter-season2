# P1a 계산 코어 경계 분리 기록

## 목적

P1a는 계산 결과를 바꾸지 않고, React 렌더러와 독립적으로 시험 가능한 **결정론적 계산 구현의 단일 소스**를 만든다. 이 단계는 렌더러에서 직접 계산 호출을 제거하는 P1b의 안전한 선행 작업이다.

## 현재 경계

| 경로 | 책임 | 의존성 |
|---|---|---|
| `src/core/calculator.js` | 룬·인장·보석 입력을 받은 DPS 계산, 사이클 정규화, 오류 코드와 결과 반환 | `src/core/sealCalculator.js`만 참조 |
| `src/core/gemCalculator.js` | 22개 보석 옵션과 특수 보석 보정 집계 | 외부 런타임 의존성 없음 |
| `src/core/sealCalculator.js` | 10부위 인장 스탯 집계 | 외부 런타임 의존성 없음 |
| `src/utils/*.js` | 기존 import를 위한 호환 어댑터 | 해당 core 모듈만 재내보냄 |

> `src/core`는 React, DOM, `localStorage`, `sessionStorage`, 시간, 난수에 의존하지 않는다. 같은 입력에는 같은 결과를 반환해야 한다.

## 보존한 공개 계약

기존 `calculateDPS`, `calculateGemStats`, `calculateSealStats`, `getModifiedCoeff`의 함수명·인자 순서·반환 구조를 바꾸지 않았다. 기존 `src/utils` import를 사용하는 컴포넌트·테스트·스크립트는 호환 어댑터를 통해 동일하게 동작한다.

5개 최신 기준 프리셋을 이용한 골든 마스터는 다음 결과를 고정한다.

| 기준 프리셋 구분 | 골든 마스터 `weightedDps` | `totalAtk` |
|---|---:|---:|
| 약승열 1·2 | 12,091,085 | 108,947 |
| 전승강 1·2·3 | 13,169,249 | 108,947 |

이 값은 `parsedSkills`를 명시 전달하지 않는 core 단위 계약의 결과다. 실제 UI·참조 비교 스크립트는 파싱된 스킬 데이터를 포함한 기존 계약을 계속 사용하며, P1a 전후의 5개 실전 DPS 편차는 변하지 않아야 한다.

## 자동 검증

`src/core/coreBoundary.test.js`는 core 파일에 React·브라우저 저장소·DOM·시간·난수 의존성이 없는지 검사한다. `src/core/calculator.contract.test.js`는 5개 참조 프리셋의 코어 결과·정상 상태·정규화된 사이클을 검사한다. 기존 계산 엔진 커버리지와 기준 프리셋 테스트는 호환 어댑터 경로도 계속 검증한다.

## 의도적으로 P1b로 남긴 범위

`Calculator.jsx`의 `useMemo`는 아직 입력 조립과 계산 호출을 수행한다. 이 단계에서 상태 저장·프리셋 마이그레이션·UI props를 함께 옮기지 않은 이유는 P1a의 변경을 순수 모듈 이동으로 제한하기 위해서다. P1b에서는 UI가 전용 애플리케이션 어댑터가 만든 계산 결과만 소비하도록 바꾸되, 상태 소유자와 localStorage 마이그레이션은 UI 계층에 남긴다.
