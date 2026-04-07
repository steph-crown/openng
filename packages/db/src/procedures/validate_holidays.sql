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
