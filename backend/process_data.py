"""Prepare both occupation charts: python backend/process_data.py"""

import json
import math
from pathlib import Path

import pandas as pd

root = Path(__file__).resolve().parent
oews = pd.read_csv(root / "raw_data/oews_national_may_2025.csv", dtype=str, keep_default_na=False)
projections = pd.read_csv(root / "raw_data/projections_2025_2035.csv", skiprows=1, dtype=str, keep_default_na=False)

# Published detailed occupations include some combined codes ending in zero.
groups = oews[oews["O_GROUP"] == "major"].set_index("OCC_CODE")["OCC_TITLE"]
occupations = oews[oews["O_GROUP"] == "detailed"].copy()
projections = projections[projections["Occupation type"] == "Line item"]
growth = projections[["2025 National Employment Matrix code", "Employment change, percent, 2025–35"]]
growth = growth.rename(columns={"2025 National Employment Matrix code": "OCC_CODE", "Employment change, percent, 2025–35": "projected_growth_pct"})
occupations = occupations.merge(growth, on="OCC_CODE", how="left", validate="one_to_one")
occupations = occupations.rename(columns={"OCC_CODE": "occupation_code", "OCC_TITLE": "title", "TOT_EMP": "employment", "A_MEDIAN": "median_annual_wage_usd"})

# Only known missing markers become null. Unexpected text raises an error.
for column in ["employment", "median_annual_wage_usd", "projected_growth_pct"]:
    values = occupations[column].str.replace(",", "", regex=False).replace({"*": None, "—": None, "": None})
    occupations[column] = pd.to_numeric(values, errors="raise")
    if not occupations[column].dropna().map(math.isfinite).all():
        raise ValueError(f"Nonfinite numbers in {column}")

occupations["major_group_code"] = occupations["occupation_code"].str[:2] + "-0000"
occupations["major_group_title"] = occupations["major_group_code"].map(groups)
occupations["oews_reference_period"] = "May 2025"
occupations["projection_start_year"] = 2025
occupations["projection_end_year"] = 2035
occupations["missing_reasons"] = [
    {"median_annual_wage_usd": "Annual wage unavailable; source marker *; hourly-only occupation"} if pd.isna(wage) else {}
    for wage in occupations["median_annual_wage_usd"]
]

if len(occupations) != 830 or not occupations["occupation_code"].is_unique:
    raise ValueError("Expected 830 unique detailed occupations")
if not occupations["employment"].ge(0).all() or not occupations["median_annual_wage_usd"].dropna().gt(0).all():
    raise ValueError("Invalid employment or wage values")
if not occupations["projected_growth_pct"].ge(-100).all() or occupations["major_group_title"].isna().any():
    raise ValueError("Missing group/projection or invalid growth")
if occupations["median_annual_wage_usd"].notna().sum() != 825:
    raise ValueError("Expected 825 occupations with annual wages")

columns = ["occupation_code", "title", "major_group_code", "major_group_title", "employment", "median_annual_wage_usd", "projected_growth_pct", "oews_reference_period", "projection_start_year", "projection_end_year", "missing_reasons"]
metadata = {
    "geography": "United States",
    "classification": "2018 SOC; published OEWS detailed occupations",
    "oews_reference_period": "May 2025",
    "projection_period": "2025–2035",
    "units": {"employment": "jobs", "median_annual_wage_usd": "USD per year", "projected_growth_pct": "percent change over 2025–2035"},
    "sources": [
        {"program": "BLS OEWS", "url": "https://www.bls.gov/oes/special-requests/oesm25nat.zip", "release_date": "2026-05-15"},
        {"program": "BLS Employment Projections, Table 1.2", "url": "https://www.bls.gov/emp/ind-occ-matrix/occupation.xlsx", "release_date": "2026-08-27"},
    ],
    "csv_received_date": "2026-11-22",
    "original_download_date": None,
    "note": "OEWS covers wage and salary employment; projection growth uses the broader National Employment Matrix, including self-employment. Employment is not job openings.",
}
# pandas converts missing numeric values to valid JSON nulls.
records = json.loads(occupations[columns].sort_values("occupation_code").to_json(orient="records"))
output = root.parent / "frontend/data/occupations.json"
output.parent.mkdir(exist_ok=True)
output.write_text(json.dumps({"metadata": metadata, "records": records}, ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n")
print("Saved frontend/data/occupations.json: 830 occupations; 825 with annual wages; 5 missing annual wages.")
