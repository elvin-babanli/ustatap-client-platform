# Operations & Monitoring

## Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health` | Liveness - service up |
| `GET /api/v1/health/readiness` | Readiness - DB connected, uptime, env |

Use `/health` for load balancer liveness. Use `/health/readiness` for traffic routing (exclude from LB if DB is down).

## Log Monitoring

- Structured JSON logs (requestId, method, path, statusCode, durationMs)
- Auth events (login success/fail) logged without credentials
- 500 errors logged with stack in non-production
- Never log: passwords, tokens, raw credentials

Recommendation: Pipe logs to stdout, use log aggregator (e.g. Loki, Datadog, CloudWatch) for production.

## Restart Strategy

- **Docker:** `docker compose restart api`
- **PM2:** `pm2 restart api`
- Set `restart: unless-stopped` in Docker or PM2 ecosystem config
- API uses `enableShutdownHooks()` for graceful stop

## Database Backup

```bash
# Dump
pg_dump -U ustatap -d ustatap -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -U ustatap -d ustatap -c backup_20250101.dump
```

Schedule daily dumps with cron. Retain 7–30 days.
