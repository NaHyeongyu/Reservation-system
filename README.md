# Party Reservation System

Next.js App Router 기반 프론트엔드 베이스 프로젝트다.  
현재는 구현 코드를 미리 채우지 않고, 폴더 규칙과 디렉터리 골격만 먼저 잡아 둔 상태다.

## Run

```bash
npm run dev
npm run lint
npm run typecheck
```

## Frontend Rules

- 기준 문서: `docs/frontend-conventions.md`
- 라우팅은 `src/app`
- 공용 컴포넌트는 `src/components`
- 도메인 로직은 `src/features`
- 전역 헬퍼는 `src/lib`

## Initial Scaffold

```text
src/
  app/
    (public)/
    (admin)/
  components/
    ui/
    layout/
  features/
    reservations/
  lib/
  types/
```

홈 화면과 전역 스타일은 기본 Next 상태를 유지하고, 나머지 영역은 빈 폴더만 미리 만들어 두었다.

## Notes

- 실제 기능을 만들기 시작하면 route file은 조합 역할만 남기고 세부 구현은 `_components`, `_lib`, `_actions`로 분리한다.
- 새 도메인은 `src/features/<domain>`부터 만들고, 공용으로 올라갈 때만 `src/components`로 이동한다.
- 구조 규칙이 바뀌면 `docs/frontend-conventions.md`를 먼저 수정한 뒤 코드에도 같은 기준을 적용한다.
