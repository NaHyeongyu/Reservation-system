# Frontend Conventions

## 목적

이 문서는 이 프로젝트의 프론트엔드 파일/폴더 구조, 네이밍, 개발 스타일 기준을 고정한다.  
기준 스택은 `Next.js 16 App Router`, `React 19`, `TypeScript strict`, `Tailwind CSS v4`이다.

## 핵심 원칙

1. 라우팅은 `app`, 도메인 로직은 `features`, 외부 연동은 `lib`로 분리한다.
2. 기본은 Server Component이며, 브라우저 상호작용이 필요할 때만 Client Component를 쓴다.
3. 재사용 범위에 따라 위치를 나눈다.
   `route private -> feature shared -> app shared`
4. 기본 export는 named export다.
   Next.js 특수 파일(`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`)만 default export를 허용한다.
5. `any`는 금지한다.
   경계 입력은 `unknown`으로 받고 명시적으로 좁힌다.
6. route file은 커지기 전에 분리한다.
   `page.tsx`, `layout.tsx`, `route.ts`는 80줄 안팎을 목표로 하고, 120줄을 넘기기 전에 쪼갠다.

## 표준 폴더 구조

```text
src/
  app/
    (public)/
      page.tsx
      _components/
      _lib/
      reservations/
        _actions/
        _components/
        _lib/
    (admin)/
      dashboard/
        _components/
    api/
      health/
        route.ts
    favicon.ico
    globals.css
    layout.tsx
  components/
    ui/
    layout/
  features/
    reservations/
      components/
      hooks/
      server/
  lib/
    site.ts
    utils/
  types/
    ...
public/
docs/
```

- 아직 코드가 없지만 곧 쓸 폴더는 `.gitkeep`으로 먼저 트래킹한다.

## 폴더 규칙

### `src/app`

- URL과 라우트 파일만 담당한다.
- 세그먼트 루트에는 Next.js 특수 파일만 둔다.
- 라우트 내부 구현물은 private folder로 분리한다.
  - `_components`: 해당 라우트에서만 쓰는 UI
  - `_actions`: 해당 라우트에서만 쓰는 Server Actions
  - `_lib`: 해당 라우트에서만 쓰는 서버 헬퍼, 포맷터, 매퍼
- 공개 예약 플로우와 관리자 영역이 분리되면 최상위 route group을 쓴다.
  - `(public)`
  - `(admin)`
- `page.tsx`는 얇게 유지한다.
  - URL 파라미터 해석
  - 서버 데이터 호출
  - 섹션 조합
  - metadata 연결
  위 역할까지만 두고, 세부 UI와 비즈니스 로직은 밖으로 뺀다.
- `page.tsx`와 `layout.tsx` 안에서 로컬 서브컴포넌트를 2개 이상 늘리지 않는다.
  이 시점부터는 `_components`로 분리한다.

### `src/components`

- 여러 도메인에서 재사용하는 공용 컴포넌트만 둔다.
- 비즈니스 용어가 들어가면 `features`로 보낸다.
- 하위 기준:
  - `ui`: 버튼, 배지, 카드, 모달 같은 범용 프리미티브
  - `layout`: 헤더, 사이드바, 셸, 푸터, 섹션 래퍼

### `src/features`

- 도메인 단위 코드를 둔다.
- 예약, 일정, 고객, 인증처럼 문제 영역 기준으로 나눈다.
- 한 feature 안에는 아래 구조를 기본으로 쓴다.
  - `components/`: 해당 도메인에서 재사용하는 UI
  - `hooks/`: 브라우저 상호작용 훅
  - `server/`: 서버 전용 조회/명령 로직
  - `types.ts`: 도메인 타입
  - `schema.ts`: 입력 검증 스키마
  - `constants.ts`: 도메인 상수
  - `utils.ts`: 순수 계산/포맷 유틸

### `src/lib`

- 외부 서비스 연동, 프레임워크 의존 유틸, 전역 헬퍼만 둔다.
- 현재 기준에서 `src/lib/site.ts` 같은 앱 전역 설정 파일이 여기에 해당한다.
- 예약/고객 같은 도메인 비즈니스 로직은 두지 않는다.
- 환경변수 접근은 `lib` 내부의 전용 config 파일에만 둔다.
- 특정 외부 서비스가 들어오면 `src/lib/<service>/` 형태로 분리한다.

### `src/types`

- 전역 공유 타입이나 생성 타입만 둔다.
- 예: `database.ts`
- 특정 feature 안에서만 쓰는 타입은 `src/types`로 올리지 않는다.

### `public`

- 정적 파일만 둔다.
- 파일명은 모두 kebab-case로 통일한다.

## 네이밍 규칙

### 폴더명

- 기본은 `kebab-case`
- 예:
  - `reservation-summary`
  - `guest-list`
  - `booking-calendar`
- Next.js 예약 규칙은 그대로 따른다.
  - route group: `(admin)`
  - private folder: `_components`
  - dynamic segment: `[reservationId]`

### 컴포넌트 파일명

- `PascalCase.tsx`
- 파일명과 export 이름을 일치시킨다.
- 예:
  - `ReservationForm.tsx`
  - `ScheduleCalendar.tsx`
  - `AdminSidebar.tsx`

### 훅 파일명

- `use`로 시작하는 `camelCase.ts`
- 예:
  - `useReservationFilters.ts`
  - `useScrollLock.ts`

### 일반 모듈 파일명

- `kebab-case.ts`
- 예:
  - `format-phone-number.ts`
  - `group-reservations-by-date.ts`
  - `map-reservation-status.ts`

### 서버 액션 파일명

- 라우트 전용 액션은 `_actions/verb-noun.ts`
- export 함수명은 `verbNounAction`
- 예:
  - `_actions/create-reservation.ts`
  - `_actions/cancel-reservation.ts`
  - `createReservationAction`

### 타입/스키마/상수 파일명

- feature 내부 기본 파일명:
  - `types.ts`
  - `schema.ts`
  - `constants.ts`
  - `utils.ts`
- 파일 하나가 비대해지면 개념 단위로 분리한다.
  - `reservation-status.ts`
  - `reservation-price.ts`

## Import / Export 규칙

- `src` 바깥 상대경로 탐색은 금지한다.
- 같은 feature/같은 폴더 아래만 상대경로를 허용한다.
- feature 경계를 넘거나 공용 모듈을 가져올 때는 `@/` alias를 쓴다.
- import 순서는 아래 순서를 따른다.
  1. 외부 패키지
  2. `@/` alias
  3. 상대경로
- 타입 import는 `import type`을 우선 사용한다.
- reusable module은 named export를 기본으로 한다.

## 개발 스타일

### Server / Client 경계

- `app`의 컴포넌트는 기본적으로 Server Component로 작성한다.
- 아래 경우에만 `"use client"`를 붙인다.
  - `useState`, `useReducer`, `useEffect`, `useActionState` 같은 클라이언트 훅 사용
  - 브라우저 API 사용
  - DOM 이벤트 핸들링
  - 즉시 상호작용 UI
- Client Component 안에서 서버 전용 모듈을 직접 import하지 않는다.

### 데이터 접근

- 조회는 서버에서 먼저 수행한다.
  - `page.tsx`
  - `layout.tsx`
  - `features/*/server/*`
  - `route.ts`
- Client Component는 가공된 props를 받아 렌더링하는 것을 기본으로 한다.
- 환경변수는 컴포넌트에서 직접 읽지 않는다.
- 외부 API 클라이언트나 SDK 초기화는 `lib` 내부 래퍼를 통해서만 접근한다.

### 상태 관리

- 서버 상태는 서버에서 조회하고 재검증한다.
- URL에 반영되어야 하는 상태는 search params로 관리한다.
- 화면 일시 상태만 로컬 state로 관리한다.
- 전역 store는 아래 조건을 모두 만족할 때만 도입한다.
  - 멀리 떨어진 트리에서 동시에 접근해야 한다.
  - props drilling으로 해결하기 어렵다.
  - 서버 상태만으로는 표현되지 않는다.

### 컴포넌트 분리 기준

- 한 파일이 아래 중 하나를 만족하면 분리한다.
  - 1개 이상의 재사용 지점이 생겼다.
  - 페이지 파일 안에 로컬 서브컴포넌트가 3개 이상 생겼다.
  - route special file이 80줄 안팎을 넘기기 시작한다.
  - 일반 구현 파일이 150줄을 넘기기 시작한다.
  - UI와 데이터 처리 책임이 동시에 섞였다.
- 분리 우선순위:
  1. 해당 라우트 전용이면 `app/.../_components`
  2. 같은 도메인 여러 화면에서 쓰면 `features/<domain>/components`
  3. 도메인 무관 공용이면 `components/ui` 또는 `components/layout`

### TypeScript 스타일

- `strict` 기준을 유지한다.
- `any` 금지, `as` 최소화.
- boolean 변수는 `is`, `has`, `can`, `should` 접두어를 쓴다.
- 배열 변수는 복수형을 쓴다.
- 이벤트 핸들러는 `handle` 접두어를 쓴다.
- enum 대신 union literal type을 우선한다.

### 스타일링

- 스타일링은 Tailwind CSS v4를 기본으로 한다.
- 반복 색상/간격/그림자 값은 `globals.css`의 design token으로 올린다.
- 컴포넌트 안에 새로운 hex 값을 직접 넣어야 하면 같은 변경에서 토큰으로 승격하는 것을 원칙으로 한다.
- `style={{}}`은 계산된 동적 값이 정말 필요할 때만 사용한다.
- 같은 class 묶음이 3번 이상 반복되면 컴포넌트 또는 상수로 추출한다.

### 주석

- 주석은 "무엇을 하는지"가 아니라 "왜 이렇게 했는지"를 설명할 때만 쓴다.
- 코드만 읽어도 분명한 내용은 주석으로 반복하지 않는다.

## 테스트 파일 규칙

- 테스트 도구 도입 시 파일은 대상 옆에 colocate 한다.
- 파일명은 아래 형식을 따른다.
  - `ReservationForm.test.tsx`
  - `format-phone-number.test.ts`
- 순수 함수와 매퍼는 UI보다 먼저 테스트한다.

## PR 체크리스트

- 라우트 파일과 구현 파일이 분리되어 있는가
- 재사용 범위에 맞는 폴더에 위치했는가
- `use client`가 꼭 필요한 곳에만 있는가
- Supabase와 env 접근이 정해진 위치에만 있는가
- 파일명과 export 이름이 규칙을 따르는가
- 새로운 스타일 값이 token 기준을 따르는가

## 현재 프로젝트에 바로 적용할 기준

- 홈 라우트는 당분간 `src/app/page.tsx` 기본 상태로 두고, 실제 공개 예약 플로우가 시작되면 `(public)` group 아래로 옮긴다.
- 관리자와 예약 영역은 `(admin)` / `(public)` route group 밑에 미리 폴더를 만든다.
- 예약 도메인 코드는 `src/features/reservations/*`를 기본 시작점으로 사용한다.
- 현재 존재하는 외부 연동은 `src/lib/supabase/*`처럼 `lib` 아래에서 관리한다.
- 전역 타입 폴더는 유지하되, 실제 전역 공유 타입이 생기기 전까지는 최소 범위로 둔다.
