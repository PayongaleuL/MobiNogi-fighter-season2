# 룬 설명 문장 전수 인벤토리

- 원문: `results/260814_룬설명목록.md`
- SHA-256: `A86E44F39200A2872DD15A9C8B2C577B2EAA052F6BF9476B5A2254D61908B93A`
- 룬: **88개**, 문장 레코드: **237개**
- 단순 상시 스탯: **35건**, 효과 모델 필요: **202건**

## 모델 가족 집계

| 모델 가족 | 문장 수 |
| --- | ---: |
| directDamage | 7 |
| durationCooldown | 58 |
| speedOrRecovery | 15 |
| contextOrTrigger | 80 |
| permanentStat | 55 |
| stackOrConsume | 15 |
| nonOutgoingDamage | 7 |

## 문장별 인벤토리

| 룬 | ID | 모델 가족 | 결과 유형 | 문장 |
| --- | --- | --- | --- | --- |
| 눈부신 잔영 | `눈부신잔영:line-1:part-1` | directDamage | effectDpsDelta | 스킬 사용시 다음 기본 공격 적중 시 타겟 주변 3m 범위 내의 적에게 8,341%의1 피해를 추가로 입히고 다음 1회의 공격 속도가 10% 증가한다 |
| 햇살+ | `햇살:line-1:part-1` | durationCooldown | effectDpsDelta | 공격력이 16% 증가하고 재사용 대기시간 회복 속도가 15% 증가한다 |
| 계시+ | `계시:line-1:part-1` | speedOrRecovery | appliedModifier | 공격력이 24% 증가하고 캐스팅 및 차지 속도가 25% 증가한다 |
| 광채+ | `광채:line-1:part-1` | contextOrTrigger | effectDpsDelta | 시 적에게 주는 피해가 20% 증가한다 |
| 광채+ | `광채:line-2:part-1` | directDamage | effectDpsDelta | 지속 피해: 화상 방결; 감전 심판을 보유한 적 공격 시 15초 동안 치명타 피해가 15% 증가한다 |
| 타오르는 영광 | `타오르는영광:line-1:part-1` | permanentStat | appliedModifier | 공격력이 23.5% 증가한다 |
| 타오르는 영광 | `타오르는영광:line-2:part-1` | stackOrConsume | effectDpsDelta | 전투 시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩된다 |
| 타오르는 영광 | `타오르는영광:line-3:part-1` | stackOrConsume | effectDpsDelta | 궁극기 사용 시 모든 불씨름 소모하여 15초 동안 공격력이 소모한 중첩당 3.5% 증가한다 |
| 오랜 광기 | `오랜광기:line-1:part-1` | speedOrRecovery | effectDpsDelta | 적에게 주는 피해가 20% 증가한다 공격 속도 캐스팅 및 차지 속도 스킬 사용 속도가 10% 증가한다 |
| 오랜 광기 | `오랜광기:line-2:part-1` | contextOrTrigger | verifiedZeroDpsDeltaOrTimeConstraint | 전투 중; 5초마다 최대 체력의 10% 만큼 피해를 입는다 |
| 억눌린 충동 | `억눌린충동:line-1:part-1` | permanentStat | appliedModifier | 공격력이 30% 증가한다; 치명타 피해가 5% 증가한다 |
| 억눌린 충동 | `억눌린충동:line-2:part-1` | speedOrRecovery | effectDpsDelta | 이동 속도가 15% 감소한다 |
| 암운+ | `암운:line-1:part-1` | permanentStat | appliedModifier | 강타 피해가 15% 증가한다 |
| 암운+ | `암운:line-2:part-1` | directDamage | effectDpsDelta | 지속 피해: 중독 상처 두려움 절망이 부여된 적 공격 시 타겟 주변 3m 내의 적들에계 24,401의 피해를 주고 15초 동안 스킬 피해가 10% 증가한다 (재사용 대기시간: 5초) |
| 부패+ | `부패:line-1:part-1` | permanentStat | appliedModifier | 공격력이 15% 증가한다 |
| 부패+ | `부패:line-2:part-1` | contextOrTrigger | effectDpsDelta | 전투 중 6초마다 1개씩, 최대 2개까지 충전되논 맹독의 정수를 얻는다 |
| 부패+ | `부패:line-3:part-1` | directDamage | effectDpsDelta | 공격 적중 시; 맹독의 정수를 1개 소모하여 타겟 주변 4m 범위 내의 적에게 43,695의 피해와 65,827의 지속 피해: 중독올 준다 |
| 부패+ | `부패:line-4:part-1` | durationCooldown | effectDpsDelta | (재사용 대기시간: 0.5초) |
| 창백한 기수 | `창백한기수:line-1:part-1` | contextOrTrigger | effectDpsDelta | 궁극기 스킬로 주는 피해가 20% 증가하고 궁극기 게이지 회복량이 20% 감소한다 |
| 창백한 기수 | `창백한기수:line-2:part-1` | contextOrTrigger | effectDpsDelta | 공격력이 17%, 적에게 주는 피해가 17% 증가한다 |
| 거대한 분노 | `거대한분노:line-1:part-1` | stackOrConsume | effectDpsDelta | 적에게 주는 피해가 21% 증가한다 강타 적중 시 스킬 피해가 3% 증가하여 해당 효과는 최대 4회까지 중첩된다 |
| 거대한 분노 | `거대한분노:line-2:part-1` | stackOrConsume | effectDpsDelta | 강타가 아닌 공격 적중 시 효과가 즉시 해제된다 |
| 바위 칼날 | `바위칼날:line-1:part-1` | stackOrConsume | effectDpsDelta | 공격이 적중할 때마다 10초 동안 공격력이 0.7%6, 치명타 확률이 0.5% 증가한다 해당 효과는 최대 30회까지 중첩된다 지속 시간은 스택마다 개별로 유지된다 |
| 두 갈래 별 | `두갈래별:line-1:part-1` | speedOrRecovery | effectDpsDelta | 공격력이 16% 증가한다 기본 공격 사용시 스킬 사용 속도가 5초동안 15% 증가한다 |
| 두 갈래 별 | `두갈래별:line-2:part-1` | durationCooldown | effectDpsDelta | 스킬 사용시 공격 속도가 5초 동안 15% 증가한다 |
| 추적자 | `추적자:line-1:part-1` | directDamage | effectDpsDelta | 강타 피해가 35% 증가한다: 스킬 8회 사용시 주변 10m 범위 내의 적에게 66,395의 피해를 주고 강타 피해가 6초동안 20% 감소한다 |
| 대군주+ | `대군주:line-1:part-1` | contextOrTrigger | effectDpsDelta | 궁극기 스킬로 주는 피해가 20% 증가한다 |
| 대군주+ | `대군주:line-2:part-1` | contextOrTrigger | verifiedZeroDpsDeltaOrTimeConstraint | 궁극기 게이지 회복량이 20% 증가한다 |
| 대군주+ | `대군주:line-3:part-1` | permanentStat | appliedModifier | 공격력이 16% 증가한다 |
| 기본기+ | `기본기:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 20% 증가한다 |
| 첫 번째 서약 | `첫번째서약:line-1:part-1` | permanentStat | appliedModifier | 공격력이 15% 증가한다 |
| 첫 번째 서약 | `첫번째서약:line-2:part-1` | contextOrTrigger | effectDpsDelta | 밤의 축복 스킬 활성화 시, 강타 피해와 치명타 확률, 공격력이 11% 증가한다 |
| 녹슨 방패 | `녹슨방패:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 22% 증가한다 |
| 녹슨 방패 | `녹슨방패:line-2:part-1` | nonOutgoingDamage | verifiedZeroDpsDeltaOrTimeConstraint | 행동 불능에 이르는 공격올 1회 막아주고 체력올 대량 회복한다 |
| 녹슨 방패 | `녹슨방패:line-3:part-1` | durationCooldown | effectDpsDelta | 이 후 3초 동안 받는 피해가 80% 감소한다 |
| 녹슨 방패 | `녹슨방패:line-4:part-1` | durationCooldown | effectDpsDelta | 동일한 행동 불능에 저항하는 효과와 재사용 대기시간을 공유하다 (재사용 대기시간 : 180초) |
| 긍지 | `긍지:line-1:part-1` | nonOutgoingDamage | appliedModifier | 전투 숙련: 지원 보유 시 공격력이 25%, 회복량이 10% 증가한다 |
| 긍지 | `긍지:line-2:part-1` | durationCooldown | effectDpsDelta | 공격 시, 약화 효과: 방어구 파괴를 부여해 10초 동안 받는 피해를 10% 증가시킨다 |
| 긍지 | `긍지:line-3:part-1` | permanentStat | effectDpsDelta | 방어구 파괴는 중복 적용되지 않는다 |
| 긍지 | `긍지:line-3:part-2` | durationCooldown | effectDpsDelta | (재사용 대기시간:1초) |
| 위엄 | `위엄:line-1:part-1` | contextOrTrigger | effectDpsDelta | 전투 숙련: 수호 보유 시 공격력이 16%, 무방비 피해가 32% 증가하여 적에게 받는 피해가 5% 감소한다 |
| 그믐달 | `그믐달:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 15% 증가한다 |
| 그믐달 | `그믐달:line-2:part-1` | permanentStat | appliedModifier | 보유한 자원이 50% 미만일 경우 공격력이 10% 증가한다 |
| 공세+ | `공세:line-1:part-1` | contextOrTrigger | effectDpsDelta | 스킬 사용시 6초동안 적에게 주는 피해가 5.5% 증가한다 |
| 공세+ | `공세:line-1:part-2` | stackOrConsume | effectDpsDelta | 해당 효과는 최대 5회까지 중첩된다 |
| 공세+ | `공세:line-1:part-3` | stackOrConsume | effectDpsDelta | 지속 시간은 스택마다 개별로 유지된다 |
| 정복자+ | `정복자:line-1:part-1` | contextOrTrigger | effectDpsDelta | 공격력이 5%, 적에게 주는 피해가 9% 증가한다 |
| 정복자+ | `정복자:line-2:part-1` | contextOrTrigger | effectDpsDelta | 주위에서 적이 5/10/20명 처치될 경우, 적에게 주는 피해가 3%/6%/12% 증가한다 |
| 은빛 찬가 | `은빛찬가:line-1:part-1` | durationCooldown | effectDpsDelta | 공격력이 5%, 재사용 대기시간 회복 속도가 6% 증가한다 |
| 은빛 찬가 | `은빛찬가:line-2:part-1` | durationCooldown | effectDpsDelta | 주위에서 적이 5/10/20명 처치될 경우 재사용 대기시간 회복속도가 3%/6%/12% 증가한다 |
| 기사단장 | `기사단장:line-1:part-1` | speedOrRecovery | effectDpsDelta | 적에게 주는 피해가 5%, 공격 속도 및 스킬 사용속도가 6% 증가한다 |
| 기사단장 | `기사단장:line-2:part-1` | speedOrRecovery | effectDpsDelta | 주위에서 적이 5/10/20명 처치될 경우, 공격속도 및 스킬 사용 속도가 3%/6%/12% 증가한다 |
| 승전 | `승전:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 5%, 치명타 피해가 10% 증가한다 |
| 승전 | `승전:line-2:part-1` | contextOrTrigger | effectDpsDelta | 주위에서 적이 5/10/20명 처치될 경우, 치명타 피해가 3%/6%/12% 증가한다 |
| 열의+ | `열의:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 7% 증가한다 |
| 열의+ | `열의:line-2:part-1` | speedOrRecovery | effectDpsDelta | 공격 속도가 30% 증가하며, 기본 공격으로 주는 피해가 30% 증가한다 |
| 수호자 | `수호자:line-1:part-1` | contextOrTrigger | effectDpsDelta | 궁극기 게이지 획득랑이 20% 감소한다 |
| 수호자 | `수호자:line-2:part-1` | permanentStat | appliedModifier | 공격력이 24% 증가한다 |
| 수호자 | `수호자:line-3:part-1` | contextOrTrigger | effectDpsDelta | 궁극기 스킬로 주는 피해가 20% 증가한다 |
| 맹세+ | `맹세:line-1:part-1` | permanentStat | appliedModifier | 공격력이 10% 증가한다 |
| 맹세+ | `맹세:line-2:part-1` | durationCooldown | effectDpsDelta | 체력이 50% 이하일 경우 받는 피해가 10% 감소하며, 2초마다 맹세 효과들 얻어 12초 동안 적에게 주는 피해가 3% 증가한다 |
| 맹세+ | `맹세:line-2:part-2` | stackOrConsume | effectDpsDelta | 이 효과는 최대 5회까지 중첩된다 |
| 서광 | `서광:line-1:part-1` | permanentStat | appliedModifier | 공격력이 20% 증가한다 |
| 서광 | `서광:line-2:part-1` | durationCooldown | effectDpsDelta | 브레이크 익스텐드 스킬 사용시 10초 동안 적에게 주는 피해가 20% 증가한다 |
| 등대지기 | `등대지기:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 24% 증가한다 |
| 등대지기 | `등대지기:line-2:part-1` | durationCooldown | effectDpsDelta | 무방비 공격 적중 시, 약화 효과: 방어구 파괴를 부여해 10초 동안 받는 피해를 10% 증가시킨다 |
| 등대지기 | `등대지기:line-2:part-2` | durationCooldown | effectDpsDelta | 방어구 파괴는 중복 적용되지 않는다 (재사용 대기시간: 1초) |
| 빛살+ | `빛살:line-1:part-1` | speedOrRecovery | effectDpsDelta | 적에게 주는 피해가 5.5%, 캐스팅 및 차지 속도,스킬 사용 속도가 5% 증가한다 |
| 빛살+ | `빛살:line-2:part-1` | durationCooldown | effectDpsDelta | 무방비 공격 적중 시 10초 동안 캐스팅 및 차지 속도,스킬 사용 속도가 추가로 20% 증가한다 |
| 교차하는 사슬 | `교차하는사슬:line-1:part-1` | permanentStat | appliedModifier | 공격력이 15% 증가한다 |
| 교차하는 사슬 | `교차하는사슬:line-2:part-1` | contextOrTrigger | effectDpsDelta | 밤의 축복 스킬 활성화 시, 연타 피해와 추가타 확률 공격력이 11% 증가한다 |
| 악몽 | `악몽:line-1:part-1` | contextOrTrigger | effectDpsDelta | 전투 중 4초마다 1개씩, 최대 3개까지 충전되는 불의 정수를 얻는다 |
| 악몽 | `악몽:line-2:part-1` | stackOrConsume | effectDpsDelta | 스킬 사용시 불의 정수를 1개 소모하여 타겟의 위치에 화염 지대름 소환한다 |
| 악몽 | `악몽:line-2:part-2` | contextOrTrigger | effectDpsDelta | 화염 지대는 3초동안 주변 2m 범위 내의 적에게 0.5초마다 8275의 화염 피해를 준다 |
| 악몽 | `악몽:line-2:part-3` | durationCooldown | effectDpsDelta | (재사용 대기시간 0.5초) |
| 악몽 | `악몽:line-3:part-1` | stackOrConsume | effectDpsDelta | 전투 시작 시 3중첩을 즉시 획득안다 |
| 끓는 피 | `끓는피:line-1:part-1` | durationCooldown | effectDpsDelta | 스킬 사용시, 최대 체력의 4% 만큼 피해를 입고 5초 동안 스킬 피해가 24% 증가한다 |
| 끓는 피 | `끓는피:line-1:part-2` | nonOutgoingDamage | verifiedZeroDpsDeltaOrTimeConstraint | 이 효과는 남은 체력이 30% 이상일 때만 발동한다 |
| 날 선 적의 | `날선적의:line-1:part-1` | contextOrTrigger | effectDpsDelta | 공격력이 6%, 치명타 확률, 추가타 확률, 적에게 주는 피해가 6% 증가한다 |
| 날 선 적의 | `날선적의:line-2:part-1` | speedOrRecovery | effectDpsDelta | 이동 속도가 15% 감소한다 |
| 무덤지기+ | `무덤지기:line-1:part-1` | permanentStat | appliedModifier | 공격력이 16% 증가한다 |
| 무덤지기+ | `무덤지기:line-2:part-1` | contextOrTrigger | verifiedZeroDpsDeltaOrTimeConstraint | 자신과 전투 중인 적이 처치되었을 경우 자신의 체력올 11,888만큼 회복한다 |
| 복수+ | `복수:line-1:part-1` | durationCooldown | effectDpsDelta | 피해들 입을 경우 12초 동안 공격력이 5%, 받는 회복량이 2% 증가한다 |
| 복수+ | `복수:line-2:part-1` | stackOrConsume | effectDpsDelta | 이 효과는 최대 5회까지 중첩된다 |
| 흐릿한 형상 | `흐릿한형상:line-1:part-1` | contextOrTrigger | effectDpsDelta | 전투 시 1초마다 침식 수치가 5 증가한다 |
| 흐릿한 형상 | `흐릿한형상:line-1:part-2` | permanentStat | appliedModifier | 침식이 부여된 동안 강타 피해가 18% 증가한다 |
| 흐릿한 형상 | `흐릿한형상:line-2:part-1` | permanentStat | effectDpsDelta | 침식 수치가 100 이상일 경우 효과가 두배로 증가한다 |
| 흐릿한 형상 | `흐릿한형상:line-3:part-1` | durationCooldown | effectDpsDelta | 침식 수치가 300에 도달하면 오염되며, 15초 동안 모든 효과를 잃는다 |
| 흐릿한 형상 | `흐릿한형상:line-4:part-1` | contextOrTrigger | effectDpsDelta | 침식과 오염은 전투 중에만 진행된다 |
| 잿빛 장막 | `잿빛장막:line-1:part-1` | contextOrTrigger | effectDpsDelta | 전투 시 1초마다 침식 수치가 5 증가한다 |
| 잿빛 장막 | `잿빛장막:line-2:part-1` | permanentStat | appliedModifier | 침식이 부여된 동안 연타 피해가 18% 증가한다 |
| 잿빛 장막 | `잿빛장막:line-3:part-1` | permanentStat | effectDpsDelta | 침식 수치가 100 이상일 경우 효과가 두배로 증가한다 |
| 잿빛 장막 | `잿빛장막:line-3:part-2` | durationCooldown | effectDpsDelta | 침식 수치가 300에 도달하면 오염되며, 15초 동안 모든 효과를 잃는다 |
| 잿빛 장막 | `잿빛장막:line-4:part-1` | contextOrTrigger | effectDpsDelta | 침식과 오염은 전투 중에만 진행된다 |
| 금 간 봉인 | `금간봉인:line-1:part-1` | contextOrTrigger | effectDpsDelta | 전투 시 구초마다 침식 수치가 5 증가한다 |
| 금 간 봉인 | `금간봉인:line-2:part-1` | contextOrTrigger | effectDpsDelta | 침식이 부여된 동안 치명타 확률이 16.5% 증가한다 |
| 금 간 봉인 | `금간봉인:line-3:part-1` | permanentStat | effectDpsDelta | 침식 수치가 100 이상일 경우 효과가 두배로 증가한다 |
| 금 간 봉인 | `금간봉인:line-3:part-2` | durationCooldown | effectDpsDelta | 침식 수치가 300에 도달하면 오염되며, 15초 동안 모든 효과를 잃는다 |
| 금 간 봉인 | `금간봉인:line-4:part-1` | contextOrTrigger | effectDpsDelta | 침식과 오염은 전투 중에만 진행된다 |
| 무너진 경계 | `무너진경계:line-1:part-1` | contextOrTrigger | effectDpsDelta | 전투 시, 1초마다 침식 수치가 5 증가한다 |
| 무너진 경계 | `무너진경계:line-2:part-1` | contextOrTrigger | effectDpsDelta | 침식이 부여된 동안 추가타 확률이 16.5% 증가한다 |
| 무너진 경계 | `무너진경계:line-3:part-1` | permanentStat | effectDpsDelta | 침식 수치가 100 이상일 경우 효과가 두배로 증가한다 |
| 무너진 경계 | `무너진경계:line-3:part-2` | durationCooldown | effectDpsDelta | 침식 수치가 300에 도달하면 오염되며, 15초 동안 모든 효과를 잃는다 |
| 무너진 경계 | `무너진경계:line-4:part-1` | contextOrTrigger | effectDpsDelta | 침식과 오염은 전투 중에만 진행된다 |
| 아귀 | `아귀:line-1:part-1` | directDamage | effectDpsDelta | 매 5초마다 다음 공격 시 12413의 피해와 31328의 지속 피해:상처 를 추가로 준다 |
| 아귀 | `아귀:line-2:part-1` | contextOrTrigger | effectDpsDelta | 공격력이 15%, 무방비 피해가 12% 증가한다 |
| 부서진 왕관 | `부서진왕관:line-1:part-1` | durationCooldown | effectDpsDelta | 전투 중, 5초마다 자신 주위 5m 범위 내에 15초 동안 지속되는 마력의 원을 생성한다 |
| 부서진 왕관 | `부서진왕관:line-2:part-1` | stackOrConsume | effectDpsDelta | 마력의 원에 올라설 경우, 15초 동안 공격력이 4%, 강타 피해가 4.5% 증가한다 최대 3회까지 중첩된다 |
| 거두는 손길 | `거두는손길:line-1:part-1` | durationCooldown | effectDpsDelta | 전투 시작 시, 15초 동안 적에게 주는 피해가 26% 증가한다 |
| 거두는 손길 | `거두는손길:line-2:part-1` | contextOrTrigger | effectDpsDelta | 자신과 전투 중인 적이 처치되었을 경우 재발동한다 |
| 무한한 탐욕 | `무한한탐욕:line-1:part-1` | stackOrConsume | effectDpsDelta | 스킬 자원을 소모하는 스킬로 주는 피해가 38% 증가한다 |
| 무한한 탐욕 | `무한한탐욕:line-2:part-1` | durationCooldown | effectDpsDelta | 재사용 대기시간 회복 속도가 10% 감소한다 |
| 뼈 인장 | `뼈인장:line-1:part-1` | permanentStat | appliedModifier | 액티브 3번 슬롯 스킬로 주는 피해가 53% 증가한다 |
| 공허 | `공허:line-1:part-1` | contextOrTrigger | effectDpsDelta | 스킬 회 사용 시, 모든 스킬의 재사용 대기 시간이 3초 감소한다 |
| 공허 | `공허:line-2:part-1` | permanentStat | appliedModifier | 공격력이 5% 증가한다 |
| 잊힌 맹약 | `잊힌맹약:line-1:part-1` | permanentStat | appliedModifier | 공격력이 15% 증가한다 |
| 잊힌 맹약 | `잊힌맹약:line-2:part-1` | durationCooldown | effectDpsDelta | 밤의 축복 스킬 활성화 시, 스킬 사용 속도,캐스팅 및 차지 속도, 재사용 대기시간 회복 속도가 13% 증가한다 |
| 칼바람 | `칼바람:line-1:part-1` | contextOrTrigger | effectDpsDelta | 브레이크 스킬로 주는 피해가 29% 증가한다 |
| 칼바람 | `칼바람:line-2:part-1` | durationCooldown | effectDpsDelta | 브레이크 스킬 사용시, 7초 동안 치명타 피해가 10% 증가한다 |
| 봉인술사 | `봉인술사:line-1:part-1` | speedOrRecovery | appliedModifier | 캐스팅 및 차지 속도가 15% 증가한다 |
| 봉인술사 | `봉인술사:line-2:part-1` | permanentStat | appliedModifier | 캐스팅 및 차지 스킬로 주는 피해가 25% 증가한다 |
| 폭염+ | `폭염:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 5% 증가한다 |
| 폭염+ | `폭염:line-1:part-2` | directDamage | effectDpsDelta | 전투 시, 2초마다 자신 주변 4m 범위 내의 모든 적에게 26599의 피해와 12413의 지속 피해: 화상을 준다 |
| 별바라기 | `별바라기:line-1:part-1` | permanentStat | effectDpsDelta | 용의 문장(최대 2개) |
| 별바라기 | `별바라기:line-2:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 10% 증가한다 |
| 별바라기 | `별바라기:line-3:part-1` | durationCooldown | effectDpsDelta | 공격 시 10초 동안 용의 문장을 활성화한다 |
| 별바라기 | `별바라기:line-3:part-2` | durationCooldown | effectDpsDelta | (재사용 대기시간 : 20초) |
| 별바라기 | `별바라기:line-4:part-1` | permanentStat | appliedModifier | 용의 문장이 활성화된 동안 공격력이 14% 증가한다 |
| 황동 날개 | `황동날개:line-1:part-1` | permanentStat | effectDpsDelta | 용의 문장(최대 2개) |
| 황동 날개 | `황동날개:line-2:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 10% 증가한다 |
| 황동 날개 | `황동날개:line-3:part-1` | durationCooldown | effectDpsDelta | 궁극기 사용시 10초 동안 용의 문장을 활성화한다 |
| 황동 날개 | `황동날개:line-3:part-2` | durationCooldown | effectDpsDelta | (재사용 대기시간 : 20초) |
| 황동 날개 | `황동날개:line-4:part-1` | contextOrTrigger | effectDpsDelta | 용의 문장이 활성화된 동안 적에게 주는 피해가 14% 증가한다 |
| 잠들지 않는 불 | `잠들지않는불:line-1:part-1` | permanentStat | effectDpsDelta | 용의 문장(최대 2개) |
| 잠들지 않는 불 | `잠들지않는불:line-2:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 10% 증가한다 |
| 잠들지 않는 불 | `잠들지않는불:line-3:part-1` | durationCooldown | effectDpsDelta | 용의 문장의 지속 시간이 10초만큼 증가한다 |
| 잠들지 않는 불 | `잠들지않는불:line-4:part-1` | contextOrTrigger | effectDpsDelta | 용의 문장이 활성화된 동안 치명타 확률이 12.5% 증가한다 |
| 번개 숨결 | `번개숨결:line-1:part-1` | permanentStat | effectDpsDelta | 용의 문장(최대 2개) |
| 번개 숨결 | `번개숨결:line-2:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 10% 증가한다 |
| 번개 숨결 | `번개숨결:line-3:part-1` | speedOrRecovery | appliedModifier | 용의 문장이 활성화된 동안 스킬 사용 속도, 캐스팅 및 차지 속도가 17%, 강타 피해가 18% 증가한다 |
| 돌 심장 | `돌심장:line-1:part-1` | permanentStat | effectDpsDelta | 용의 문장(최대 2개) |
| 돌 심장 | `돌심장:line-2:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 10% 증가한다 |
| 돌 심장 | `돌심장:line-3:part-1` | durationCooldown | effectDpsDelta | 용의 문장이 활성화된 동안 재사용 대기시간 회복 속도가 20%, 연타 피해가 18% 증가한다 |
| 용암 비늘 | `용암비늘:line-1:part-1` | permanentStat | effectDpsDelta | 용의 문장(최대 2개) |
| 용암 비늘 | `용암비늘:line-2:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 10% 증가한다 |
| 용암 비늘 | `용암비늘:line-3:part-1` | durationCooldown | effectDpsDelta | 공격 시 10초 동안 용의 문장들 활성화한다 |
| 용암 비늘 | `용암비늘:line-3:part-2` | durationCooldown | effectDpsDelta | (재사용 대기시간 : 20초) |
| 용암 비늘 | `용암비늘:line-4:part-1` | contextOrTrigger | effectDpsDelta | 용의 문장이 활성화된 동안 1초마다 가장 가까운 적에게 5911의 피해를 준다 |
| 얼음 발톱 | `얼음발톱:line-1:part-1` | permanentStat | effectDpsDelta | 용의 문장(최대 2개) |
| 얼음 발톱 | `얼음발톱:line-2:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 10% 증가한다 |
| 얼음 발톱 | `얼음발톱:line-3:part-1` | durationCooldown | effectDpsDelta | 용의 문장의 지속 시간이 10초만큼 증가한다 |
| 얼음 발톱 | `얼음발톱:line-4:part-1` | contextOrTrigger | effectDpsDelta | 용의 문장이 활성화된 동안 추가타 확률이 12.5% 증가한다 |
| 숲 길잡이 | `숲길잡이:line-1:part-1` | speedOrRecovery | effectDpsDelta | 이동 속도가 10% 증가한다 |
| 숲 길잡이 | `숲길잡이:line-2:part-1` | durationCooldown | effectDpsDelta | 공격 10회 적중 혹은 5m름 이동할 경우, 10초 동안 이동 속도를 추가로 5%, 적에게 주는 피해를 21% 증가시킨다 |
| 바다뱀+ | `바다뱀:line-1:part-1` | speedOrRecovery | appliedModifier | 공격력이 5%, 스킬 사용 속도가 5% 증가한다 |
| 바다뱀+ | `바다뱀:line-2:part-1` | permanentStat | appliedModifier | 채널링 스킬로 주는 피해가 31% 증가한다 |
| 계승자 | `계승자:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 13% 증가한다 |
| 계승자 | `계승자:line-2:part-1` | permanentStat | appliedModifier | 스킬 사용시, 스킬 피해가 6.5% 증가한다 |
| 계승자 | `계승자:line-2:part-2` | stackOrConsume | effectDpsDelta | 이 효과는 최대 5회까지 중첩되며, 최대 중첩을 초과하여 발동 시 효과가 초기화된다 |
| 잠든 땅 | `잠든땅:line-1:part-1` | nonOutgoingDamage | verifiedZeroDpsDeltaOrTimeConstraint | 받는 회복량이 60% 감소한다 |
| 잠든 땅 | `잠든땅:line-2:part-1` | permanentStat | appliedModifier | 연타 피해가 13%, 강타 피해가 13% 증가한다 |
| 비늘 덮인 현자 | `비늘덮인현자:line-1:part-1` | durationCooldown | effectDpsDelta | 아군 치유 시, 15초 동안 자신의 공격력이 20% 증가한다 |
| 비늘 덮인 현자 | `비늘덮인현자:line-2:part-1` | durationCooldown | verifiedZeroDpsDeltaOrTimeConstraint | 추가로 회복된 아군 근처에 10초 동안 지속되는 회복 구슬블 생성한다 |
| 비늘 덮인 현자 | `비늘덮인현자:line-2:part-2` | durationCooldown | effectDpsDelta | (재사용 대기시간: 5초) |
| 비늘 덮인 현자 | `비늘덮인현자:line-3:part-1` | durationCooldown | effectDpsDelta | 회복 구슬을 획득한 대상의 최대 체력올 2% 회복시키고, 15초 동안 공격력을 5%만큼 증가시킨다 |
| [신화] 용 사냥꾼 | `[신화]용사냥꾼:line-1:part-1` | contextOrTrigger | effectDpsDelta | 치명타 확률이 10%, 치명타 피해가 10% 증가한다 |
| [신화] 용 사냥꾼 | `[신화]용사냥꾼:line-2:part-1` | nonOutgoingDamage | verifiedZeroDpsDeltaOrTimeConstraint | 퀵슬롯의 회복 물약 개수가 2개 증가한다, 붕대 개수가 2개 증가한다 |
| [신화] 용 사냥꾼 | `[신화]용사냥꾼:line-3:part-1` | durationCooldown | effectDpsDelta | 퀵슬롯 아이템 사용 시 마력탄을 발사해 타겟 방향의 적에게 17142의 피해를 주고 60초 동안 적에게 주는 피해가 5% 증가한다 |
| [신화] 용 사냥꾼 | `[신화]용사냥꾼:line-3:part-2` | durationCooldown | effectDpsDelta | (재사용 대기시간: 3초) |
| [신화] 유폐된 어둠 | `[신화]유폐된어둠:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 10% 증가한다 |
| [신화] 유폐된 어둠 | `[신화]유폐된어둠:line-2:part-1` | durationCooldown | effectDpsDelta | 3초마다 타겟 주변 적 최대 3명에게 어둠의 화살을 발사하여 12413의 피해를 주고 약화 효과: 방어구 파괴를 부여해 10초 동안 받는 피해를 10% 증가시킨다 |
| [신화] 유폐된 어둠 | `[신화]유폐된어둠:line-3:part-1` | stackOrConsume | effectDpsDelta | 밤의 축복 스킬이 활성화된 동안 발사 횟수가 2배로 증가한다 |
| [신화] 유폐된 어둠 | `[신화]유폐된어둠:line-4:part-1` | permanentStat | effectDpsDelta | 방어구 파괴는 중복 적용되지 않는다 |
| [신화] 여신 | `[신화]여신:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 29% 증가한다 |
| [신화] 여신 | `[신화]여신:line-2:part-1` | permanentStat | appliedModifier | 적색,청색,녹색,무색,황금색 팔라딘 아티팩트를 모두 1개 이상 장작햇을 경우, 받는 피해가 10% 감소한다 |
| [신화] 여신 | `[신화]여신:line-3:part-1` | nonOutgoingDamage | verifiedZeroDpsDeltaOrTimeConstraint | 행동 불능에 이르는 공격올 1회 막아주고 체력을 대량 회복한다 |
| [신화] 여신 | `[신화]여신:line-3:part-2` | durationCooldown | effectDpsDelta | 이 후 3초 동안 받는 피해가 80% 감소한다 |
| [신화] 여신 | `[신화]여신:line-3:part-3` | durationCooldown | effectDpsDelta | 동일한 행동 불능에 저항하는 효과와 재사용 대기시간을 공유하다 |
| [신화] 여신 | `[신화]여신:line-3:part-4` | durationCooldown | effectDpsDelta | (재사용 대기시간 : 180초) |
| [신화] 무형 | `[신화]무형:line-1:part-1` | speedOrRecovery | effectDpsDelta | 저주 룬 착용 시, 적에게 주는 피해와 받는 피해가 30% 증가하고 이동 속도 감소효과가 사라진다 |
| [신화] 무형 | `[신화]무형:line-2:part-1` | permanentStat | effectDpsDelta | 침식 룬 착용 시, 5초마다 타겟 방향의 적들에게 92804의 피해를 준다 |
| [신화] 무형 | `[신화]무형:line-3:part-1` | permanentStat | appliedModifier | 용의 문장 룬 착용시 스킬 피해가 27% 증가한다 |
| [신화] 무형 | `[신화]무형:line-4:part-1` | permanentStat | appliedModifier | 순서대로 하나의 효과만 적용된다, 활성화되지 않은 경우 공격력이 29% 증가한다 |
| [신화] 사슬로 묶은 법전 | `[신화]사슬로묶은법전:line-1:part-1` | contextOrTrigger | effectDpsDelta | 도발 시 적에게 주는 피해가 26%, 무방비 피해가 16% 증가한다 |
| [신화] 사슬로 묶은 법전 | `[신화]사슬로묶은법전:line-2:part-1` | nonOutgoingDamage | appliedModifier | 아군 치유 시 공격력이 25%, 재사용 대기 시간 회복 속도가 4% 증가한다 |
| [신화] 사슬로 묶은 법전 | `[신화]사슬로묶은법전:line-3:part-1` | contextOrTrigger | effectDpsDelta | 하나의 효과만 적용되며, 활성화되지 않은 경우 적에게 주는 피해가 29% 증가한다 |
| [신화] 가라앉은 왕국 | `[신화]가라앉은왕국:line-1:part-1` | contextOrTrigger | effectDpsDelta | 공격력이 15%, 궁극기 스킬로 주는 피해가 10% 증가한다 |
| [신화] 가라앉은 왕국 | `[신화]가라앉은왕국:line-1:part-2` | durationCooldown | effectDpsDelta | 궁극기 사용시 30초동안 재사용 대기시간 회복 속도가 8% 증가하며, 10초 동안 속박 상태가 된다 |
| 도약+ | `도약:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬:2 변화 |
| 도약+ | `도약:line-2:part-1` | contextOrTrigger | effectDpsDelta | 공격범위 커짐, 이동거리에 비례해 거리가 멀 수록 적에게 더 큰 피해를 준다 |
| 도약+ | `도약:line-3:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 순발력+ | `순발력:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬: 3 변화 |
| 순발력+ | `순발력:line-2:part-1` | speedOrRecovery | effectDpsDelta | 백 스텝으로 적에게 피해를 주면 적의 이동 속도가 느려진다 |
| 순발력+ | `순발력:line-3:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 격파+ | `격파:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬: 4 변화 |
| 격파+ | `격파:line-2:part-1` | contextOrTrigger | effectDpsDelta | 버스트 펀치 적중 시, 주변에 또다른 적이 없다면 타겟에게 추가 공격올 가한다 |
| 격파+ | `격파:line-3:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 약점+ | `약점:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬: 1 변화 |
| 약점+ | `약점:line-2:part-1` | permanentStat | effectDpsDelta | 차징 동작이 사라지고 카운터 시 약화 효과: 약점 노출올 남긴다 |
| 약점+ | `약점:line-3:part-1` | contextOrTrigger | effectDpsDelta | 약점 노출이 부여된 적에게 가하능 다음 교회의 콤보스킬은 방어력올 일부 무시하고 치명타 확률이 증가한다 |
| 약점+ | `약점:line-4:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 충돌+ | `충돌:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬: 1 변화 |
| 충돌+ | `충돌:line-2:part-1` | contextOrTrigger | effectDpsDelta | 타격한 적들 멀리 날리고 날아간 적이 충돌한 지점 주변의 적에게 범위 피해를 준다 |
| 충돌+ | `충돌:line-3:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 열혈+ | `열혈:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬: 5 변화 |
| 열혈+ | `열혈:line-2:part-1` | contextOrTrigger | effectDpsDelta | 검날의 형태로 발산해 전방의 적에게 범위 피해를 준다 |
| 열혈+ | `열혈:line-3:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 강격+ | `강격:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬: 5 변화 |
| 강격+ | `강격:line-2:part-1` | durationCooldown | effectDpsDelta | 연속기 스킬 동작이 사라지고, 섬머솔트가 카운터로 적중 시 재사용 대기시간이 감소한다 |
| 강격+ | `강격:line-3:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 전진+ | `전진:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬: 2 변화 |
| 전진+ | `전진:line-2:part-1` | permanentStat | appliedModifier | 돌진 스킬로 변경되며, 마지막 연속기 스킬,콤보스킬 피해량이 증가한다 |
| 전진+ | `전진:line-3:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 승천+ | `승천:line-1:part-1` | permanentStat | effectDpsDelta | 액티브스킬: 4 변화 |
| 승천+ | `승천:line-2:part-1` | contextOrTrigger | effectDpsDelta | 타겟에게 이동하여 어퍼컷으로 피해를 주며, 일정 확률로 추가 스킬 발동이 가능해진다 |
| 승천+ | `승천:line-3:part-1` | contextOrTrigger | effectDpsDelta | 초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다 |
| 고결함 | `고결함:line-1:part-1` | durationCooldown | effectDpsDelta | 스킬 사용 속도가 15%, 재사용 대기시간 회복 속도가 10% 증가한다 |
| 고결함 | `고결함:line-2:part-1` | durationCooldown | effectDpsDelta | 밤의 축복 스킬 활성화 시, 15초 동안 적에게 주는 피해가 48% 증가한다 |
| 백금 천칭 | `백금천칭:line-1:part-1` | durationCooldown | effectDpsDelta | 스킬 사용시, 기본 공격의 추가타 확률이 10초 동안 21% 증가한다 |
| 백금 천칭 | `백금천칭:line-2:part-1` | durationCooldown | effectDpsDelta | 기본 공격 사용시 적에게 주는 피해가 10초 동안 21% 증가한다 |
| 백금 천칭 | `백금천칭:line-3:part-1` | permanentStat | effectDpsDelta | 두효과가 모두 활성화되 경우 증가랑이 1.5배가 된다 |
| 초월 | `초월:line-1:part-1` | durationCooldown | effectDpsDelta | 추가타를 5회 적중시킬 경우 다음 공격 적중 시 24235의 피해를 주고, 적에게 주는 피해가 10초 동안 15% 증가한다 |
| 초월 | `초월:line-2:part-1` | contextOrTrigger | effectDpsDelta | 치명타를 5회 적중시킬 경우 다음 공격 적중 시 24235의 피해를 주고, 치명타 피해가 10초동안 15% 증가한다 |
| 초월 | `초월:line-2:part-2` | durationCooldown | effectDpsDelta | (재사용 대기시간: 각 4초) |
| 침묵 | `침묵:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 33% 증가한다 |
| 침묵 | `침묵:line-2:part-1` | contextOrTrigger | effectDpsDelta | 밤의 축복 스킬 활성화 시, 자신 주변 12m 범위 내의 모든 적에게 229941의 피해를 준다 |
| 해방 | `해방:line-1:part-1` | permanentStat | appliedModifier | 연타 피해가 25% 증가한다 |
| 해방 | `해방:line-2:part-1` | durationCooldown | effectDpsDelta | 밤의 축복 스킬 활성화 시, 15초 동안 연타 피해가 40% 추가로 증가하며, 공격 적중 시 타겟에게 13004의 피해를 준다 |
| 해방 | `해방:line-2:part-2` | permanentStat | effectDpsDelta | (재사용 대기 시간: 1초) |
| 영원한 밤 | `영원한밤:line-1:part-1` | contextOrTrigger | effectDpsDelta | 공격력이 7%, 강타 피해, 연타 피해, 치명타 확률, 추가타 확률이 7% 증가한다 |
| 영원한 밤 | `영원한밤:line-2:part-1` | durationCooldown | effectDpsDelta | 오염의 지속 시간이 33% 감소한다 |
| 태초 | `태초:line-1:part-1` | permanentStat | appliedModifier | 스킬 피해가 20% 증가한다 |
| 태초 | `태초:line-2:part-1` | durationCooldown | effectDpsDelta | 밤의 축복 스킬 활성화 시 모든 스킬의 재사용 대기시간이 초기화된다 |
| 빛바랜 별 | `빛바랜별:line-1:part-1` | contextOrTrigger | effectDpsDelta | 적에게 주는 피해가 31% 증가한다 |
| 빛바랜 별 | `빛바랜별:line-2:part-1` | contextOrTrigger | effectDpsDelta | 무방비 피해가 31% 증가한다 |
| 위대함 | `위대함:line-1:part-1` | permanentStat | appliedModifier | 강타 피해가 25% 증가한다 |
| 위대함 | `위대함:line-2:part-1` | durationCooldown | effectDpsDelta | 밤의 축복 스킬 활성화 시, 15초 동안 강타 피해가 40% 추가로 증가하며, 공격 적중 시 타겟 주변 3m 범위 내의 적에게 10048의 피해를 준다 (재사용 대기시간: 1초) |
