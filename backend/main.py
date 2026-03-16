from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import csv
import io

from models import FeedbackCreate
from data_sources import get_supply_gap, get_supply_gap_trends, get_usage_data, get_locations, get_demographics, VALID_YEARS, NTA_TO_BOROUGH, CENSUS_DATA
from feedback_generator import generate_feedback, PANTRIES
from nlp_processor import analyze_sentiment, categorize_feedback, extract_keywords, summarize_feedback

app = FastAPI(title="LemonTree Insights API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Generate synthetic feedback once at startup
feedback_store: list[dict] = generate_feedback(500, seed=42)


@app.get("/api/supply-gap")
async def supply_gap(
    year: str = Query("2025"),
    borough: str | None = Query(None),
    limit: int = Query(200),
):
    data = await get_supply_gap(year=year, borough=borough, limit=limit)
    return {"data": data, "count": len(data)}


@app.get("/api/supply-gap/trends")
async def supply_gap_trends():
    data = await get_supply_gap_trends()
    return {"data": data}


@app.get("/api/usage")
async def usage():
    data = await get_usage_data()
    return {"data": data}


@app.get("/api/locations")
async def locations(
    type: str = Query("all"),
    borough: str | None = Query(None),
    ebt_only: bool = Query(False),
):
    data = await get_locations(loc_type=type, borough=borough, ebt_only=ebt_only)
    return {"data": data, "count": len(data)}


@app.get("/api/demographics")
async def demographics():
    return {"data": get_demographics()}


@app.get("/api/feedback")
async def get_feedback(
    neighborhood: str | None = Query(None),
    pantry: str | None = Query(None),
    category: str | None = Query(None),
    sentiment: str | None = Query(None),
    limit: int = Query(50),
):
    filtered = feedback_store
    if neighborhood:
        filtered = [f for f in filtered if f["neighborhood"].lower() == neighborhood.lower()]
    if pantry:
        filtered = [f for f in filtered if f["pantry_name"].lower() == pantry.lower()]
    if category:
        filtered = [f for f in filtered if category in f["categories"]]
    if sentiment:
        filtered = [f for f in filtered if f["sentiment"] == sentiment]
    filtered = sorted(filtered, key=lambda x: x["date"], reverse=True)[:limit]
    return {"data": filtered, "count": len(filtered)}


@app.get("/api/feedback/summary")
async def feedback_summary(
    neighborhood: str | None = Query(None),
    pantry: str | None = Query(None),
):
    filtered = feedback_store
    if neighborhood:
        filtered = [f for f in filtered if f["neighborhood"].lower() == neighborhood.lower()]
    if pantry:
        filtered = [f for f in filtered if f["pantry_name"].lower() == pantry.lower()]
    summary = summarize_feedback(filtered)
    return {"data": summary}


@app.post("/api/feedback")
async def submit_feedback(body: FeedbackCreate):
    if not 1 <= body.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    if len(body.comment.strip()) < 3:
        raise HTTPException(status_code=400, detail="Comment must be at least 3 characters")

    sentiment, score = analyze_sentiment(body.comment)
    categories = categorize_feedback(body.comment)
    keywords = extract_keywords(body.comment)

    # Find NTA for pantry
    pantry_lookup = {p["name"].lower(): p["nta"] for p in PANTRIES}
    nta = pantry_lookup.get(body.pantry_name.lower(), "")

    new_id = max((f["id"] for f in feedback_store), default=0) + 1
    entry = {
        "id": new_id,
        "pantry_name": body.pantry_name,
        "neighborhood": body.neighborhood,
        "nta": nta,
        "rating": body.rating,
        "comment": body.comment,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "sentiment": sentiment,
        "sentiment_score": score,
        "categories": categories,
        "keywords": [kw for kw, _ in keywords],
    }
    feedback_store.insert(0, entry)
    return {"data": entry}


@app.get("/api/report")
async def report(
    neighborhood: str | None = Query(None),
    year: str = Query("2025"),
):
    supply = await get_supply_gap(year=year)
    if neighborhood:
        supply = [s for s in supply if s.get("nta_name", "").lower() == neighborhood.lower()]

    filtered_feedback = feedback_store
    if neighborhood:
        filtered_feedback = [f for f in filtered_feedback if f["neighborhood"].lower() == neighborhood.lower()]
    fb_summary = summarize_feedback(filtered_feedback)

    all_locations = await get_locations()
    location_counts = {
        "snap_centers": len([l for l in all_locations if l["type"] == "snap_center"]),
        "farmers_markets": len([l for l in all_locations if l["type"] == "farmers_market"]),
    }

    demo = get_demographics()

    return {
        "data": {
            "supply_gap": supply,
            "feedback_summary": fb_summary,
            "location_counts": location_counts,
            "demographics": demo,
            "generated_at": datetime.now().isoformat(),
            "filters": {"neighborhood": neighborhood, "year": year},
        }
    }


@app.get("/api/pantries")
async def pantries():
    return {"data": [{"name": p["name"], "neighborhood": p["neighborhood"], "nta": p["nta"]} for p in PANTRIES]}


@app.get("/api/borough-comparison")
async def borough_comparison(year: str = Query("2025")):
    """Compare all 5 boroughs across multiple metrics for radar chart visualization."""
    data = await get_supply_gap(year=year, limit=1000)
    demo = get_demographics()
    demo_map = {d["borough"]: d for d in demo}

    boroughs_data = {}
    for r in data:
        b = r.get("borough", "Unknown")
        if b == "Unknown":
            continue
        boroughs_data.setdefault(b, []).append(r)

    # Also get feedback stats per borough
    borough_feedback = {}
    for f in feedback_store:
        nta = f.get("nta", "")
        prefix = nta[:2].upper()
        b = NTA_TO_BOROUGH.get(prefix, "Unknown")
        if b != "Unknown":
            borough_feedback.setdefault(b, []).append(f)

    result = []
    for borough, records in boroughs_data.items():
        gaps = [r.get("supply_gap_lbs", 0) for r in records if isinstance(r.get("supply_gap_lbs"), (int, float))]
        insecurity = [r.get("food_insecure_percentage", 0) for r in records if isinstance(r.get("food_insecure_percentage"), (int, float))]
        unemployment = [r.get("unemployment_rate", 0) for r in records if isinstance(r.get("unemployment_rate"), (int, float))]
        vulnerable = [r.get("vulnerable_population", 0) for r in records if isinstance(r.get("vulnerable_population"), (int, float))]
        scores = [r.get("weighted_score", 0) for r in records if isinstance(r.get("weighted_score"), (int, float))]

        fb_list = borough_feedback.get(borough, [])
        fb_ratings = [f["rating"] for f in fb_list]

        d = demo_map.get(borough, {})

        result.append({
            "borough": borough,
            "neighborhoods": len(records),
            "avg_supply_gap": round(sum(gaps) / len(gaps), 2) if gaps else 0,
            "avg_food_insecurity": round(sum(insecurity) / len(insecurity) * 100, 2) if insecurity else 0,
            "avg_unemployment": round(sum(unemployment) / len(unemployment) * 100, 2) if unemployment else 0,
            "avg_vulnerable_pop": round(sum(vulnerable) / len(vulnerable) * 100, 2) if vulnerable else 0,
            "avg_need_score": round(sum(scores) / len(scores), 2) if scores else 0,
            "max_need_score": round(max(scores), 2) if scores else 0,
            "total_supply_gap": round(sum(gaps), 0) if gaps else 0,
            "poverty_rate": d.get("poverty_rate", 0),
            "median_income": d.get("median_household_income", 0),
            "population": d.get("total_pop_poverty_universe", 0),
            "feedback_count": len(fb_list),
            "avg_rating": round(sum(fb_ratings) / len(fb_ratings), 2) if fb_ratings else 0,
            "highest_need_neighborhood": max(records, key=lambda r: r.get("weighted_score", 0)).get("nta_name", "") if records else "",
        })

    result.sort(key=lambda x: x["avg_need_score"], reverse=True)
    return {"data": result}


@app.get("/api/insights")
async def insights(year: str = Query("2025")):
    """Auto-generate plain-English data insights for the dashboard."""
    data = await get_supply_gap(year=year, limit=1000)
    trends = await get_supply_gap_trends()
    usage = await get_usage_data()

    highlights = []

    if data:
        # Highest need neighborhood
        top = max(data, key=lambda r: r.get("weighted_score", 0))
        highlights.append({
            "type": "critical",
            "title": "Highest Need Area",
            "text": f"{top.get('nta_name', 'Unknown')} in {top.get('borough', '')} has the highest need score ({top.get('weighted_score', 0):.1f}) with a supply gap of {top.get('supply_gap_lbs', 0):,.0f} lbs.",
        })

        # Neighborhoods with severe gaps
        severe = [r for r in data if isinstance(r.get("supply_gap_lbs"), (int, float)) and r["supply_gap_lbs"] > 2_000_000]
        if severe:
            highlights.append({
                "type": "warning",
                "title": "Severe Supply Gaps",
                "text": f"{len(severe)} neighborhoods have supply gaps exceeding 2 million lbs, indicating significant unmet food demand.",
            })

        # Borough disparity
        borough_insecurity = {}
        for r in data:
            b = r.get("borough", "Unknown")
            val = r.get("food_insecure_percentage", 0)
            if isinstance(val, (int, float)):
                borough_insecurity.setdefault(b, []).append(val)
        if borough_insecurity:
            borough_avg = {b: sum(v)/len(v) for b, v in borough_insecurity.items() if v}
            if len(borough_avg) >= 2:
                worst = max(borough_avg, key=borough_avg.get)
                best = min(borough_avg, key=borough_avg.get)
                ratio = borough_avg[worst] / borough_avg[best] if borough_avg[best] > 0 else 0
                highlights.append({
                    "type": "insight",
                    "title": "Borough Disparity",
                    "text": f"{worst} has {ratio:.1f}x the food insecurity rate of {best} ({borough_avg[worst]*100:.1f}% vs {borough_avg[best]*100:.1f}%).",
                })

    # Year-over-year trends
    if len(trends) >= 2:
        latest = trends[-1]
        prev = trends[-2]
        gap_change = latest["avg_supply_gap"] - prev["avg_supply_gap"]
        direction = "increased" if gap_change > 0 else "decreased"
        highlights.append({
            "type": "trend",
            "title": "Year-over-Year Trend",
            "text": f"Average supply gap {direction} by {abs(gap_change):,.0f} lbs from {prev['year']} to {latest['year']}.",
        })

    # Usage stats
    pantry_data = usage.get("pantry_individuals", [])
    if len(pantry_data) >= 2:
        latest_q = pantry_data[-1]["value"]
        prev_q = pantry_data[-2]["value"]
        pct_change = ((latest_q - prev_q) / prev_q * 100) if prev_q > 0 else 0
        direction = "up" if pct_change > 0 else "down"
        highlights.append({
            "type": "trend",
            "title": "Pantry Usage Trend",
            "text": f"Individuals served by food pantries is {direction} {abs(pct_change):.1f}% quarter-over-quarter ({latest_q:,} in the latest quarter).",
        })

    # Feedback insights
    sentiments = {"positive": 0, "negative": 0, "neutral": 0}
    for f in feedback_store:
        sentiments[f.get("sentiment", "neutral")] += 1
    total_fb = sum(sentiments.values())
    if total_fb > 0:
        neg_pct = sentiments["negative"] / total_fb * 100
        top_issues = {}
        for f in feedback_store:
            for cat in f.get("categories", []):
                top_issues[cat] = top_issues.get(cat, 0) + 1
        top_issue = max(top_issues, key=top_issues.get) if top_issues else "general"
        highlights.append({
            "type": "feedback",
            "title": "Community Sentiment",
            "text": f"{neg_pct:.0f}% of {total_fb} community feedback responses are negative. The most reported issue category is \"{top_issue.replace('_', ' ')}\".",
        })

    return {"data": highlights}


@app.get("/api/export/supply-gap")
async def export_supply_gap_csv(year: str = Query("2025")):
    """Export supply gap data as CSV download."""
    data = await get_supply_gap(year=year, limit=1000)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["nta", "nta_name", "borough", "supply_gap_lbs", "food_insecure_percentage", "unemployment_rate", "vulnerable_population", "weighted_score", "rank"])
    writer.writeheader()
    for r in data:
        writer.writerow({k: r.get(k, "") for k in writer.fieldnames})
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=supply_gap_{year}.csv"},
    )


@app.get("/api/export/feedback")
async def export_feedback_csv():
    """Export feedback data as CSV download."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "pantry_name", "neighborhood", "rating", "comment", "date", "sentiment", "categories"])
    writer.writeheader()
    for f in feedback_store:
        row = {k: f.get(k, "") for k in writer.fieldnames}
        row["categories"] = ", ".join(f.get("categories", []))
        writer.writerow(row)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=feedback_export.csv"},
    )


@app.get("/api/correlation")
async def correlation_data(year: str = Query("2025")):
    """Return per-neighborhood data points for scatter plot (unemployment vs food insecurity)."""
    data = await get_supply_gap(year=year, limit=1000)
    points = []
    for r in data:
        unemployment = r.get("unemployment_rate")
        insecurity = r.get("food_insecure_percentage")
        if isinstance(unemployment, (int, float)) and isinstance(insecurity, (int, float)):
            points.append({
                "name": r.get("nta_name", ""),
                "borough": r.get("borough", ""),
                "unemployment": round(unemployment * 100, 2),
                "food_insecurity": round(insecurity * 100, 2),
                "supply_gap": r.get("supply_gap_lbs", 0),
                "weighted_score": r.get("weighted_score", 0),
            })
    return {"data": points}
