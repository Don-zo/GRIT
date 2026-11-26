# NAS backend blue/green deployment

`compose.yaml` manages PostgreSQL, Redis and LiveKit. `compose.backend.yaml` is a
separate `grit-backend` project: two backend slots plus the permanent Nginx gateway.
Only the active slot runs normally. No backend slot publishes a host port.
The gateway owns `127.0.0.1:18080` and Docker hostname `grit-backend:8080`, so
existing API upstreams, webhook URL and metric target keep a stable destination.

## Requirements and database contract

- Python 3.8+, Docker Compose v2 with JSON config support; runner can use Docker.
- Existing `grit-app` network, healthy PostgreSQL/Redis and populated `.env`.
- Capacity for two 1 GiB backend containers temporarily, plus existing services.
- Both revisions must support the same database schema and Redis formats.
- Backends use Hibernate `validate`, not automatic schema mutation. Existing
  deployments must verify their schema before adopting this definition. Apply
  reviewed, backward-compatible migrations before deploying the new application.
  Add nullable/defaulted fields first; backfill separately; remove old fields only
  after old code and its rollback window have been retired. There is no automatic
  database rollback. Do not combine an incompatible schema change with this deploy.

## One-time installation / existing single backend migration

This is an explicit operator action, not an automatic CI step. Never run
`docker compose down` on the infrastructure project.

1. Back up the current Compose, environment/release metadata and database. Record
   the exact existing backend image and container configuration for rollback.
2. Install `compose.backend.yaml`, `deploy.py` and `nginx/nginx.conf` under
   `/volume1/docker/grit`, keeping the existing `.env` and its runner permissions.
   The repository `compose.yaml` is now infrastructure-only: replacing an existing
   deployed definition is a separate reviewed action, not required to deploy a backend.
3. Pre-pull the pinned application image and `nginx:1.30.8-alpine`. To prewarm blue
   while the legacy server still serves requests, create `runtime/images.env` with
   `BLUE_IMAGE=<exact-image>` and `GREEN_IMAGE=<same-image>` (permission 600), then:

   ```sh
   docker compose --project-name grit-backend --env-file .env \
     --env-file runtime/images.env -f compose.backend.yaml \
     up -d --no-deps backend-blue
   docker exec grit-backend-blue curl --fail \
     http://127.0.0.1:8080/actuator/health/readiness
   ```

4. Arrange the initial gateway handover. The legacy server owns port 18080 and
   container name `grit-backend`; they cannot simultaneously be assigned to Nginx.
   Stop and rename **only** the legacy backend to `grit-backend-legacy`, preserving
   it for rollback, then run `python3 deploy.py bootstrap <exact-image>`.
   This first port handover has a brief interruption; subsequent deployments use
   blue/green. Initial rollback: stop the new gateway before starting the legacy
   container. Do not restart PostgreSQL, Redis or LiveKit for this handover.
5. Confirm both external API and webhook paths reach the gateway and
   `/actuator/info` contains the expected `app.revision`. Keep the legacy container
   stopped until the initial rollout is accepted.

Image references must use a full 40-character commit tag or sha256 digest; mutable
`latest` / branch tags are rejected. Pull access to GHCR must already be configured.

## Normal deployment

```sh
python3 /volume1/docker/grit/deploy.py deploy ghcr.io/don-zo/grit-backend:<40-character-sha>
```

The script holds a host file lock, journals the attempt, starts only the inactive
slot with `--no-deps`, requires three successful readiness + application revision
checks, atomically replaces the routing file, validates Nginx and reloads it.
It verifies the real upstream response through the gateway and observes it for
15 seconds before committing the route. No write request is retried by Nginx.

Old Nginx workers must exit before the old backend receives SIGTERM. If draining
exceeds 120 seconds, both backends remain running and the journal is retained;
there is no forced request termination. Spring's shutdown phase budget is 30s;
Docker grants 90s for process exit. Longer application requests require a deliberate
review of proxy and drain timeouts.

On pre-commit failure the script restores the old route and waits for the candidate
connections to drain before stopping it. A failed rollback or interrupted process
leaves a journal and blocks the next deploy. Recover explicitly:

```sh
python3 /volume1/docker/grit/deploy.py recover
```

For a committed deployment, recovery only completes old-instance draining; it
never blindly rolls a healthy new revision back. Earlier application images remain
recorded in `runtime/state.json`; schemas must remain compatible for rollback.
After a completed deployment, deploy the previous pinned image with the same
`deploy` command to perform an application rollback through the normal checks.

## CI and definition updates

CI retains tests, SHA-tagged GHCR builds and serialized production deployments.
It does not copy the infrastructure Compose or run an infrastructure-wide `up`.
The installed backend Compose and static Nginx definition must match the repo;
changes require an explicit reviewed installation/migration, otherwise CI stops.
Only backend image promotion is automatic. No secrets are sourced as shell code.

`runtime/` is not versioned. Mount its **directory** into Nginx, not its individual
active routing file, so atomic replacement is visible inside the container.
Nginx remains running across deployments; do not recreate it during promotion.

JWT keys, shared database and Redis must be identical for both slots. Existing
withdrawal workers use `FOR UPDATE SKIP LOCKED`; retain that coordination. Validate
webhook retries and study-time idempotency when introducing incompatible behavior.
