from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from models import FeedbackCreate
from data_sources import get_supply_gap, get_supply_gap_trends, get_usage_data, get_locations, get_demographics
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
    sentiment, score = analyze_sentiment(body.comment)
    categories = categorize_feedback(body.comment)
    keywords = extract_keywords(body.comment)

    # Find NTA for pantry
    nta = ""
    for p in PANTRIES:
        if p["name"].lower() == body.pantry_name.lower():
            nta = p["nta"]
            break

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
