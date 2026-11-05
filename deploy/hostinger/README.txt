Regen Hostinger deployment

Production origin: https://www.regenlongevitylab.com
Server: srv2050267.hstgr.cloud (31.97.191.149)
Installation: /opt/regen-website

The source baseline is Vercel production Git commit
036b7508c6fd51ab5ba0bcc2e7fd077ad86c1887, with infrastructure-only
changes for Node 24, Docker, and the PostgreSQL Workflow runtime.
The private Sites backend and its business data remain on Sites.
The n8n, WAHA, bridge, and knowledge worker remain separate services.

Files installed at /opt/regen-website:
  compose.yml
  production.env (600; never commit or display)
  database.env (600; never commit or display)
  scheduler.py
  backup.sh
  releases/20261105-migration/

Required runtime environment keys:
  REGEN_ADMIN_BACKEND_ACCESS
  REGEN_DIRECT_SERVICE_KEY (must match private Sites backend)
  REGEN_MAIL_PASSWORD
  REGEN_HOSTINGER_WEBHOOK_SECRET
  CRON_SECRET
  REGEN_DIRECT_ENABLED=true
  REGEN_MAIL_ENABLED=true
  REGEN_SCHEDULER_ENABLED=true
  REGEN_HOSTED_ORIGIN=https://www.regenlongevitylab.com
  WORKFLOW_TARGET_WORLD=@workflow/world-postgres
  WORKFLOW_POSTGRES_URL
  WORKFLOW_LOCAL_BASE_URL=http://127.0.0.1:3000
  WORKFLOW_POSTGRES_WORKER_CONCURRENCY=2
  WORKFLOW_POSTGRES_MAX_POOL_SIZE=4
  WORKFLOW_POSTGRES_POLL_INTERVAL_MS=2000

Legacy optional setting:
  REGEN_RETATRUTIDE_COA_CODE
This is required only for the old long-code COA URL. Named COA URLs
use the existing source registry. Do not generate a new code to replace
an existing printed code.

Website is bound to 127.0.0.1:3090 only. Existing Caddy container
wearology-cs-proxy-1 supplies TLS and the public reverse proxy.
Its existing configuration is preserved, with two Regen vhosts added.
Caddyfile.snippet records the Regen-only additions. The apex domain uses
ZeroSSL's free ACME service as a fallback if Let's Encrypt issuance fails.
The public /.well-known/workflow/* path is denied; workers use loopback.
PostgreSQL is internal-only, with a named persistent Docker volume.
Never expose the worker endpoint or database on a public port.

Operations:
  docker compose --project-directory /opt/regen-website ps
  docker compose --project-directory /opt/regen-website logs --tail 100 website scheduler
  curl --fail http://127.0.0.1:3090/api/healthz

For updates, use an isolated checkout of the intended production commit,
exclude .env files, node_modules, artifacts, .git, and .vercel, then upload
to a new release directory. Change build path and image tag in compose.yml,
build, validate, and recreate website only. Keep the old image for rollback.
The image runs schema bootstrap idempotently before starting Next.js.
Use the exact dependency lockfile. Existing bot services need no restart.

Scheduler restores the existing daily mail workflow using an internal
authenticated call; mail polling remains at the existing interval.
Mailbox uses IMAP read-only access and existing payment validation.
No test customer message or test email is part of migration validation.

Backups: /opt/regen-website/backup.sh creates a validated pg_dump archive.
Cron: /etc/cron.d/regen-website-backup, 02:15 server time, retention 14 days.
Backups are local to this VPS; they do not replace off-server VPS backups.
The business data/files remain in the original private Sites storage.

Recovery:
  Restore the previous image/build reference for a website-only rollback.
  Preserve the named PostgreSQL volume and production.env.
  Caddy backup: /opt/regen-website/Caddyfile.before-migration.
  Validate Caddy before graceful reload; never replace unrelated vhosts.
  Vercel project is retained; its old direct-service and mail webhook
  secrets became obsolete during migration. Returning to Vercel requires
  installing the current credentials and restoring its billing/service.
  Do not point DNS back to its disabled deployment as a recovery step.
