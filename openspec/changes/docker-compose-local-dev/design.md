## Context

The repository contains a Next.js frontend and nine backend services, each started manually with local `npm` commands. This creates high setup overhead, inconsistent service startup order, and duplicated environment wiring. The API gateway currently proxies to downstream services using host URLs defined in `.env`, so containerization must preserve those routes while switching internal communication from `localhost` to Docker service DNS names.

## Goals / Non-Goals

**Goals:**
- Start the full local stack with a single `docker compose up --build` command.
- Keep the existing development ports exposed on the host so current habits and tools continue to work.
- Use Docker networking so containers talk to each other by service name.
- Preserve per-service `.env` usage while adding container-friendly overrides where needed.
- Support fast development iteration with bind mounts and hot reload where feasible.

**Non-Goals:**
- Replace the current application architecture or merge services.
- Introduce production orchestration, production-grade images, or deployment pipelines.
- Redesign database topology or add new infrastructure beyond what is required for local development.

## Decisions

- **One Dockerfile per service plus one root `docker-compose.yml`**: Each service remains independently buildable and matches the existing repo layout.
  - Alternative: a shared base Dockerfile or monorepo image. Rejected because the project is already organized as independent applications and service-local Dockerfiles are clearer for local dev.
- **Single compose network with service-name routing**: The gateway will resolve downstreams like `http://product-service:3001` instead of `localhost`.
  - Alternative: host networking. Rejected because it is less portable and removes Docker DNS benefits.
- **Development-first containers**: Use bind mounts and `npm run start:dev` / `npm run dev` inside containers to keep hot reload behavior.
  - Alternative: production-only images with compiled artifacts. Rejected because the requested workflow is local development.
- **Per-service `.env` files remain the source of service-specific config**: Compose will load each service’s `.env` and override gateway downstream URLs to Docker service names where necessary.
  - Alternative: move all env into compose only. Rejected because it duplicates existing config and makes service-local runs harder.
- **Expose current host ports unchanged**: Host ports will continue to mirror today’s local dev ports so Postman, frontend, and manual checks do not need remapping.
  - Alternative: assign new compose-only ports. Rejected because it would break existing local expectations.

## Risks / Trade-offs

- **Bind mounts can hide container-installed dependencies** -> Mitigation: mount source directories but keep `node_modules` in container-managed volumes.
- **Hot reload differs between NestJS and Next.js under Docker on Windows** -> Mitigation: prefer dev commands already used by the repo and document any polling-related environment flags if needed.
- **Gateway routing may still fail if env files keep `localhost` for container-to-container traffic** -> Mitigation: explicitly override gateway downstream URLs in compose using service names.
- **Service startup ordering may not guarantee readiness** -> Mitigation: use `depends_on` for ordering and document that downstream readiness still matters during initial boot.

## Migration Plan

1. Add Dockerfiles and `.dockerignore` files for all backend services and the frontend.
2. Add `docker-compose.yml` at the repo root with port mappings, volumes, env loading, and a shared network.
3. Update gateway container env wiring to use Docker service names.
4. Validate `docker compose up --build` and confirm gateway-to-service and frontend-to-gateway access.
5. Keep existing local non-Docker commands intact so rollback is simply using the previous manual startup flow.

## Open Questions

- Does any service require extra filesystem watch settings under Docker Desktop on Windows for reliable hot reload?
- Will database connectivity work from containers with the current Neon-hosted `.env` settings, or will some services need explicit SSL/runtime tweaks once containerized?
