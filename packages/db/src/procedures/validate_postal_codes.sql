CREATE OR REPLACE FUNCTION staging.validate_postal_codes(p_import_batch_id uuid)
RETURNS TABLE(valid_count bigint, invalid_count bigint, states_present_count bigint, missing_states_count bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  v_valid bigint;
  v_invalid bigint;
  v_states_present bigint;
  v_missing_states bigint;
BEGIN
  UPDATE staging.postal_codes
  SET
    is_valid = NULL,
    validation_note = NULL
  WHERE import_batch_id = p_import_batch_id;

  UPDATE staging.postal_codes s
  SET
    is_valid = CASE
      WHEN s.postal_code !~ '^[0-9]{6}$' THEN false
      WHEN s.region_digit::text <> left(s.postal_code, 1) THEN false
      WHEN s.confidence NOT IN ('authoritative', 'high', 'fallback') THEN false
      WHEN s.source_kind NOT IN ('nipost', 'community') THEN false
      WHEN NOT EXISTS (
        SELECT 1
        FROM ref.states rs
        WHERE rs.slug = s.state_slug
      ) THEN false
      WHEN s.lga_slug IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM ref.lgas rl
        JOIN ref.states rs ON rs.id = rl.state_id
        WHERE rl.slug = s.lga_slug
          AND rs.slug = s.state_slug
      ) THEN false
      WHEN EXISTS (
        SELECT 1
        FROM staging.postal_codes o
        WHERE o.import_batch_id = p_import_batch_id
          AND o.id <> s.id
          AND o.state_slug = s.state_slug
          AND coalesce(o.lga_slug, '') = coalesce(s.lga_slug, '')
          AND lower(o.area_name) = lower(s.area_name)
          AND o.postal_code = s.postal_code
      ) THEN false
      ELSE true
    END,
    validation_note = CASE
      WHEN s.postal_code !~ '^[0-9]{6}$' THEN 'postal_code must be exactly 6 digits'
      WHEN s.region_digit::text <> left(s.postal_code, 1) THEN 'region_digit does not match postal_code'
      WHEN s.confidence NOT IN ('authoritative', 'high', 'fallback') THEN 'invalid confidence'
      WHEN s.source_kind NOT IN ('nipost', 'community') THEN 'invalid source_kind'
      WHEN NOT EXISTS (
        SELECT 1
        FROM ref.states rs
        WHERE rs.slug = s.state_slug
      ) THEN 'invalid state_slug'
      WHEN s.lga_slug IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM ref.lgas rl
        JOIN ref.states rs ON rs.id = rl.state_id
        WHERE rl.slug = s.lga_slug
          AND rs.slug = s.state_slug
      ) THEN 'invalid lga_slug for state'
      WHEN EXISTS (
        SELECT 1
        FROM staging.postal_codes o
        WHERE o.import_batch_id = p_import_batch_id
          AND o.id <> s.id
          AND o.state_slug = s.state_slug
          AND coalesce(o.lga_slug, '') = coalesce(s.lga_slug, '')
          AND lower(o.area_name) = lower(s.area_name)
          AND o.postal_code = s.postal_code
      ) THEN 'duplicate (state_slug, lga_slug, area_name, postal_code) within batch'
      ELSE NULL
    END
  WHERE s.import_batch_id = p_import_batch_id;

  WITH states_in_batch AS (
    SELECT DISTINCT state_slug
    FROM staging.postal_codes
    WHERE import_batch_id = p_import_batch_id
  )
  SELECT
    COUNT(*),
    COUNT(*) FILTER (
      WHERE rs.slug NOT IN (SELECT state_slug FROM states_in_batch)
    )
  INTO v_states_present, v_missing_states
  FROM ref.states rs;

  SELECT
    COUNT(*) FILTER (WHERE is_valid = true),
    COUNT(*) FILTER (WHERE is_valid = false)
  INTO v_valid, v_invalid
  FROM staging.postal_codes
  WHERE import_batch_id = p_import_batch_id;

  RETURN QUERY
  SELECT v_valid, v_invalid, v_states_present, v_missing_states;
END;
$$;
