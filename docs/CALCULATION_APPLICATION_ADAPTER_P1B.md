# P1b 렌더러와 계산 애플리케이션 어댑터 분리

## 목적

P1b는 `Calculator.jsx`가 DPS·보석·룬 전개·스킬 파싱을 직접 수행하지 않도록 바꾼다. React 컴포넌트는 UI 상태, 사용자 입력, 저장소 동기화, 자식 컴포넌트 렌더링만 담당하고 계산 결과는 어댑터 훅에서 받는다.

## 책임 경계

| 계층 | 파일 | 책임 | 금지 책임 |
|---|---|---|---|
| Core | `src/core/*.js` | 결정론적 DPS·보석·인장 산식 | React·DOM·저장소·시간·난수 |
| Application adapter | `src/adapters/calculationAdapter.js` | 현재 룬 해석, 초월 단계 주입, 보석 집계, 스킬 데이터 파싱, core 입력 조립 | JSX 렌더링·localStorage 접근 |
| React adapter | `src/adapters/useDpsResult.js` | 입력 변경 시 어댑터 결과를 메모이제이션 | 계산 산식·데이터 정규화 |
| UI | `src/components/Calculator.jsx` | 입력 상태와 화면 이벤트, 렌더링 | `calculateDPS`, `calculateGemStats`, 스킬 파싱, 룬 전개 |

## 데이터 흐름

```text
UI state → useDpsResult → calculateDpsResult → core calculators → dpsResult → UI rendering
```

`calculateDpsResult`는 같은 입력 객체에 대해 같은 결과를 반환한다. 룬 이름은 `+`와 공백을 제거한 비교 키로 현재 교정 룬과 JSON 룬을 해석하고, 선택 슬롯의 초월 단계를 그대로 붙인다. 보석 계산에서 나온 `extraAllStat`과 `extraFinalDmgPct`만 계산 입력의 복사본에 더하며 React 상태를 변경하지 않는다.

## 테스트와 확장 규칙

`calculationAdapter.test.js`는 룬 해석·초월 단계·어댑터 결과와 직접 core 호출의 동등성을 검증한다. `Calculator.boundary.test.js`는 컴포넌트가 DPS·보석 계산과 스킬 파싱을 직접 import하지 않고 `useDpsResult`만 소비하는지 검사한다.

새 계산 기능은 먼저 `src/core`의 순수 함수·테스트로 추가한다. 입력 조립이 필요하면 `src/adapters`에 넣고, UI는 명시적인 입력 state와 props만 전달한다. localStorage 마이그레이션, 테마, 클릭·키보드 이벤트는 UI 계층에 둔다. 어댑터 파일이 5개를 넘거나 서로 다른 유스케이스의 조립이 섞이면 그때 별도 application service 계층을 검토한다.
