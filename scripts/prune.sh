#!/usr/bin/env sh
# Retention cleanup for a running Seisra stack. Run from the repo root, e.g. daily:
#   0 3 * * *  cd /path/to/seisra && ./scripts/prune.sh >> prune.log 2>&1
# Use --dry-run to only count what would be removed.
# Container logs are already capped by compose.yaml (3 x 50 MB per service)
# and Kafka keeps 24 h, so only the waveform archive and old picks need pruning.
set -eu

DRY=false
[ "${1:-}" = "--dry-run" ] && DRY=true

# Read retention settings from .env (falls back to the documented defaults).
val() { grep -E "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2- || true; }
ARCHIVE_DAYS=$(val ARCHIVE_RETENTION_DAYS); ARCHIVE_DAYS=${ARCHIVE_DAYS:-90}
PICK_DAYS=$(val DB_PICKS_RETENTION_DAYS); PICK_DAYS=${PICK_DAYS:-30}
DB=$(val database_name); DB=${DB:-sispro-tews}

echo "[$(date -u +%FT%TZ)] archive > ${ARCHIVE_DAYS} d, picks > ${PICK_DAYS} d, dry-run=${DRY}"

# 1. Waveform archive (*.mseed), inside the archiver container so it works for
#    both a named volume and a host path (ARCHIVE_PATH).
if $DRY; then
  docker compose exec -T fdsn sh -c "find /archive -type f -name '*.mseed' -mtime +${ARCHIVE_DAYS} | wc -l" \
    | sed 's/^/  expired mseed files: /'
else
  docker compose exec -T fdsn sh -c "find /archive -type f -name '*.mseed' -mtime +${ARCHIVE_DAYS} -delete; find /archive -type d -empty -delete"
  echo "  archive pruned"
fi

# 2. Raw picks and arrival picks in MongoDB.
JS="var cutoff = new Date(Date.now() - ${PICK_DAYS} * 86400000);"
if $DRY; then
  JS="$JS print('  expired picks: ' + db.picks.countDocuments({timestamp: {\$lt: cutoff}}) + ', arrivals: ' + db.arrival_picks.countDocuments({timestamp: {\$lt: cutoff}}));"
else
  JS="$JS var p = db.picks.deleteMany({timestamp: {\$lt: cutoff}}); var a = db.arrival_picks.deleteMany({timestamp: {\$lt: cutoff}}); print('  deleted picks: ' + p.deletedCount + ', arrivals: ' + a.deletedCount);"
fi
docker compose exec -T mongodb mongo "$DB" --quiet --eval "$JS"
