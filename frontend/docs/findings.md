# Findings

These findings describe the supplied national BLS data: May 2025 occupational employment and wages, and projected employment change over 2025–2035. Rankings use 830 published detailed occupations; wage comparisons use the 825 with available annual median wages.

## Largest occupations

Home Health and Personal Care Aides (`31-1120`) had the largest estimated employment in the dataset: **4,305,810 jobs in May 2025**. Retail Salespersons followed at **3,897,860**, and Fast Food and Counter Workers at **3,854,050**. These are filled-job estimates, not advertised openings. The employment bar chart presents this ranking.

## Highest available median annual wages

Pediatric Surgeons (`29-1243`) had the highest available median annual wage: **$559,030 in May 2025**. Cardiologists followed at **$496,010**, then Radiologists at **$420,860**. These are medians within occupations, not starting salaries or the average across all occupations. The scatter plot includes these occupations when their groups or All occupations are selected; the table provides exact values.

## Fastest projected growth

Nurse Practitioners (`29-1171`) had the largest projected employment increase by percentage among matched occupations: **41.0% over 2025–2035**. Solar Photovoltaic Installers followed at **36.5%**, and Data Scientists at **34.6%**. This is change over the whole decade, not an annual rate. A high percentage does not by itself imply a large number of new jobs.

## Declines are also part of the outlook

**231 of the 830 occupations** have negative projected employment growth over **2025–2035**. This counts occupation categories equally; it is not the percentage of workers expected to lose jobs. Negative growth also does not imply that an occupation will have no replacement openings.

## Methods and reproduction

The analysis uses descriptive ranking and counting: sort available numeric values in descending order and count negative growth rates. No forecasting model or historical time-series analysis is performed by this project. BLS supplies the projections.

Regenerate the dataset with `python backend/process_data.py`. Then run this from the repository root to reproduce the rankings and decline count:

```bash
python - <<'PY'
import json
from pathlib import Path
rows = json.loads(Path('frontend/data/occupations.json').read_text())['records']
for field in ['employment', 'median_annual_wage_usd', 'projected_growth_pct']:
    available = [row for row in rows if row[field] is not None]
    print(field)
    for row in sorted(available, key=lambda row: row[field], reverse=True)[:3]:
        print(row['title'], row[field])
print('Occupations with declining employment:', sum(row['projected_growth_pct'] < 0 for row in rows))
PY
```

## Interpretation and limitations

- National estimates do not show state or local differences, individual qualifications, entry-level pay, or hiring conditions.
- OEWS estimates wage and salary employment; the projection employment base includes self-employment. Matching codes does not make these coverage definitions identical.
- Wage and employment estimates refer to May 2025; growth refers to 2025–2035. Projections are uncertain and do not guarantee future demand.
- Five hourly-only occupations lack annual wages and are excluded from salary comparisons, but remain in employment and growth counts. Fishing and hunting workers appears only in projections and is excluded from the matched dataset.
- Rankings use published detailed categories, including combined occupations. Aggregates are excluded to avoid double counting. Classification choices affect comparisons.
- Inputs are CSV exports; full workbook legends and original download dates were not supplied. No missing wage was replaced with zero or inferred from hourly pay.
- The dashboard compares employment levels, wages, and projected growth; it does not measure current vacancies or establish that higher wages cause growth.

Sources: [BLS OEWS](https://www.bls.gov/oes/) and [BLS Employment Projections](https://www.bls.gov/emp/). Exact files, source periods, and exclusions are documented in [sources.md](sources.md); preparation is documented in [methodology.md](methodology.md).
