CREATE OR REPLACE FUNCTION staging.validate_holidays(p_import_batch_id uuid)
RETURNS TABLE(valid_count bigint, invalid_count bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  v_valid bigint;
  v_invalid bigint;
BEGIN
  UPDATE staging.holidays s
  SET
    is_valid = CASE
      WHEN EXISTS (
        SELECT 1
        FROM staging.holidays o
        WHERE o.import_batch_id = p_import_batch_id
          AND o.id <> s.id
          AND o.name = s.name
          AND o.date = s.date
      ) THEN false
      WHEN (EXTRACT(YEAR FROM s.date::date))::integer <> s.year THEN false
      WHEN s.category NOT IN ('national', 'religious', 'observance') THEN false
      WHEN s.schedule_kind NOT IN (
          'fixed',
          'moveable_christian',
          'moveable_islamic',
          'declared_special'
        ) THEN false
      ELSE true
    END,
    validation_note = CASE
      WHEN EXISTS (
        SELECT 1
        FROM staging.holidays o
        WHERE o.import_batch_id = p_import_batch_id
          AND o.id <> s.id
          AND o.name = s.name
          AND o.date = s.date
      ) THEN 'duplicate (name, date) within batch'
      WHEN (EXTRACT(YEAR FROM s.date::date))::integer <> s.year THEN 'year does not match date'
      WHEN s.category NOT IN ('national', 'religious', 'observance') THEN 'invalid category'
      WHEN s.schedule_kind NOT IN (
          'fixed',
          'moveable_christian',
          'moveable_islamic',
          'declared_special'
        ) THEN 'invalid schedule_kind'
      ELSE NULL
    END
  WHERE s.import_batch_id = p_import_batch_id;

  SELECT
    COUNT(*) FILTER (WHERE is_valid = true),
    COUNT(*) FILTER (WHERE is_valid = false)
  INTO v_valid, v_invalid
  FROM staging.holidays
  WHERE import_batch_id = p_import_batch_id;

  RETURN QUERY
  SELECT v_valid, v_invalid;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION staging.migrate_holidays(p_import_batch_id uuid)
RETURNS TABLE(rows_inserted bigint, rows_marked_migrated bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  ins bigint;
  upd bigint;
BEGIN
  INSERT INTO public.holidays (
    name,
    date,
    day_of_week,
    category,
    schedule_kind,
    year,
    is_confirmed,
    observance_note,
    source_url,
    source_date,
    created_at,
    updated_at,
    is_active
  )
  SELECT
    s.name,
    s.date,
    s.day_of_week,
    s.category,
    s.schedule_kind,
    s.year,
    s.is_confirmed,
    s.observance_note,
    s.source_url,
    s.source_date,
    NOW(),
    NOW(),
    s.is_active
  FROM staging.holidays s
  WHERE s.import_batch_id = p_import_batch_id
    AND s.is_valid = true
    AND (s.flagged IS DISTINCT FROM true)
    AND s.migrated_at IS NULL
  ON CONFLICT (name, date) DO NOTHING;

  GET DIAGNOSTICS ins = ROW_COUNT;

  UPDATE staging.holidays s
  SET migrated_at = NOW()
  WHERE s.import_batch_id = p_import_batch_id
    AND s.is_valid = true
    AND (s.flagged IS DISTINCT FROM true)
    AND s.migrated_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.holidays p
      WHERE p.name = s.name
        AND p.date = s.date
    );

  GET DIAGNOSTICS upd = ROW_COUNT;

  RETURN QUERY
  SELECT ins::bigint, upd::bigint;
END;
$$;
