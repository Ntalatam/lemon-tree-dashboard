# LemonTree Insights

A data visualization and reporting dashboard that transforms NYC food access data into clear, actionable insights. Built for the **Morgan Stanley Code to Give Hackathon 2026 (Track B)** in partnership with [Lemontree](https://projecthospitality.org/).

---

## What is this?

Lemontree is a nonprofit platform that helps people find local food resources -- food pantries, soup kitchens, farmers markets -- and collects data about how well those resources serve community needs. Think of it as Yelp for food pantries.

**The problem:** Lemontree collects valuable data, but it isn't easy to organize, interpret, or share. Partners (food banks, donors, government agencies) don't have a way to view or understand it.

**Our solution:** LemonTree Insights is a full-stack dashboard that pulls live NYC food access data, combines it with community feedback and NLP-powered analysis, and presents it through interactive charts, maps, and shareable reports.

---

## Who is this for?

| Audience | What they get |
|---|---|
| **Food banks & pantries** | See how their customers feel about wait times, food quality, hours, and staff. Identify what to improve. |
| **Donors** | Understand which neighborhoods have the greatest unmet need. See how food insecurity, poverty, and resource availability intersect. |
| **Government agencies** | Identify which neighborhoods lack food bank coverage compared to demand. Compare supply gaps across boroughs and years. |
| **Lemontree team** | A ready-made analytics layer they can plug into their existing platform when their API becomes available. |

---

## Features

### Dashboard
- **KPI cards** showing neighborhoods tracked, individuals served, average food insecurity rate, and total food resource locations
- **Supply gap bar chart** ranking the top 15 neighborhoods by unmet food demand
- **Quarterly usage trends** showing food pantry visits and soup kitchen meals served from 2011-2025
- **Interactive map** (Leaflet) plotting all SNAP centers and farmers markets across NYC, color-coded by type with EBT acceptance indicators

### Neighborhoods Explorer
- Filterable, sortable table of all 197 NYC neighborhoods
- Filter by borough, sort by need score / supply gap / food insecurity rate
- Click any neighborhood to expand and see: unemployment rate, vulnerable population %, supply gap trend across 2022-2025, and a mini bar chart

### Feedback System
- **Submit feedback** for any of 15 real NYC food pantries with star rating and free-text comment
- **NLP auto-categorization**: every submission is automatically analyzed for sentiment (positive / negative / neutral) and categorized by issue type (wait time, food quality, hours, staff, accessibility, variety)
- **Feedback analytics**: sentiment distribution pie chart, top issue categories bar chart, rating histogram, and a keyword theme cloud
- 500 pre-generated synthetic feedback entries (seeded, reproducible) for demo purposes

### Report Generator
- Select a neighborhood and year to generate a combined report
- Includes: supply gap analysis table, community feedback summary, food resource location counts, and borough-level demographic data
- Print-friendly layout with a "Print / Save PDF" button

### About Page
- Data source documentation, methodology explanation, and extensibility notes

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Python 3.11+** | Runtime |
| **FastAPI** | Async web framework with auto-generated API docs at `/docs` |
| **httpx** | Async HTTP client for parallel API calls to NYC Open Data |
| **TextBlob** | NLP sentiment analysis and keyword extraction on user feedback |
| **Pydantic** | Request/response validation and serialization |
| **Uvicorn** | ASGI server |

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server with API proxy to backend |
| **Tailwind CSS 3** | Utility-first styling with custom color palette |
| **Recharts** | Bar charts, area charts, pie charts, histograms |
| **Leaflet + react-leaflet** | Interactive map with SNAP centers and farmers markets |
| **lucide-react** | Icon library |
| **React Router 6** | Client-side routing across 5 pages |

### Data Sources (all free, no API keys required)

| Dataset | Source | Records |
|---|---|---|
| NYC Emergency Food Supply Gap | [NYC Open Data](https://data.cityofnewyork.us/resource/4kc9-zrs2.json) | ~786 (197 neighborhoods x 4 years) |
| Community Food Connection Quarterly Report | [NYC Open Data](https://data.cityofnewyork.us/resource/mpqk-skis.json) | 116 (quarterly, 2011-2025) |
| SNAP Centers | [NYC Open Data](https://data.cityofnewyork.us/resource/tc6u-8rnp.json) | 13 |
| NYC Farmers Markets | [NYC Open Data](https://data.cityofnewyork.us/resource/8vwk-6iz2.json) | ~2,115 (multi-year) |
| US Census ACS 2022 | American Community Survey | 5 boroughs (hardcoded) |

---

## Architecture

```
React Frontend (Vite + Tailwind CSS)
    |
    | HTTP (JSON) via Vite dev proxy
    |
FastAPI Backend (Python, async)
    |
    |--- NYC Open Data APIs (Socrata SODA, no auth)
    |--- Synthetic Feedback Generator (seeded, deterministic)
    |--- NLP Pipeline (TextBlob sentiment + keyword categorization)
    |--- In-memory cache (1-hour TTL)
```

**No database required.** All data comes from live APIs and seeded synthetic generation. The backend caches API responses in memory with a 1-hour TTL to avoid hammering NYC Open Data.

---

## Project Structure

```
lemontree-insights/
  backend/
    main.py                  # FastAPI app with all API routes
    data_sources.py          # NYC Open Data fetching + caching + Census data
    feedback_generator.py    # Seeded synthetic feedback (500 entries)
    nlp_processor.py         # Sentiment analysis, categorization, keyword extraction
    models.py                # Pydantic request/response models
    requirements.txt         # Python dependencies

  frontend/
    index.html               # Entry HTML with Google Fonts + Leaflet CSS
    vite.config.js           # Vite config with /api proxy to backend
    tailwind.config.js       # Custom colors, fonts
    package.json             # npm dependencies
    src/
      App.jsx                # Router setup with error boundary
      main.jsx               # React entry point
      index.css              # Tailwind imports + CSS custom properties
      hooks/useApi.js        # Reusable data fetching hook
      utils/constants.js     # Color palettes, borough mappings
      utils/formatters.js    # Number, percentage, date formatting
      components/
        layout/Sidebar.jsx       # Responsive sidebar with mobile collapse
        layout/PageHeader.jsx    # Page title component
        shared/KPICard.jsx       # Metric card with icon
        shared/FilterBar.jsx     # Dropdown filter row
        shared/LoadingSpinner.jsx
        shared/SentimentBadge.jsx
        shared/CategoryTag.jsx
        shared/ErrorBoundary.jsx # Catches render crashes
        charts/SupplyGapChart.jsx
        charts/UsageTrendChart.jsx
        charts/SentimentPieChart.jsx
        charts/CategoryBarChart.jsx
        charts/RatingDistribution.jsx
        map/FoodResourceMap.jsx  # Leaflet map with CircleMarkers
        feedback/FeedbackForm.jsx
        feedback/FeedbackCard.jsx
        feedback/FeedbackFeed.jsx
      pages/
        Dashboard.jsx
        Neighborhoods.jsx
        Feedback.jsx
        Reports.jsx
        About.jsx
```

---

## Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- npm

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m textblob.download_corpora
uvicorn main:app --reload --port 8000
```

The API is now running at `http://localhost:8000`. Interactive docs are at `http://localhost:8000/docs`.

> **Note:** If `textblob.download_corpora` fails with an SSL error, run this instead:
> ```python
> python -c "import ssl; ssl._create_default_https_context = ssl._create_unverified_context; import nltk; nltk.download('punkt_tab'); nltk.download('averaged_perceptron_tagger_eng'); nltk.download('brown'); nltk.download('punkt')"
> ```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app is now running at `http://localhost:5173`. The Vite dev server automatically proxies all `/api/*` requests to the backend at port 8000.

---

## API Reference

| Method | Endpoint | Description | Key Params |
|---|---|---|---|
| GET | `/api/supply-gap` | Neighborhood supply gap data | `year`, `borough`, `limit` |
| GET | `/api/supply-gap/trends` | Year-over-year aggregated trends | -- |
| GET | `/api/usage` | Quarterly pantry + soup kitchen usage | -- |
| GET | `/api/locations` | SNAP centers + farmers markets | `type`, `borough`, `ebt_only` |
| GET | `/api/demographics` | Borough-level Census data | -- |
| GET | `/api/feedback` | Community feedback entries | `neighborhood`, `pantry`, `category`, `sentiment`, `limit` |
| GET | `/api/feedback/summary` | Aggregated feedback analytics | `neighborhood`, `pantry` |
| POST | `/api/feedback` | Submit new feedback (NLP auto-processed) | Body: `pantry_name`, `neighborhood`, `rating`, `comment` |
| GET | `/api/report` | Combined report for a neighborhood/year | `neighborhood`, `year` |
| GET | `/api/pantries` | List of pantries for form dropdowns | -- |

---

## How the NLP Pipeline Works

When a user submits feedback through the form:

1. **Sentiment analysis** -- TextBlob computes a polarity score (-1.0 to 1.0). Scores above 0.1 are positive, below -0.1 are negative, and between are neutral.

2. **Category detection** -- The comment is scanned for keywords mapped to 6 issue categories:
   - `wait_time` -- "wait", "line", "queue", "minutes", etc.
   - `food_quality` -- "fresh", "produce", "stale", "expired", etc.
   - `hours` -- "open", "closed", "schedule", "weekend", etc.
   - `staff` -- "volunteer", "rude", "kind", "helpful", etc.
   - `accessibility` -- "wheelchair", "elevator", "transit", "delivery", etc.
   - `variety` -- "halal", "kosher", "protein", "gluten", etc.

3. **Keyword extraction** -- TextBlob extracts noun phrases and significant words (nouns, adjectives), filters stop words, and returns the top terms by frequency.

The results are returned immediately in the API response and reflected in the dashboard charts.

---

## How the Synthetic Feedback Works

Since Lemontree's real user feedback isn't publicly available, we generate 500 realistic feedback entries at server startup using `seed=42` for reproducibility. The generator:

- Picks from 15 real NYC food pantries mapped to real Neighborhood Tabulation Areas (NTAs)
- Weights sentiment: 35% positive, 40% negative, 25% neutral (skewed negative to make the dashboard more interesting and useful for identifying issues)
- Fills in realistic details like wait times (5-15 min for positive, 30-90 min for negative)
- Assigns dates spread across the past 12 months

User-submitted feedback via the form is appended to this store and processed through the same NLP pipeline.

---

## Key Data Concepts

- **Supply Gap (lbs)**: A positive value means the neighborhood needs MORE food than it currently receives. Higher = more unmet demand. Negative = surplus.
- **Weighted Score**: A composite need metric combining food insecurity rate, unemployment, and vulnerable population percentage. Rank 1 = highest need.
- **NTA (Neighborhood Tabulation Area)**: NYC's geographic unit for neighborhood-level data. The prefix indicates borough: MN = Manhattan, BX = Bronx, BK = Brooklyn, QN = Queens, SI = Staten Island.
- **EBT Acceptance**: Whether a farmers market accepts Electronic Benefits Transfer (food stamps). Critical for food access equity.

---

## Design System

- **Color palette**: Warm off-white backgrounds (`#FAFAF8`), green for positive metrics (`#2D6A4F`), amber for gaps/alerts (`#E76F51`), blue for informational (`#264653`), gold for highlights (`#E9C46A`)
- **Typography**: DM Serif Display for headings (editorial, trustworthy), DM Sans for body text, JetBrains Mono for data values
- **Map tiles**: CartoDB Positron (clean, minimal)
- **Responsive**: Sidebar collapses to hamburger menu on mobile, charts and grids stack vertically

---

## Extensibility

This architecture is designed to integrate with Lemontree's real API when it becomes available:

- The backend's data fetching layer (`data_sources.py`) can be extended to pull from Lemontree's endpoints, replacing synthetic feedback with live community data
- Additional data layers can be added: USDA Food Access Research Atlas (food desert classifications), NYC DOHMH neighborhood health indicators, HUD housing data
- The report generator can be extended with PDF export (via html2canvas + jspdf) and scheduled email delivery
- The feedback NLP pipeline can be upgraded from keyword matching to a fine-tuned classifier for more accurate categorization

---

## Challenge Requirements Checklist

| Requirement | How we address it |
|---|---|
| Support a simple way to gather and process feedback | Feedback form with pantry dropdown, star rating, free-text comment |
| Automate cleaning, categorization, and summarization | TextBlob NLP pipeline: sentiment analysis, keyword categorization, theme extraction |
| Create visualizations showing trends, gaps, and recurring issues | Supply gap bar charts, usage trend area charts, sentiment pie charts, category distributions, interactive map |
| Empower partners to independently explore data | Filterable neighborhoods table, feedback feed with category/sentiment filters, report generator |
| Allow basic filtering by neighborhood, pantry, timeframe, resource type | Borough, neighborhood, pantry, sentiment, and category filters across all views |
| Enable layering with public datasets | Census ACS demographics (poverty rate, median income), NYC supply gap analysis, SNAP + farmers market locations |

---

## Credits

Built for the **Morgan Stanley Code to Give Hackathon 2026** in partnership with **Lemontree**.

Data provided by [NYC Open Data](https://opendata.cityofnewyork.us/) and the [U.S. Census Bureau](https://data.census.gov/).
