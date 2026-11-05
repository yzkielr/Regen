#!/bin/sh
set -eu
umask 077
directory=/opt/regen-website/backups
mkdir -p "$directory"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
output="$directory/workflow-$stamp.dump"
docker exec regen_website_postgres pg_dump -U regen -d regen_workflow -Fc > "$output.part"
test -s "$output.part"
mv "$output.part" "$output"
docker exec -i regen_website_postgres pg_restore --list < "$output" > /dev/null
find "$directory" -maxdepth 1 -type f -name 'workflow-*.dump' -mtime +14 -delete
