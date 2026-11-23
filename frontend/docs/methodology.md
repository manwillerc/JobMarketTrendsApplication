# Data preparation

From the repository root, in your Miniconda environment:

```bash
python -m pip install -r backend/requirements.txt
python backend/process_data.py
```

The script reads the two CSVs in `backend/raw_data/` and generates `frontend/data/occupations.json`. Paths are relative to the script's location, so the script also works from another directory. No downloads are needed.

- Keep OEWS `O_GROUP=detailed` rows and projection `Occupation type=Line item` rows. Exclude totals and other aggregates from chart records.
- Join exact occupation codes, preserving them as strings. Require one row per code. All 830 OEWS detailed occupations match; projection-only Fishing and hunting workers (`45-3031`) is excluded.
- Remove numeric thousands separators. Convert known missing markers (`*`, em dash, or blank) to null; reject unexpected text and nonfinite numbers. Never replace missing wages with zero or estimate annual wages from hourly rates.
- Retain five occupations lacking annual wages for the employment bar chart. Record the missing reason; omit these five from the salary scatter, leaving 825 points.
- Use the published projection growth percentage, including negative values, without recalculating it from rounded employment totals.
- Derive major-group codes from the first two occupation-code digits and look up titles in the source's major-group rows. Combined detailed codes ending in zero remain valid occupations.
- Sort output by occupation code and include source URLs, reference periods, units, and missing-value explanations. Repeated runs on the same inputs produce identical output.

The script checks unique codes, expected counts, available group/projection fields, nonnegative employment, positive available wages, finite numbers, and growth of at least -100 percent before writing output.

Employment is measured in jobs, annual wages in USD, and projected growth in percent over 2025–2035. OEWS employment excludes self-employment, while the projection employment base includes it. These measures are not interchangeable. National averages do not describe local opportunities or individual outcomes; projections are uncertain and employment levels are not vacancies.

The inputs are CSV exports received November 22, 2026. Original workbook legends and original download dates were not supplied. Detailed source definitions and exclusions are in [sources.md](sources.md).
