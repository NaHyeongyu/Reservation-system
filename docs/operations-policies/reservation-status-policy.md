# 예약 상태 정책

## 목적

운영 화면과 공개 신청 흐름에서 상태 의미를 명확하게 통일합니다.

## 상태 정의

- `pending`: 신청자
- `waitlisted`: 대기자
- `confirmed`: 참가 확정
- `completed`: 운영 완료
- `cancelled`: 취소
- `rejected`: 거절
- `no_show`: 미참석

## 운영 화면 분류

- 신청자: `pending`
- 대기자: `waitlisted`
- 참가자: `confirmed`, `completed`

## 정렬 규칙

- 신청자와 대기자는 `submitted_at` 오름차순
- 즉 가장 먼저 들어온 신청이 가장 위에 보입니다.
- 대기자는 이 순서를 우선순위로 사용합니다.

## 현재 관리자 처리 가능 상태 변경

- `pending -> confirmed`
- `waitlisted -> confirmed`
- `pending -> cancelled`
- `waitlisted -> cancelled`
- `confirmed -> cancelled`

## 현재 미지원 상태 변경

- `pending -> waitlisted`
- `waitlisted -> pending`
- 취소 발생 시 자동 승격

## 운영 해석

- `confirmed`는 참가자로 확정된 상태입니다.
- `completed`는 행사 종료 후 완료 처리된 상태입니다.
- 미래 파티에서 일반적으로 많이 쓰는 상태는 `pending`, `waitlisted`, `confirmed` 입니다.
