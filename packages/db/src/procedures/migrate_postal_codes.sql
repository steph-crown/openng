CREATE OR REPLACE FUNCTION staging.migrate_postal_codes(p_import_batch_id uuid)
RETURNS TABLE(rows_inserted bigint, rows_marked_migrated bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  ins bigint;
  upd bigint;
BEGIN
  INSERT INTO public.postal_codes (
    state_id,
    state_slug,
    lga_id,
    lga_slug,
    area_name,
    post_office_name,
    postal_code,
    region_digit,
    is_verified,
    confidence,
    source_kind,
    source_url,
    source_date,
    created_at,
    updated_at,
    is_active
  )
  SELECT
    rs.id AS state_id,
    s.state_slug,
    rl.id AS lga_id,
    s.lga_slug,
    s.area_name,
    s.post_office_name,
    s.postal_code,
    s.region_digit,
    s.is_verified,
    s.confidence,
    s.source_kind,
    s.source_url,
    s.source_date,
    NOW(),
    NOW(),
    s.is_active
  FROM staging.postal_codes s
  JOIN ref.states rs
    ON rs.slug = s.state_slug
  LEFT JOIN ref.lgas rl
    ON rl.slug = s.lga_slug
   AND rl.state_id = rs.id
  WHERE s.import_batch_id = p_import_batch_id
    AND s.is_valid = true
    AND (s.flagged IS DISTINCT FROM true)
    AND s.migrated_at IS NULL
  ON CONFLICT (state_id, lga_id, area_name, postal_code) DO NOTHING;

  GET DIAGNOSTICS ins = ROW_COUNT;

  UPDATE staging.postal_codes s
  SET migrated_at = NOW()
  WHERE s.import_batch_id = p_import_batch_id
    AND s.is_valid = true
    AND (s.flagged IS DISTINCT FROM true)
    AND s.migrated_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM ref.states rs
      LEFT JOIN ref.lgas rl
        ON rl.slug = s.lga_slug
       AND rl.state_id = rs.id
      JOIN public.postal_codes p
        ON p.state_id = rs.id
       AND p.lga_id IS NOT DISTINCT FROM rl.id
       AND p.area_name = s.area_name
       AND p.postal_code = s.postal_code
      WHERE rs.slug = s.state_slug
    );

  GET DIAGNOSTICS upd = ROW_COUNT;

  RETURN QUERY
  SELECT ins::bigint, upd::bigint;
END;
$$;
