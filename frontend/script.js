const status = document.querySelector("#data-status");
const count = document.querySelector("#data-count");
const employmentChart = document.querySelector("#employment-chart");
const growthChart = document.querySelector("#growth-chart");

async function loadData() {
  try {
    const response = await fetch("./data/occupations.json");
    if (!response.ok) throw new Error(`Dataset request failed (${response.status}).`);
    const data = await response.json();
    if (!Array.isArray(data.records)) throw new Error("The dataset has no occupation records.");
    const occupations = data.records;
    if (!occupations.length) {
      count.textContent = "No occupations available";
      status.textContent = "The dataset is empty. Add occupation records to view comparisons.";
      employmentChart.textContent = "No employment data available.";
      growthChart.textContent = "No wage and growth data available.";
      return;
    }
    const wages = occupations.filter(row => Number.isFinite(row.median_annual_wage_usd) && Number.isFinite(row.projected_growth_pct));
    count.textContent = `${occupations.length.toLocaleString()} occupations in the dataset`;
    status.textContent = `Data loaded. ${wages.length.toLocaleString()} occupations have annual wages and projected growth.`;
    if (!window.Plotly) throw new Error("The chart library could not load. Check your internet connection and reload.");
    const group = document.querySelector("#occupation-group");
    const reset = document.querySelector("#reset-scatter");
    const search = document.querySelector("#occupation-search");
    const clear = document.querySelector("#clear-filters");
    const groups = new Map(occupations.map(row => [row.major_group_code, row.major_group_title]));
    for (const [code, title] of [...groups].sort((a, b) => a[1].localeCompare(b[1]))) {
      group.add(new Option(title, code));
    }
    group.value = groups.has("15-0000") ? "15-0000" : "";
    group.disabled = false;
    reset.disabled = search.disabled = clear.disabled = false;
    const updateScatter = () => {
      const matches = row => (!group.value || row.major_group_code === group.value)
        && row.title.toLowerCase().includes(search.value.trim().toLowerCase());
      const selected = wages.filter(matches);
      const total = occupations.filter(matches).length;
      document.querySelector("#scatter-summary").textContent = `${group.selectedOptions[0].text}: ${selected.length} occupations shown; ${total - selected.length} without annual wages omitted.`;
      const body = document.querySelector("#occupation-rows");
      body.replaceChildren();
      for (const row of [...selected].sort((a, b) => a.title.localeCompare(b.title))) {
        const tr = document.createElement("tr");
        for (const value of [row.title, row.median_annual_wage_usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), `${row.projected_growth_pct.toFixed(1)}%`]) {
          const td = document.createElement("td");
          td.textContent = value;
          tr.append(td);
        }
        body.append(tr);
      }
      if (!selected.length) body.innerHTML = '<tr><td colspan="3">No matching occupations with annual wages.</td></tr>';
      return drawScatter(selected);
    };
    group.addEventListener("change", updateScatter);
    search.addEventListener("input", updateScatter);
    clear.addEventListener("click", () => {
      group.value = "";
      search.value = "";
      updateScatter();
    });
    reset.addEventListener("click", () => Plotly.relayout(growthChart, { "xaxis.autorange": true, "yaxis.autorange": true }));
    await drawCharts(occupations);
    await updateScatter();

  } catch (error) {
    count.textContent = "Data unavailable";
    status.classList.add("error");
    status.textContent = `Unable to load occupation data. ${error.message} From the repository root run python -m http.server 8000 --directory frontend and open http://localhost:8000/.`;
    employmentChart.textContent = "Employment data could not be loaded.";
    growthChart.textContent = "Wage and growth data could not be loaded.";
  } finally {
    employmentChart.setAttribute("aria-busy", "false");
    growthChart.setAttribute("aria-busy", "false");
  }
}

function drawCharts(occupations) {
  const top = occupations.filter(row => Number.isFinite(row.employment))
    .sort((a, b) => b.employment - a.employment).slice(0, 10);
  employmentChart.replaceChildren();
  if (!top.length) {
    employmentChart.textContent = "No employment estimates available.";
    return;
  }
  const list = document.createElement("ol");
  list.className = "employment-bars";
  for (const row of top) {
    const item = document.createElement("li");
    const heading = document.createElement("div");
    heading.className = "bar-label";
    const title = document.createElement("span");
    title.textContent = row.title;
    const value = document.createElement("strong");
    value.textContent = `${row.employment.toLocaleString()} jobs`;
    heading.append(title, value);
    const track = document.createElement("div");
    track.className = "bar-track";
    track.setAttribute("aria-hidden", "true");
    const bar = document.createElement("div");
    bar.className = "bar-fill";
    bar.style.width = `${row.employment / top[0].employment * 100}%`;
    track.append(bar);
    item.append(heading, track);
    item.title = `${row.title}: ${row.employment.toLocaleString()} estimated jobs · BLS OEWS · May 2025`;
    list.append(item);
  }
  employmentChart.append(list);
}

async function drawScatter(wages) {
  const font = { family: "system-ui, sans-serif", color: "#172d3d", size: 14 };
  Plotly.purge(growthChart);
  growthChart.textContent = "";
  if (wages.length) {
    await Plotly.newPlot(growthChart, [{
      type: "scatter", mode: "markers",
      x: wages.map(row => row.median_annual_wage_usd),
      y: wages.map(row => row.projected_growth_pct),
      customdata: wages.map(row => row.title),
      marker: { color: "#2475a3", size: 7, opacity: 0.45, line: { color: "#125077", width: 0.5 } },
      hovertemplate: "%{customdata}<br>Median annual wage: $%{x:,.0f}<br>Projected growth: %{y:.1f}%<br>BLS OEWS · May 2025 wages<br>BLS Employment Projections · 2025–2035<extra></extra>"
    }], {
      font, height: 570, margin: { l: 65, r: 20, t: 20, b: 70 },
      xaxis: { title: { text: "Median annual wage (USD)" }, tickprefix: "$", tickformat: "~s", rangemode: "tozero" },
      yaxis: { title: { text: "Projected growth (%)" }, ticksuffix: "%", zerolinecolor: "#788e9f" },
      paper_bgcolor: "transparent", plot_bgcolor: "transparent", hovermode: "closest", dragmode: "zoom"
    }, { responsive: true, displaylogo: false, displayModeBar: false });
  } else growthChart.textContent = "No occupations have both annual wages and projected growth.";
}

loadData();
