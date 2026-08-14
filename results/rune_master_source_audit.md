# 시즌2 룬 마스터 원문 읽기 전용 감사

**생성 시각:** 2026-08-14T07:48:05.365Z

**권위 원문:** `results/260814_룬설명목록.md` (SHA-256: `A86E44F39200A2872DD15A9C8B2C577B2EAA052F6BF9476B5A2254D61908B93A`)

> 이 보고서는 원문과 계산 데이터를 변경하지 않는다. 충돌은 오류 확정이 아니라, P2의 효과 ID·단위·쿨다운·스택·속도·직접 피해 결정 테이블에서 재판정할 입력이다. `unresolved` 효과는 숫자 0%가 아니라 DPS 미포함 및 영향 N/A로 처리해야 한다.

## 범위 요약

| 항목 | 값 |
| --- | --- |
| matchedByName | 88 |
| aliasMappings | 1 |
| missingInJson | 0 |
| jsonOnly | 0 |
| recordsWithConflicts | 73 |
| manualStatDifferences | 32 |
| conditionalModelReview | 67 |
| speedChannelReview | 6 |
| directDamageReview | 16 |
| stackPolicyReview | 8 |
| cooldownPolicyReview | 23 |
| ocrOrTierReview | 5 |

## 이름 정규화 별칭

| 마스터 원문명 | 현행 데이터명 | 근거 |
| --- | --- | --- |
| 그믐달 | 그음달 | 사용자 검수 이름 정규화 별칭 |

## 충돌 코드별 대상

| 코드 | 대상 수 | 대상 |
| --- | --- | --- |
| CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 67 | 눈부신 잔영, 햇살+, 오랜 광기, 암운+, 부패+, 창백한 기수, 거대한 분노, 바위 칼날, 두 갈래 별, 추적자, 대군주+, 첫 번째 서약, 녹슨 방패, 긍지, 그믐달, 공세+, 정복자+, 은빛 찬가, 기사단장, 승전, 열의+, 수호자, 맹세+, 서광, 등대지기, 빛살+, 교차하는 사슬, 악몽, 끓는 피, 무덤지기+, 복수+, 흐릿한 형상, 잿빛 장막, 금 간 봉인, 무너진 경계, 아귀, 부서진 왕관, 거두는 손길, 무한한 탐욕, 잊힌 맹약, 칼바람, 폭염+, 별바라기, 황동 날개, 잠들지 않는 불, 번개 숨결, 돌 심장, 용암 비늘, 얼음 발톱, 숲 길잡이, 바다뱀+, 계승자, 비늘 덮인 현자, [신화] 용 사냥꾼, [신화] 유폐된 어둠, [신화] 여신, [신화] 가라앉은 왕국, 격파+, 강격+, 고결함, 백금 천칭, 초월, 침묵, 해방, 영원한 밤, 태초, 위대함 |
| COOLDOWN_POLICY_REQUIRED | 23 | 햇살+, 암운+, 부패+, 녹슨 방패, 긍지, 은빛 찬가, 등대지기, 악몽, 무한한 탐욕, 잊힌 맹약, 별바라기, 황동 날개, 돌 심장, 용암 비늘, 비늘 덮인 현자, [신화] 용 사냥꾼, [신화] 여신, [신화] 가라앉은 왕국, 강격+, 고결함, 초월, 태초, 위대함 |
| DIRECT_DAMAGE_POLICY_REQUIRED | 16 | 눈부신 잔영, 광채+, 암운+, 부패+, 추적자, 악몽, 아귀, 폭염+, 용암 비늘, [신화] 용 사냥꾼, [신화] 유폐된 어둠, [신화] 무형, 초월, 침묵, 해방, 위대함 |
| MANUAL_STAT_DIFFERENCE | 32 | 광채+, 타오르는 영광, 창백한 기수, 바위 칼날, 두 갈래 별, 추적자, 녹슨 방패, 위엄, 공세+, 정복자+, 은빛 찬가, 기사단장, 승전, 열의+, 맹세+, 서광, 빛살+, 악몽, 끓는 피, 복수+, 흐릿한 형상, 잿빛 장막, 금 간 봉인, 무너진 경계, 아귀, 부서진 왕관, 거두는 손길, 봉인술사, 황동 날개, 비늘 덮인 현자, [신화] 사슬로 묶은 법전, 고결함 |
| MULTIPLE_SPEED_CHANNELS_COLLAPSED | 6 | 오랜 광기, 두 갈래 별, 기사단장, 빛살+, 잊힌 맹약, 번개 숨결 |
| OCR_OR_TIER_TEXT_REVIEW_REQUIRED | 5 | 바위 칼날, 정복자+, 은빛 찬가, 기사단장, 승전 |
| STACK_POLICY_REQUIRED | 8 | 거대한 분노, 바위 칼날, 공세+, 맹세+, 악몽, 복수+, 부서진 왕관, 계승자 |

## 재판정 필요 항목

| 룬 | 부위 | 감사 코드 | 수치 차이(원문 파서 → 현행) | 원문 속도 용어 | 현행 조건부 효과 수 |
| --- | --- | --- | --- | --- | --- |
| 눈부신 잔영 | 무기 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED | — | 공격 속도 | 0 |
| 햇살+ | 무기 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 광채+ | 무기 | MANUAL_STAT_DIFFERENCE, DIRECT_DAMAGE_POLICY_REQUIRED | 주는피해%: 0.2 → 0; 치명타피해%: 0.15 → 0; 가동률: 1 → 0.7 | — | 1 |
| 타오르는 영광 | 무기 | MANUAL_STAT_DIFFERENCE | 가동률: 1 → 0.13 | — | 1 |
| 오랜 광기 | 무기 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MULTIPLE_SPEED_CHANNELS_COLLAPSED | — | 공격 속도, 스킬 사용 속도, 캐스팅 및 차지 속도 | 0 |
| 암운+ | 무기 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 부패+ | 무기 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 창백한 기수 | 무기 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 주는피해%: 0.17 → 0.2 | — | 0 |
| 거대한 분노 | 무기 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, STACK_POLICY_REQUIRED | — | — | 0 |
| 바위 칼날 | 무기 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, OCR_OR_TIER_TEXT_REVIEW_REQUIRED, STACK_POLICY_REQUIRED | 가동률: 1 → 0.7 | — | 0 |
| 두 갈래 별 | 무기 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MULTIPLE_SPEED_CHANNELS_COLLAPSED | 가동률: 1 → 0.7 | 공격 속도, 스킬 사용 속도 | 0 |
| 추적자 | 무기 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED | 가동률: 1 → 0.4 | — | 0 |
| 대군주+ | 무기 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 첫 번째 서약 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 녹슨 방패 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | 가동률: 1 → 0.01 | — | 0 |
| 긍지 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 위엄 | 방어구 | MANUAL_STAT_DIFFERENCE | 콤보피해%: 0 → 0.32 | — | 0 |
| 그믐달 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 공세+ | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, STACK_POLICY_REQUIRED | 가동률: 1 → 0.7 | — | 0 |
| 정복자+ | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, OCR_OR_TIER_TEXT_REVIEW_REQUIRED | 주는피해%: 0.03 → 0.09 | — | 0 |
| 은빛 찬가 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, OCR_OR_TIER_TEXT_REVIEW_REQUIRED, COOLDOWN_POLICY_REQUIRED | 재사용회복%: 0.03 → 0.06 | — | 0 |
| 기사단장 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MULTIPLE_SPEED_CHANNELS_COLLAPSED, OCR_OR_TIER_TEXT_REVIEW_REQUIRED | 스킬속도%: 0.03 → 0.06 | 공격 속도, 스킬 사용 속도 | 0 |
| 승전 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, OCR_OR_TIER_TEXT_REVIEW_REQUIRED | 치명타피해%: 0.03 → 0.1 | — | 0 |
| 열의+ | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 주는피해%: 0.3 → 0.07 | 공격 속도 | 0 |
| 수호자 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 맹세+ | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, STACK_POLICY_REQUIRED | 가동률: 1 → 0.7 | — | 0 |
| 서광 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 가동률: 1 → 0.7 | — | 0 |
| 등대지기 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 빛살+ | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MULTIPLE_SPEED_CHANNELS_COLLAPSED | 가동률: 1 → 0.7 | 스킬 사용 속도, 캐스팅 및 차지 속도 | 0 |
| 교차하는 사슬 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 악몽 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, STACK_POLICY_REQUIRED, COOLDOWN_POLICY_REQUIRED | 가동률: 1 → 0.7 | — | 0 |
| 끓는 피 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 가동률: 1 → 0.7 | — | 0 |
| 무덤지기+ | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 복수+ | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, STACK_POLICY_REQUIRED | 가동률: 1 → 0.7 | — | 0 |
| 흐릿한 형상 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 가동률: 1 → 0.7 | — | 0 |
| 잿빛 장막 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 가동률: 1 → 0.7 | — | 0 |
| 금 간 봉인 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 가동률: 1 → 0.7 | — | 0 |
| 무너진 경계 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 가동률: 1 → 0.7 | — | 0 |
| 아귀 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED | 콤보피해%: 0 → 0.12 | — | 0 |
| 부서진 왕관 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, STACK_POLICY_REQUIRED | 가동률: 1 → 0.7 | — | 0 |
| 거두는 손길 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | 가동률: 1 → 0.7 | — | 0 |
| 무한한 탐욕 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 잊힌 맹약 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MULTIPLE_SPEED_CHANNELS_COLLAPSED, COOLDOWN_POLICY_REQUIRED | — | 스킬 사용 속도, 캐스팅 및 차지 속도 | 0 |
| 칼바람 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 봉인술사 | 방어구 | MANUAL_STAT_DIFFERENCE | 가동률: 1 → 0.7 | 캐스팅 및 차지 속도 | 0 |
| 폭염+ | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED | — | — | 0 |
| 별바라기 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 황동 날개 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | 주는피해%: 0.14 → 0.1 | — | 0 |
| 잠들지 않는 불 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 번개 숨결 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, MULTIPLE_SPEED_CHANNELS_COLLAPSED | — | 스킬 사용 속도, 캐스팅 및 차지 속도 | 0 |
| 돌 심장 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 용암 비늘 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 얼음 발톱 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 숲 길잡이 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 바다뱀+ | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | 스킬 사용 속도 | 0 |
| 계승자 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, STACK_POLICY_REQUIRED | — | — | 0 |
| 비늘 덮인 현자 | 방어구 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | 공격력%: 0.05 → 0.2 | — | 0 |
| [신화] 용 사냥꾼 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| [신화] 유폐된 어둠 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED | — | — | 0 |
| [신화] 여신 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| [신화] 무형 | 방어구 | DIRECT_DAMAGE_POLICY_REQUIRED | — | — | 0 |
| [신화] 사슬로 묶은 법전 | 방어구 | MANUAL_STAT_DIFFERENCE | 주는피해%: 0.29 → 0.26 | — | 0 |
| [신화] 가라앉은 왕국 | 방어구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 격파+ | 장신구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 강격+ | 장신구 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 고결함 | 엠블럼 | MANUAL_STAT_DIFFERENCE, CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | 주는피해%: 0 → 0.48 | 스킬 사용 속도 | 0 |
| 백금 천칭 | 엠블럼 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 초월 | 엠블럼 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 침묵 | 엠블럼 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED | — | — | 0 |
| 해방 | 엠블럼 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED | — | — | 0 |
| 영원한 밤 | 엠블럼 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL | — | — | 0 |
| 태초 | 엠블럼 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, COOLDOWN_POLICY_REQUIRED | — | — | 0 |
| 위대함 | 엠블럼 | CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL, DIRECT_DAMAGE_POLICY_REQUIRED, COOLDOWN_POLICY_REQUIRED | — | — | 0 |

## 현재 골든 기준선

| 참조 프리셋 | 계산 DPS | 실전 대비 편차 |
| --- | --- | --- |
| 예시 1 · 함선허수 약승열 풀오토 (991.7만) | 9777913 | -1.4% |
| 예시 2 · 함선허수 약승열 풀오토 (946.2만) | 9777913 | 3.34% |
| 예시 3 · 함선허수 전승강 (1059.4만) | 11403780 | 7.64% |
| 예시 4 · 함선허수 전승강 (1117.8만) | 11403780 | 2.02% |
| 예시 5 · 함선허수 전승강 (1083.5만) | 11403780 | 5.25% |

## 다음 HOLD 게이트

상시 효과·수동 보정의 차이는 이 보고서만으로 자동 교정하지 않는다. 먼저 효과별 불변 `runeId:effectCode`, override 단위, 쿨다운·충전·스택·패널티 상태 전이, 평타/스킬 속도 채널, 직접 피해의 스케일링·치명·방어·마도저항·대상 수 정책을 결정 테이블과 단위 테스트로 확정해야 한다.
