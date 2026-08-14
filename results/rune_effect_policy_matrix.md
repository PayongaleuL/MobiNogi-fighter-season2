# 시즌2 룬 효과 정책 매트릭스

**생성 기준:** 2026-08-14T08:48:39.455Z
**권위 원문:** `results/260814_룬설명목록.md` (SHA-256: `A86E44F39200A2872DD15A9C8B2C577B2EAA052F6BF9476B5A2254D61908B93A`)
**범위:** 원문 룬 88개 / 현재 계산 데이터 88개

> 이 표는 원문을 수정하지 않고, 각 룬이 현재 DPS 엔진에서 어떤 정책으로 해석되는지 기록한다. v2는 상시 스탯을 항상 적용하고 조건부 효과만 개별 가동률을 쓴다. 직접 피해·평타/적중 이벤트·복수 속도 채널·스택/쿨다운 전이가 확정되지 않은 효과는 숫자 0으로 대체하지 않고 **계산 미반영** 또는 **v1 동결**로 남긴다.

| 정책 | 룬 수 | 의미 |
| --- | ---: | --- |
| 효과 모델 v2 | 11 | 상시 스탯과 조건부 효과를 분리했다. |
| v1 조건부 동결 | 57 | 기존 검증 수치를 보존하되 효과별 재판정 전 새 DPS 추정을 추가하지 않는다. |
| 상시·기존 값 | 20 | 현행 수동 보정과 계산 계약을 유지한다. |
| v2 미확정 효과 | 5개 효과 | 평타/적중/직접 피해 이벤트는 DPS에 미포함이다. |

## 룬별 적용 정책

| 부위 | 룬 | 현재 DPS 정책 | 효과별 기본값 또는 보류 사유 | 원문 감사 코드 |
| --- | --- | --- | --- | --- |
| 무기 | 눈부신 잔영 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED |
| 무기 | 햇살+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 무기 | 계시+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 무기 | 광채+ | 상시·기존 계산값 유지 | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | DIRECT_DAMAGE_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE |
| 무기 | 타오르는 영광 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | MANUAL_STAT_DIFFERENCE |
| 무기 | 오랜 광기 | v2: 상시·효과별 가동률 분리 | 상시 효과만 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MULTIPLE_SPEED_CHANNELS_COLLAPSED |
| 무기 | 억눌린 충동 | v2: 상시·효과별 가동률 분리 | 상시 효과만 | 원문·수동 데이터 일치 |
| 무기 | 암운+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, DIRECT_DAMAGE_POLICY_REQUIRED |
| 무기 | 부패+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, DIRECT_DAMAGE_POLICY_REQUIRED |
| 무기 | 창백한 기수 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 무기 | 거대한 분노 | v2: 상시·효과별 가동률 분리 | 강타 적중 4중첩 스킬 피해: 100% | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, STACK_POLICY_REQUIRED |
| 무기 | 바위 칼날 | v2: 상시 적용 + 미확정 효과 미반영 | 적중 30중첩 공격력·치명타: 미반영 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, OCR_OR_TIER_TEXT_REVIEW_REQUIRED, STACK_POLICY_REQUIRED |
| 무기 | 두 갈래 별 | v2: 상시 적용 + 미확정 효과 미반영 | 기본 공격 후 스킬 사용 속도: 미반영<br>스킬 사용 후 공격 속도: 미반영 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, MULTIPLE_SPEED_CHANNELS_COLLAPSED |
| 무기 | 추적자 | v2: 상시 적용 + 미확정 효과 미반영 | 스킬 8회 직접 피해·강타 피해 감소: 미반영 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE |
| 무기 | 대군주+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 기본기+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 방어구 | 첫 번째 서약 | v2: 상시·효과별 가동률 분리 | 밤의 축복 강타·치명타·공격력: 100% | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 녹슨 방패 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE |
| 방어구 | 긍지 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 방어구 | 위엄 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | MANUAL_STAT_DIFFERENCE |
| 방어구 | 그믐달 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 공세+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, STACK_POLICY_REQUIRED |
| 방어구 | 정복자+ | v2: 상시·효과별 가동률 분리 | 주변 처치 주는 피해: 0% | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, OCR_OR_TIER_TEXT_REVIEW_REQUIRED |
| 방어구 | 은빛 찬가 | v2: 상시·효과별 가동률 분리 | 주변 처치 재사용 회복: 0% | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE, OCR_OR_TIER_TEXT_REVIEW_REQUIRED |
| 방어구 | 기사단장 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, MULTIPLE_SPEED_CHANNELS_COLLAPSED, OCR_OR_TIER_TEXT_REVIEW_REQUIRED |
| 방어구 | 승전 | v2: 상시·효과별 가동률 분리 | 주변 처치 치명타 피해: 0% | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, OCR_OR_TIER_TEXT_REVIEW_REQUIRED |
| 방어구 | 열의+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 방어구 | 수호자 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 맹세+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, STACK_POLICY_REQUIRED |
| 방어구 | 서광 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 방어구 | 등대지기 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 방어구 | 빛살+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, MULTIPLE_SPEED_CHANNELS_COLLAPSED |
| 방어구 | 교차하는 사슬 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 악몽 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, DIRECT_DAMAGE_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE, STACK_POLICY_REQUIRED |
| 방어구 | 끓는 피 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 방어구 | 날 선 적의 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 방어구 | 무덤지기+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 복수+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, STACK_POLICY_REQUIRED |
| 방어구 | 흐릿한 형상 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 방어구 | 잿빛 장막 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 방어구 | 금 간 봉인 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 방어구 | 무너진 경계 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 방어구 | 아귀 | v2: 상시 적용 + 미확정 효과 미반영 | 5초마다 다음 공격 직접 피해·상처: 미반영 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE |
| 방어구 | 부서진 왕관 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE, STACK_POLICY_REQUIRED |
| 방어구 | 거두는 손길 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MANUAL_STAT_DIFFERENCE |
| 방어구 | 무한한 탐욕 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 방어구 | 뼈 인장 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 방어구 | 공허 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 방어구 | 잊힌 맹약 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, MULTIPLE_SPEED_CHANNELS_COLLAPSED |
| 방어구 | 칼바람 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 봉인술사 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | MANUAL_STAT_DIFFERENCE |
| 방어구 | 폭염+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED |
| 방어구 | 별바라기 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 방어구 | 황동 날개 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE |
| 방어구 | 잠들지 않는 불 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 번개 숨결 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MULTIPLE_SPEED_CHANNELS_COLLAPSED |
| 방어구 | 돌 심장 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 방어구 | 용암 비늘 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, DIRECT_DAMAGE_POLICY_REQUIRED |
| 방어구 | 얼음 발톱 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 숲 길잡이 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 바다뱀+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 방어구 | 계승자 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, STACK_POLICY_REQUIRED |
| 방어구 | 잠든 땅 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 방어구 | 비늘 덮인 현자 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE |
| 방어구 | [신화] 용 사냥꾼 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, DIRECT_DAMAGE_POLICY_REQUIRED |
| 방어구 | [신화] 유폐된 어둠 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED |
| 방어구 | [신화] 여신 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 방어구 | [신화] 무형 | 상시·기존 계산값 유지 | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | DIRECT_DAMAGE_POLICY_REQUIRED |
| 방어구 | [신화] 사슬로 묶은 법전 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | MANUAL_STAT_DIFFERENCE |
| 방어구 | [신화] 가라앉은 왕국 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 장신구 | 도약+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 장신구 | 순발력+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 장신구 | 격파+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 장신구 | 약점+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 장신구 | 충돌+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 장신구 | 열혈+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 장신구 | 강격+ | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 장신구 | 전진+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 장신구 | 승천+ | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 엠블럼 | 고결함 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, MANUAL_STAT_DIFFERENCE |
| 엠블럼 | 백금 천칭 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 엠블럼 | 초월 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, DIRECT_DAMAGE_POLICY_REQUIRED |
| 엠블럼 | 침묵 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED |
| 엠블럼 | 해방 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED |
| 엠블럼 | 영원한 밤 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 현행 수동 보정 스탯 적용 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL |
| 엠블럼 | 태초 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED |
| 엠블럼 | 빛바랜 별 | 상시·기존 계산값 유지 | 현행 수동 보정 스탯 적용 | 원문·수동 데이터 일치 |
| 엠블럼 | 위대함 | v1: 기존 룬 단위 가동률 유지 (v2 전환 대기) | 별도 이벤트/속도/스택 정책 확정 전 재해석 금지 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED, DIRECT_DAMAGE_POLICY_REQUIRED |

## 해석 경계

| 범주 | 적용 규칙 |
| --- | --- |
| 상시 공격력%·주는 피해·치명타 피해·재사용 회복 | v2 룬은 어떤 룬 단위 가동률 override에도 축소하지 않는다. |
| 조건부 효과 | `runeId:effectId` 키가 최우선이며, 기존 `룬명:effectId` 및 `룬명`은 읽기 호환만 유지한다. |
| 공격 속도·스킬 사용 속도·캐스팅/차지 속도 | 서로 다른 채널로 보존하며, 평타 이벤트와 시전시간 적용 범위가 확정되기 전 임의 합산하지 않는다. |
| 직접 피해·도트 | 발동 주기·대상수·치명/방어/마도저항·딜사이클 시간 반영이 확정되기 전 전역 DPS에 합산하지 않는다. |
| v1 조건부 동결 | 기존 참조 DPS와 사용자 검수 수치를 보존한다. 원문 문구만으로 효과별 신규 기댓값을 가정하지 않는다. |
