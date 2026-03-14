import hashlib
import time
import httpx

_cache: dict[str, tuple[float, any]] = {}
CACHE_TTL = 3600  # 1 hour

NYC_SUPPLY_GAP_URL = "https://data.cityofnewyork.us/resource/4kc9-zrs2.json"
NYC_CFC_URL = "https://data.cityofnewyork.us/resource/mpqk-skis.json"
NYC_SNAP_URL = "https://data.cityofnewyork.us/resource/tc6u-8rnp.json"
NYC_FARMERS_URL = "https://data.cityofnewyork.us/resource/8vwk-6iz2.json"

NTA_TO_BOROUGH = {
    "MN": "Manhattan",
    "BX": "Bronx",
    "BK": "Brooklyn",
    "QN": "Queens",
    "SI": "Staten Island",
}

CENSUS_DATA = [
    {"borough": "Manhattan", "county_fips": "061", "total_pop_poverty_universe": 1599733, "below_poverty": 252677, "poverty_rate": 15.8, "median_household_income": 93651},
    {"borough": "Bronx", "county_fips": "005", "total_pop_poverty_universe": 1400849, "below_poverty": 371175, "poverty_rate": 26.5, "median_household_income": 40088},
    {"borough": "Brooklyn", "county_fips": "047", "total_pop_poverty_universe": 2559903, "below_poverty": 502116, "poverty_rate": 19.6, "median_household_income": 67060},
    {"borough": "Queens", "county_fips": "081", "total_pop_poverty_universe": 2270976, "below_poverty": 273878, "poverty_rate": 12.1, "median_household_income": 78077},
    {"borough": "Staten Island", "county_fips": "085", "total_pop_poverty_universe": 474588, "below_poverty": 53023, "poverty_rate": 11.2, "median_household_income": 91160},
]


def _cache_key(url: str, params: dict) -> str:
    raw = url + str(sorted(params.items()))
    return hashlib.md5(raw.encode()).hexdigest()


def _get_cached(key: str):
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
        del _cache[key]
    return None


def _set_cached(key: str, data):
    _cache[key] = (time.time(), data)


async def fetch_json(url: str, params: dict | None = None) -> list | dict:
    params = params or {}
    key = _cache_key(url, params)
    cached = _get_cached(key)
    if cached is not None:
        return cached
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            _set_cached(key, data)
            return data
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []


def nta_to_borough(nta_code: str) -> str:
    prefix = nta_code[:2].upper()
    return NTA_TO_BOROUGH.get(prefix, "Unknown")


async def get_supply_gap(year: str = "2025", borough: str | None = None, limit: int = 200) -> list[dict]:
    params = {"$limit": str(limit), "$order": "weighted_score DESC"}
    where_clauses = [f"year='{year}'"]
    if borough:
        where_clauses.append(f"starts_with(nta, '{borough}')")
    params["$where"] = " AND ".join(where_clauses)
    records = await fetch_json(NYC_SUPPLY_GAP_URL, params)
    for r in records:
        r["borough"] = nta_to_borough(r.get("nta", ""))
        for field in ("supply_gap_lbs", "food_insecure_percentage", "unemployment_rate", "vulnerable_population", "weighted_score"):
            if field in r and isinstance(r[field], str):
                try:
                    r[field] = float(r[field])
                except ValueError:
                    pass
        if "rank" in r and isinstance(r["rank"], str):
            try:
                r["rank"] = int(r["rank"])
            except ValueError:
                pass
    return records


async def get_supply_gap_trends() -> list[dict]:
    params = {"$limit": "1000"}
    records = await fetch_json(NYC_SUPPLY_GAP_URL, params)
    by_year: dict[str, list] = {}
    for r in records:
        yr = r.get("year", "unknown")
        by_year.setdefault(yr, []).append(r)
    trends = []
    for yr in sorted(by_year.keys()):
        items = by_year[yr]
        gaps = []
        insecurity = []
        unemployment = []
        for item in items:
            try:
                gaps.append(float(item.get("supply_gap_lbs", 0)))
            except (ValueError, TypeError):
                pass
            try:
                insecurity.append(float(item.get("food_insecure_percentage", 0)))
            except (ValueError, TypeError):
                pass
            try:
                unemployment.append(float(item.get("unemployment_rate", 0)))
            except (ValueError, TypeError):
                pass
        trends.append({
            "year": yr,
            "avg_supply_gap": round(sum(gaps) / len(gaps), 2) if gaps else 0,
            "avg_food_insecurity": round(sum(insecurity) / len(insecurity) * 100, 2) if insecurity else 0,
            "avg_unemployment": round(sum(unemployment) / len(unemployment) * 100, 2) if unemployment else 0,
            "total_neighborhoods": len(items),
        })
    return trends


async def get_usage_data() -> dict:
    params = {"$limit": "200"}
    records = await fetch_json(NYC_CFC_URL, params)
    pantry = []
    soup = []
    for r in records:
        facility = r.get("facility", "")
        number_str = r.get("number", "0")
        try:
            number = int(str(number_str).replace(",", ""))
        except ValueError:
            number = 0
        start = r.get("report_start_date", "")[:10]
        end = r.get("report_end_date", "")[:10]
        label = start[:7] if start else "unknown"
        entry = {"quarter": label, "start_date": start, "end_date": end, "value": number}
        if "Pantries" in facility:
            pantry.append(entry)
        elif "Kitchens" in facility:
            soup.append(entry)
    pantry.sort(key=lambda x: x["quarter"])
    soup.sort(key=lambda x: x["quarter"])
    return {"pantry_individuals": pantry, "soup_kitchen_meals": soup}


async def get_locations(loc_type: str = "all", borough: str | None = None, ebt_only: bool = False) -> list[dict]:
    locations = []
    if loc_type in ("snap", "all"):
        snap_records = await fetch_json(NYC_SNAP_URL)
        for r in snap_records:
            b = r.get("borough", "")
            if borough and borough.lower() != b.lower():
                continue
            try:
                lat = float(r.get("latitude", 0))
                lng = float(r.get("longitude", 0))
            except (ValueError, TypeError):
                continue
            locations.append({
                "name": r.get("facility_name", ""),
                "type": "snap_center",
                "borough": b,
                "address": f"{r.get('street_address', '')}, {r.get('city', '')}, NY {r.get('zip_code', '')}",
                "latitude": lat,
                "longitude": lng,
                "hours": r.get("comments", ""),
                "accepts_ebt": True,
                "extra": {"phone": r.get("phone_number_s_", ""), "nta": r.get("nta", "")},
            })
    if loc_type in ("farmers_market", "all"):
        params = {"$where": "year='2025'", "$limit": "2500"}
        fm_records = await fetch_json(NYC_FARMERS_URL, params)
        for r in fm_records:
            b = r.get("borough", "")
            if borough and borough.lower() != b.lower():
                continue
            ebt = r.get("accepts_ebt", "No") == "Yes"
            if ebt_only and not ebt:
                continue
            try:
                lat = float(r.get("latitude", 0))
                lng = float(r.get("longitude", 0))
            except (ValueError, TypeError):
                continue
            if lat == 0 or lng == 0:
                continue
            locations.append({
                "name": r.get("marketname", ""),
                "type": "farmers_market",
                "borough": b,
                "address": r.get("streetaddress", ""),
                "latitude": lat,
                "longitude": lng,
                "hours": f"{r.get('daysoperation', '')} {r.get('hoursoperations', '')}",
                "accepts_ebt": ebt,
                "extra": {"open_year_round": r.get("open_year_round", "No")},
            })
    return locations


def get_demographics() -> list[dict]:
    return CENSUS_DATA
