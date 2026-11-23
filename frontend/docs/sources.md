# Data sources and acquisition status

Reviewed November 22, 2026. Phase 2 is **complete for the supplied CSV exports**. Both occupational CSVs are available and verified. Direct workbook downloads returned HTTP 403; user-provided CSV exports resolved the access blocker. Original workbooks and their full legends were not supplied; preserve that provenance limitation. No occupational values have been substituted or fabricated.

## Chart A: occupational employment; Chart B: annual wages

- Program: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS).
- Reference period: May 2025; release: May 15, 2026, confirmed by the [news release](https://www.bls.gov/news.release/ocwage.nr0.htm).
- [Download index](https://www.bls.gov/oes/tables.htm); select May 2025 → National → XLSX.
- Exact linked archive: <https://www.bls.gov/oes/special-requests/oesm25nat.zip>.
- Supplied input: `backend/raw_data/oews_national_may_2025.csv`, a byte-preserved CSV export of `national_M2025_dl.xlsx`. Received November 22, 2026; original download date was not supplied. Filename identifies May 2025; CSV has no standalone reference-year field. Original filename: `national_M2025_dl.xlsx - national_M2025_dl.csv`.
- Geography: United States; use the national all-industry estimates, excluding aggregate occupations from rankings.
- Verified fields: `OCC_CODE`, `OCC_TITLE`, `O_GROUP`, `TOT_EMP` (jobs), and `A_MEDIAN` (USD/year). All 1,401 rows have national area `99`, cross-industry NAICS `000000`, and ownership `1235`. The table has 830 detailed, 454 broad, 94 minor, 22 major, and one total row.

The [technical notes](https://www.bls.gov/oes/2025/may/oes_tec.htm) identify 2018 SOC and 2022 NAICS. OEWS measures wage and salary employment and excludes self-employment; coverage also excludes most agriculture and private households. Annual wages are not available for every occupation; do not automatically multiply hourly wages by 2,080. In the supplied detailed rows, all employment estimates are numeric; five annual medians contain `*` and have `HOURLY=TRUE`. Treat these as unavailable annual wages, retaining the marker and hourly-only flag. No other nonnumeric markers appear in the detailed employment/annual-median fields. The workbook legend was not retained; do not infer definitions for unseen suppression or bound markers.

## Chart B: occupational growth projections

- Program: BLS Employment Projections, Table 1.2.
- Period: 2025–2035; release August 27, 2026, confirmed in the [program FAQ](https://www.bls.gov/emp/frequently-asked-questions.htm).
- [HTML table and download link](https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm).
- Exact linked workbook: <https://www.bls.gov/emp/ind-occ-matrix/occupation.xlsx>.
- Supplied input: `backend/raw_data/projections_2025_2035.csv`, the user-provided Table 1.2 export. Received November 22, 2026 as `occupation.xlsx - Table 1.2.csv`; original download date was not supplied. Its title and headers explicitly confirm 2025–2035. Source URLs can update between releases; preserve this snapshot.
- Geography: national, not state projections.
- Verified CSV fields: National Employment Matrix code/title, occupation type (`Summary` or `Line item`), employment in 2025 and 2035 (thousands), employment change (numeric and percent), and median annual wages (dollars, 2025).
- Growth field for the scatter: employment change, percent, 2025–2035. It is neither annual growth nor job openings. The table marks unavailable values with an em dash. The CSV has a title row, then a header row, followed by records and footer notes. The last two headers repeat the OOH-content label; they are not join keys or numeric fields. Preserve footer notes and exclude them from records.

The [occupational data documentation](https://www.bls.gov/emp/data/occupational-data.htm) describes the Matrix structure as based on OEWS and 2018 SOC. Actual inspection finds 831 projection line items and 281 summary rows. All 830 detailed OEWS codes match projection line items exactly, and titles agree after ignoring case, whitespace, and punctuation. Projection-only code `45-3031` (Fishing and hunting workers) has no OEWS record; exclude it from the scatter. Use exact codes, never fuzzy title matches.

The [data definitions](https://www.bls.gov/emp/documentation/definitions.htm) distinguish Matrix employment (including self-employment) from nonfarm payroll employment. The scatter compares different measures even when reference years align; it must identify both sources and the projection horizon.

## Usage terms

[BLS copyright policy](https://www.bls.gov/bls/linksite.htm) permits reuse of its public-domain material and requests source attribution, with exceptions for previously copyrighted photographs and illustrations. Cite BLS, program, periods, source URLs, and retrieval date on the dashboard and in the report. Do not use the BLS emblem to suggest endorsement.

## Verified compatibility and exclusions

- Seven OEWS codes occur at both broad and detailed levels. `(OCC_CODE, O_GROUP)` is unique in the source; filter `O_GROUP=detailed` before using occupation code as a unique key. Do not reject codes ending in zero: some are published detailed combined occupations.
- The bar input has 830 detailed occupations with numeric employment. The scatter has 825 exact-code matches with numeric annual median wages and projected growth.
- Exclude five occupations from the scatter only: Actors (`27-2011`), Dancers (`27-2031`), Musicians and Singers (`27-2042`), Disc Jockeys, Except Radio (`27-2091`), and Entertainers and Performers, Sports and Related Workers, All Other (`27-2099`). Their annual wages are unavailable; retain them for employment rankings.
- Growth values are numeric and include declines. Use the published percent-change field, not a recomputation from rounded employment totals. Projection employment is in thousands; OEWS employment is in jobs.
- No duplicate detailed codes, normalized title discrepancies, negative employment, or nonfinite numeric inputs were found. These are the results of the Phase 2 inspection.

## Phase 2 checks

- [x] Acquire both occupational CSV exports with source details.
- [x] Verify source periods, units, geography, fields, missing values, and aggregate exclusions.
- [x] Verify detailed occupation-code overlap and numeric chart eligibility.
- [x] Preserve classification, coverage, and CSV-export limitations.

Phase 2 inspection results are recorded above. Phase 3 generates `frontend/data/occupations.json` from the two CSVs for the bar chart and scatter plot; see [methodology.md](methodology.md).
