# Admin Page Plan

## 목적

운영자가 아래 흐름을 한 번에 처리할 수 있게 관리자 영역을 설계한다.

1. 지점 생성/수정
2. 파티 생성/게시/마감
3. 예약 확인/확정/취소/대기 관리
4. 참가자 명단 확인/체크인

## 관리자 정보 구조

```text
/admin
  /dashboard
  /branches
  /parties
  /reservations
  /participants
```

## 기본 운영 흐름

```text
지점 생성
-> 파티 등록
-> 파티 게시
-> 예약 접수
-> 예약 확정 / 대기 / 취소 처리
-> 참가자 명단 확인
-> 체크인 / 종료 처리
```

## 페이지별 역할

### `/admin/dashboard`

목적:

- 오늘 운영 상황을 바로 확인
- 빠른 액션 진입

필수 섹션:

- 오늘의 예약 수
- 오늘 진행 파티
- 지점별 예약 현황
- 미확인 `pending` 예약 목록
- 곧 시작하는 파티

핵심 액션:

- 새 파티 만들기
- 미확인 예약 보기
- 오늘 참가자 명단 보기

### `/admin/branches`

목적:

- 지점 목록 관리
- 신규 지점 등록
- 지점 상태 변경

리스트 컬럼:

- 지점명
- 슬러그
- 연락처
- 타임존
- 상태
- 예정 파티 수

핵심 액션:

- 지점 추가
- 지점 수정
- 비활성화 / 보관 처리
- 해당 지점 파티 보기

상세/수정 화면에서 다룰 항목:

- 기본 정보
- 주소/연락처
- 운영 메모
- 현재 예정 파티 목록

### `/admin/parties`

목적:

- 파티 생성/수정
- 게시/마감/취소
- 지점별 행사 운영

리스트 필터:

- 지점
- 상태
- 날짜 범위

리스트 컬럼:

- 파티명
- 지점
- 시작 일시
- 상태
- 정원
- 확정 예약 수
- 대기 예약 수

핵심 액션:

- 파티 생성
- 게시
- 예약 마감
- 취소
- 예약 보기

파티 생성/수정 폼 항목:

- 지점
- 파티명
- 설명
- 시작/종료 일시
- 예약 오픈/마감 일시
- 정원
- 대기 정원
- 1회 예약 가능 인원
- 가격
- 공개 메모
- 내부 메모

### `/admin/reservations`

목적:

- 예약 단위 운영
- 상태 전환
- 고객 문의 대응

리스트 필터:

- 지점
- 파티
- 예약 상태
- 신청일 범위

리스트 컬럼:

- 예약번호
- 대표 신청자
- 연락처
- 파티명
- 인원 수
- 상태
- 신청 시각

상세 화면 섹션:

- 대표 신청자 정보
- 예약 상태 타임라인
- 요청 메모 / 내부 메모
- 참가자 목록
- 상태 변경 액션

핵심 액션:

- 확정
- 대기 전환
- 거절
- 취소
- 내부 메모 저장

### `/admin/participants`

목적:

- 실제 참가자 명단 확인
- 체크인 운영

리스트 필터:

- 지점
- 파티
- 예약 상태
- 참가자 상태

리스트 컬럼:

- 참가자명
- 대표 여부
- 예약번호
- 파티명
- 지점
- 상태
- 체크인 시각

핵심 액션:

- 체크인 처리
- 미참석 처리
- 참가자 메모 저장

## 상세 라우트 초안

```text
src/app/(admin)/
  dashboard/
  branches/
    new/
    [branchId]/
      edit/
  parties/
    new/
    [partyId]/
      edit/
  reservations/
    [reservationId]/
  participants/
```

## 우선 구현 순서

1. `branches`
2. `parties`
3. `reservations`
4. `participants`
5. `dashboard`

이 순서가 맞는 이유:

- 파티는 지점이 있어야 생성된다
- 예약은 파티가 있어야 생긴다
- 참가자는 예약의 하위 데이터다
- 대시보드는 앞선 4개 데이터를 집계해서 보여준다

## 화면 컴포넌트 분리 기준

예상 feature 구조:

```text
src/features/
  branches/
    components/
    server/
  parties/
    components/
    server/
  reservations/
    components/
    server/
  participants/
    components/
    server/
```

예상 route 구조:

```text
src/app/(admin)/
  branches/
    _components/
    _actions/
    _lib/
  parties/
    _components/
    _actions/
    _lib/
  reservations/
    _components/
    _actions/
    _lib/
  participants/
    _components/
    _actions/
    _lib/
```

## MVP에서 보류하는 것

이번 단계에서는 보류:

- 결제 내역 관리
- 쿠폰/프로모션
- 이미지 업로드
- 세부 권한 레벨
- 알림 발송 이력
