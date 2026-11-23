# U.S. Employment Statistics and Job Market Trends

## Purpose and scope

**Question:** How do employment opportunities, salaries, and projected job growth differ across occupations in the United States?

The primary audience is students and job seekers exploring career options. Employment levels describe estimated employment, not current vacancies or individual chances of getting hired.

The minimum viable dashboard covers national employment and median annual wages by occupation and occupational growth projections. It will have two interactive charts, clear source and period labels, responsive layouts, accessible controls, and useful loading, empty, and error states. Maps and modeling are deferred until the core application passes its checks.

Use static HTML, CSS, and vanilla JavaScript with Plotly.js 4.1.1 loaded from its CDN. Python and pandas run locally to prepare committed JSON; the deployed website needs no Python, server application, or database. Hosting target: GitHub Pages. Live website: https://manwillerc.github.io/JobMarketTrendsApplication/.

## Repository inspection — November 22, 2026

- New Git repository on `main`, with no commits or application files at inspection.
- Existing untracked `.vscode/` directory is preserved.
- Initial inspection found only editor settings; application implementation is pending.

## Proposed sources and chart mapping

| Chart | Official BLS program | Measurement and planned interaction |
| --- | --- | --- |
| Horizontal bar: employment by occupation | [Occupational Employment and Wage Statistics (OEWS)](https://www.bls.gov/oes/) | National employment estimates, in jobs, for detailed occupations; top-N and reliable occupation-group filters. Exclude aggregate totals from rankings. |
| Scatter: salary versus projected growth | [OEWS](https://www.bls.gov/oes/) and [Employment Projections](https://www.bls.gov/emp/) | Median annual wage in USD versus projected occupational employment change in percent; occupation search/group selection and tooltips showing both source periods. |

Phase 2 is complete using the supplied CSV exports. [Source details and verification results](frontend/docs/sources.md) confirm May 2025 OEWS and 2025–2035 projections. All 830 detailed OEWS occupation codes match projections; 825 have annual wages for the scatter. Original workbooks were not retained; provenance and CSV limitations are documented.

## Browser data contract

The processed JSON file contains `metadata` and `records`. Metadata will identify source URLs, release/retrieval dates, geography, units, definitions, and classification versions. Input fields and compatibility are documented in the source notes.

`frontend/data/occupations.json`: one record per compatible detailed occupation, keyed by `occupation_code` (SOC string).

| Fields | Type and meaning |
| --- | --- |
| `occupation_code`, `title` | Strings; retain source codes, including leading zeros. |
| `major_group_code`, `major_group_title` | Strings or null; derived only from a verified classification. |
| `employment`, `median_annual_wage_usd` | Number or null; jobs and USD/year, respectively. |
| `oews_reference_period` | String identifying the estimate's reference period. |
| `projected_growth_pct` | Number or null; percentage change, not a fraction. |
| `projection_start_year`, `projection_end_year` | Integers specifying the projection horizon. |
| `missing_reasons` | Object identifying missing, suppressed, top-coded, or unmatched fields. |

Retain OEWS occupations without projections for the bar chart. The scatter uses only records with compatible codes and available numeric wages and growth. No fuzzy title joins; document any official crosswalk, exclusions, and unmatched codes. Keep source-specific measurement definitions distinct even when codes match.

Never replace missing values with zero. Preserve negative growth. Validate duplicate keys, numeric ranges, units, periods, and output counts. Record suppression and special-value handling before preprocessing.

## Implementation checklist

- [x] **Phase 1 — Plan:** inspect repository; document audience, scope, schemas, source/chart mappings, and checklist. Acceptance: no existing work removed and a concrete plan recorded.
- [x] **Phase 2 — Verify data:** acquire exact official files or reproducible download instructions; inspect classifications, columns, units, missing values, and terms; write `frontend/docs/sources.md`. Acceptance: verified real inputs for every chart.
- [x] **Phase 3 — Prepare data:** added `backend/requirements.txt`, `backend/process_data.py`, `frontend/data/occupations.json`, and `frontend/docs/methodology.md`. Run instructions are in this README and methodology to keep documentation small. Acceptance: one documented command regenerates validated outputs.
- [x] **Phase 4 — Build shell:** add `index.html`, `style.css`, and `script.js`; load relative JSON paths and support mobile, loading, empty, and error states. Acceptance: local HTTP serving works without uncaught errors.
- [x] **Phase 5 — Build charts:** implement a bar chart and scatter plot with real data, units, source periods, attribution, and tooltips. Acceptance: all charts render correctly.
- [x] **Phase 6 — Polish interactions:** verify filters, reset, resizing, keyboard access, focus, contrast, and textual descriptions. Acceptance: controls work and measurement boundaries remain clear.
- [x] **Phase 7 — Analyze:** write reproducible findings with actual values/years in `frontend/docs/findings.md`; document methods and limitations. Acceptance: every finding is supported by processed data.
- [x] **Phase 8 — Deploy:** test locally, publish source and configure GitHub Pages with appropriate authorization, verify the public site, and add repository/live links. Acceptance: live charts and interactions work.
- [ ] **Phase 9 — Deliver:** prepare a 10-minute presentation plus 2-minute Q&A outline, 4–6 page report material, and submission checklist. Acceptance: verified links, findings, and required deliverables; request personal identifiers only when needed.

Complete and report each phase's checks before starting the next phase; wait for user approval between phases as specified in the supplied build plan.

## Local development plan

Use the existing Miniconda environment if one is available (`conda env list` then `conda activate <name>`). If a new environment is needed, the proposed setup is:

```bash
conda create -n jobmarket python=3.12
conda activate jobmarket
```

The input files are in `backend/raw_data/`, with source details in [frontend/docs/sources.md](frontend/docs/sources.md). Install dependencies with `python -m pip install -r backend/requirements.txt`, then generate the chart data with `python backend/process_data.py`. See [methodology](frontend/docs/methodology.md) for cleaning steps and checks. Once the website exists, serve the frontend folder with `python -m http.server 8000 --directory frontend` and open `http://localhost:8000/`; direct `file://` viewing may block JSON fetches. Both charts are implemented; the scatter includes an occupation-group filter and zoom reset.

## Course deadlines

- November 22, 2026, 11:55 PM: presentation slides due.
- November 23, November 30, or December 4: presentation dates, assigned in random order.
- December 4, 2026, 11:55 PM: final ZIP due, named `FinalProject-FirstName LastName-FSU_ID.zip`.

Final submission requires repository and live website links plus the report PDF; slides are submitted separately. Deadlines above are transcribed from the supplied plan.

## Preview the website

```bash
python -m http.server 8000 --directory frontend
```

Open http://localhost:8000/. The page shows the ten largest occupations by estimated employment and a scatter plot of annual wages versus projected growth. Hover or tap for occupation details and source periods. The pinned Plotly CDN script requires an internet connection. The scatter starts with Computer and Mathematical Occupations for readability. Choose another occupation group or All occupations, drag to zoom, and use Reset zoom to restore the view.

## Folder structure

- `frontend/`: HTML, CSS, JavaScript, processed data, and source/methodology notes served with the website.
- `backend/`: Python data preparation, raw CSVs, and Python requirements. Run locally to generate frontend data.

For GitHub Pages deployment, use a workflow that publishes `frontend/`.

The scatter supports search within the selected group, Clear filters (all occupations), Reset zoom, and a collapsible table with the matching values. The employment bar chart always shows the national top ten.

## Findings

See [findings and reproduction commands](frontend/docs/findings.md) for employment and wage rankings, projected growth, and limitations.

## GitHub Pages deployment

Repository: https://github.com/manwillerc/JobMarketTrendsApplication

The workflow in `.github/workflows/pages.yml` publishes only `frontend/` when `main` is pushed. In repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. Workflow setup follows [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Live website: https://manwillerc.github.io/JobMarketTrendsApplication/

Deployment and live browser verification passed November 22, 2026: HTTP 200, ten employment bars, 825 scatter/table records with All occupations selected, occupation search, and mobile layout without uncaught JavaScript errors.

Local checks passed: data regeneration, JavaScript syntax, both charts, filters, empty/error states, and mobile resizing without uncaught JavaScript errors.
