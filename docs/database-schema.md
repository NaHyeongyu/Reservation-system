# Database Schema Draft

## 목적

초기 운영 범위를 아래 4개 핵심 엔티티로 고정한다.

- `branches`: 지점
- `parties`: 관리자가 개설하는 파티/행사
- `reservations`: 참가 신청 단위
- `participants`: 실제 참가자

이번 초안은 `Supabase + PostgreSQL` 기준으로 바로 옮길 수 있는 형태를 목표로 한다.

## 핵심 결정

### 1. 예약과 참가자를 분리한다

`reservation`은 "신청 1건"이다.  
대표 신청자 정보, 예약 상태, 메모, 인원 수를 가진다.

`participant`는 "실제 참석자 1명"이다.  
한 예약에 참가자가 여러 명 붙을 수 있다.

이 구조로 가면 아래 둘을 동시에 처리할 수 있다.

- 1인 예약: `reservation 1건 + participant 1건`
- 동반 예약: `reservation 1건 + participant N건`

### 2. 예약 테이블에 `branch_id`를 함께 둔다

파티는 이미 지점에 속하지만, 예약 목록을 지점 기준으로 빠르게 필터링하려면
`reservations.branch_id`를 같이 두는 편이 운영 화면에서 유리하다.

대신 잘못된 조합이 들어가지 않게 `party_id + branch_id` 복합 외래키로 맞춘다.

### 3. 현재 단계에서는 결제와 권한을 분리한다

아직 아래 테이블은 넣지 않는다.

- `payments`
- `admin_users`
- `check_in_logs`
- `party_images`

필요하면 2차 마이그레이션으로 추가한다.

## 관계

```text
branches 1 --- N parties 1 --- N reservations 1 --- N participants
```

## 테이블 개요

### `branches`

지점 기본 정보와 운영 상태를 관리한다.

주요 컬럼:

- `id`: UUID PK
- `slug`: URL / 내부 식별용 고유값
- `name`: 지점명
- `status`: `active | inactive | archived`
- `phone`, `email`
- `address`
- `timezone`
- `notes`
- `created_at`, `updated_at`

### `parties`

실제 예약을 받는 행사 단위다.

주요 컬럼:

- `id`: UUID PK
- `branch_id`: 지점 FK
- `title`
- `description`
- `status`: `draft | published | closed | cancelled | completed`
- `start_at`, `end_at`
- `reservation_open_at`, `reservation_close_at`
- `capacity`
- `waitlist_capacity`
- `max_reservation_size`
- `price_amount`, `currency_code`
- `public_note`, `internal_note`
- `created_at`, `updated_at`

설계 포인트:

- `draft` 상태에서 작성 후 `published`로 전환
- `capacity`는 총 정원
- `waitlist_capacity`는 대기 정원
- `max_reservation_size`로 1회 신청 가능 인원 제한

### `reservations`

참가 신청 자체를 저장한다.

주요 컬럼:

- `id`: UUID PK
- `reservation_code`: 운영 화면용 예약 번호
- `branch_id`
- `party_id`
- `source`: `web | app | admin | import`
- `status`: `pending | confirmed | waitlisted | cancelled | rejected | completed | no_show`
- `reserver_name`, `reserver_phone`, `reserver_email`
- `applicant_gender`, `applicant_birth_date`(4자리 생년), `applicant_instagram_id`
- `bank_name`, `account_number`, `referral_sources`
- `party_terms_agreed`, `privacy_agreed`, `party_terms_agreed_at`, `privacy_agreed_at`
- `participant_count`
- `request_note`, `admin_note`
- `submitted_at`, `confirmed_at`, `cancelled_at`, `rejected_at`, `completed_at`
- `created_at`, `updated_at`

설계 포인트:

- 대표 신청자 기준 정보는 `reservations`에 둔다
- 실제 참석자 상세는 `participants`에서 관리한다
- 예약 상태 전환은 관리자 화면에서 직접 처리한다

### `participants`

예약에 속한 참가자 명단이다.

주요 컬럼:

- `id`: UUID PK
- `reservation_id`
- `full_name`
- `phone`, `email`
- `is_primary`: 대표 신청자 여부
- `status`: `active | cancelled | checked_in | no_show`
- `checked_in_at`
- `note`
- `created_at`, `updated_at`

설계 포인트:

- 한 예약에 대표 참가자는 최대 1명만 허용
- 체크인은 참가자 단위로 처리 가능

## 운영 규칙

### 브랜치

- `archived` 지점은 신규 파티 생성 불가
- 지점 삭제 대신 상태 전환을 우선한다

### 파티

- `draft`: 내부 작성 중
- `published`: 신청 가능
- `closed`: 신청 마감
- `cancelled`: 행사 취소
- `completed`: 행사 종료

### 예약

- `pending`: 접수됨, 관리자 확인 전
- `confirmed`: 확정
- `waitlisted`: 대기
- `cancelled`: 신청자 또는 관리자 취소
- `rejected`: 관리자 거절
- `completed`: 행사 종료 처리
- `no_show`: 미참석 처리

### 참가자

- `active`: 정상 참가 상태
- `cancelled`: 예약 내 일부 참가자 취소
- `checked_in`: 입장 처리 완료
- `no_show`: 현장 미참석

## 제약과 인덱스 기준

반드시 잡을 것:

- `branches.slug` unique
- `reservations.reservation_code` unique
- `participants` 대표 참가자 partial unique index
- `parties(branch_id, status, start_at)` 인덱스
- `reservations(branch_id, status, submitted_at)` 인덱스
- `reservations(party_id, status, submitted_at)` 인덱스

## 다음 확장 후보

우선순위가 올라오면 아래를 추가한다.

1. `admin_users`
2. `payments`
3. `party_media`
4. `reservation_status_logs`
5. `participant_check_in_logs`

## SQL 파일

실행 가능한 초안은 아래 파일에 작성했다.

- [`supabase/migrations/20260416_000001_initial_core_schema.sql`](/Users/nahyeongyu/Desktop/company/party/reservation_system/supabase/migrations/20260416_000001_initial_core_schema.sql)
