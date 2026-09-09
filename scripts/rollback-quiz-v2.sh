#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ROLLBACK QUIZ V2 — Restore backup files
# Run from project root: ./scripts/rollback-quiz-v2.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "🔄 Rolling back Quiz V2 to backup files..."

BACKUPS=(
  "lib/signature-test.ts"
  "app/signature-emotionnelle/page.tsx"
  "lib/email-templates/signature-result.ts"
  "app/api/signature-lead/route.ts"
)

for file in "${BACKUPS[@]}"; do
  if [ -f "${file}.backup" ]; then
    cp "${file}.backup" "$file"
    echo "  ✓ Restored $file"
  else
    echo "  ✗ No backup found for $file"
  fi
done

echo ""
echo "⚠️  SQL rollback (run manually in Supabase SQL Editor):"
echo ""
cat << 'SQL'
-- Disable new tables (don't drop — keep data for analysis)
ALTER TABLE IF EXISTS quiz_v2_responses RENAME TO _quiz_v2_responses_disabled;
ALTER TABLE IF EXISTS quiz_v2_events RENAME TO _quiz_v2_events_disabled;
ALTER TABLE IF EXISTS protocol_notifications RENAME TO _protocol_notifications_disabled;
ALTER TABLE IF EXISTS protocols RENAME TO _protocols_disabled;
ALTER TABLE IF EXISTS newsletter_weekly_subscribers RENAME TO _newsletter_weekly_disabled;

-- Remove quiz_version column
ALTER TABLE signature_leads DROP COLUMN IF EXISTS quiz_version;

NOTIFY pgrst, 'reload schema';
SQL

echo ""
echo "✅ File rollback complete. Deploy to Vercel and run SQL manually."
