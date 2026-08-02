#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ENV_FILE="$SCRIPT_DIR/.env"
BACKUP_DIR="$SCRIPT_DIR/backups"
OLD_CONTAINER=${OLD_CONTAINER:-grit_postgres}
NEW_CONTAINER=${NEW_CONTAINER:-grit-postgres}
DOCKER_BIN=${DOCKER_BIN:-/usr/local/bin/docker}

if [ "${CONFIRM_SOURCE_QUIESCED:-}" != "yes" ]; then
    echo "Stop all writes to the source DB, then rerun with CONFIRM_SOURCE_QUIESCED=yes." >&2
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "Missing $ENV_FILE. Run ./init-env.sh first." >&2
    exit 1
fi

for container in "$OLD_CONTAINER" "$NEW_CONTAINER"; do
    if [ "$($DOCKER_BIN inspect -f '{{.State.Running}}' "$container" 2>/dev/null || true)" != "true" ]; then
        echo "Container is not running: $container" >&2
        exit 1
    fi
done

new_table_count=$(
    "$DOCKER_BIN" exec "$NEW_CONTAINER" sh -ec \
        'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -X -qAt -c "select count(*) from pg_catalog.pg_tables where schemaname = '\''public'\''"'
)

if [ "$new_table_count" != "0" ] && [ "${ALLOW_RESTORE_OVERWRITE:-}" != "yes" ]; then
    echo "Target DB already has $new_table_count public tables; refusing to overwrite it." >&2
    exit 1
fi

mkdir -p "$BACKUP_DIR"
timestamp=$(date +%Y%m%d-%H%M%S)
dump_file="$BACKUP_DIR/grit_db-$timestamp.dump"
partial_file="$dump_file.partial"
old_counts="$BACKUP_DIR/grit_db-$timestamp.source-counts"
new_counts="$BACKUP_DIR/grit_db-$timestamp.target-counts"

cleanup() {
    rm -f "$partial_file"
}
trap cleanup EXIT HUP INT TERM

echo "Creating a PostgreSQL 18 logical backup from $OLD_CONTAINER..."
"$DOCKER_BIN" exec "$OLD_CONTAINER" sh -ec \
    'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc --no-owner --no-privileges' \
    > "$partial_file"

"$DOCKER_BIN" exec -i "$NEW_CONTAINER" pg_restore --list < "$partial_file" > /dev/null
mv "$partial_file" "$dump_file"
openssl dgst -sha256 "$dump_file" > "$dump_file.sha256"

if [ "$new_table_count" != "0" ]; then
    "$DOCKER_BIN" exec "$NEW_CONTAINER" sh -ec \
        'dropdb -U "$POSTGRES_USER" "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
fi

echo "Restoring into $NEW_CONTAINER..."
"$DOCKER_BIN" exec -i "$NEW_CONTAINER" sh -ec \
    'exec pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges --exit-on-error' \
    < "$dump_file"

collect_counts() {
    container=$1
    output_file=$2
    "$DOCKER_BIN" exec -i "$container" sh -ec \
        'exec psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -X -qAt' > "$output_file" <<'SQL'
create temporary table migration_counts(object_name text primary key, value bigint);
do $$
declare item record;
declare item_count bigint;
begin
  for item in
    select schemaname, tablename
    from pg_catalog.pg_tables
    where schemaname = 'public'
    order by tablename
  loop
    execute format('select count(*) from %I.%I', item.schemaname, item.tablename) into item_count;
    insert into migration_counts values ('table:' || item.tablename, item_count);
  end loop;

  for item in
    select sequence_schema, sequence_name
    from information_schema.sequences
    where sequence_schema = 'public'
    order by sequence_name
  loop
    execute format('select last_value from %I.%I', item.sequence_schema, item.sequence_name) into item_count;
    insert into migration_counts values ('sequence:' || item.sequence_name, item_count);
  end loop;
end $$;
select object_name || '=' || value from migration_counts order by object_name;
SQL
}

collect_counts "$OLD_CONTAINER" "$old_counts"
collect_counts "$NEW_CONTAINER" "$new_counts"

if ! diff -u "$old_counts" "$new_counts"; then
    echo "Source and target counts differ. The source DB is preserved; do not cut over." >&2
    exit 1
fi

"$DOCKER_BIN" exec "$NEW_CONTAINER" sh -ec \
    'exec vacuumdb -U "$POSTGRES_USER" -d "$POSTGRES_DB" --analyze-in-stages'

echo "Migration verified. Backup: $dump_file"
echo "The source container $OLD_CONTAINER was not modified or stopped."
