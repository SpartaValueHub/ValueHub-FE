<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Data fetching (actions / services / api)

Collabhub-style 3-layer. Call direction is one-way only:

```
UI (client / RSC)
  → actions/*Action     ("use server", zod, ActionResult)
    → services/*Service (orchestration, Api → Ui map)
      → lib/api/*       (sole HTTP / apiFetch)
        → API_URL
```

### Hard rules

1. **Do not call `fetch(API_URL)` outside `lib/api/*`.**
2. **Client components must not import `lib/api` or `services`.** Use Server Actions.
3. **RSC pages may call `*Service` directly** for reads; mutations go through actions.
4. **Actions** own auth/validation, call services, return `ActionResult` (or form state). Never call `apiFetch` directly.
5. **Services** own mapping (`Api*` → `Ui*`) and composing API calls. No `"use server"`.
6. **Types live under `types/`**
   - `types/<domain>/api.ts` — backend DTO (`ApiPost`, …) for `lib/api` only
   - `types/<domain>/ui.ts` — UI model (`UiPost`, …) for components/services
   - form schemas (zod) under `types/<domain>/`
7. **Env:** server-only `API_URL` (fallback `API_BASE_URL`). Do not expose Spring/backend URL via `NEXT_PUBLIC_*` in production.
8. **API paths** live only in `lib/api/endpoints.ts` (`API_ENDPOINTS`). Do not hardcode paths in `lib/api/*.ts`.
9. **SSE/chat reactive:** Browser `EventSource` connects directly to `NEXT_PUBLIC_CHAT_API_URL` + `/api/v1/chat/reactive/{uuid}` (`lib/chat/sse.ts`). EventSource cannot set Authorization headers — token is passed as `accessToken` query if needed. Previous Next SSE proxy is archived at `lib/api/backups/chat-reactive-proxy.route.ts`.
10. **Chat room list:** Chat BE `GET /api/v1/chat/rooms` (optional Next BFF `GET /api/chat/rooms`). Room meta + last-message preview come from the chat service. Detail uses `GET /api/v1/chat/rooms/{uuid}`.
11. **Auth:** Credentials NextAuth v4 → `POST /api/v1/auth/sign-in` via `services/auth.service` → JWT session (`accessToken`, `uuid`). Chat routes/BFF require login (`middleware` + `requireAuth` / `requireActionAuth`). Chat `senderUuid` = session `user.uuid` (server-only). Client `SessionContext` / `GET /api/auth/status` expose only `{ name }` — never `uuid`, `logInId`, or tokens.
12. **LAN / other IP login:** Do **not** hardcode `NEXTAUTH_URL=http://localhost:3000`. Set `AUTH_TRUST_HOST=true` so NextAuth derives origin from the request Host. Run Next with `--hostname 0.0.0.0`. Browser chat SSE rewrites `localhost` chat URL host to the current page hostname (`lib/chat/sse.ts`).

### Naming

| Layer   | File                 | Function              |
|---------|----------------------|-----------------------|
| Action  | `actions/posts.ts`   | `listPostsAction`     |
| Service | `services/posts.service.ts` | `listPostsService`, `mapPost` |
| API     | `lib/api/posts.ts`   | `listPosts`, `getPost` |
| Paths   | `lib/api/endpoints.ts` | `API_ENDPOINTS.auth.signUp` |
