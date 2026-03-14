import random
from datetime import datetime, timedelta

PANTRIES = [
    {"name": "Project Hospitality - Canal Street", "neighborhood": "Chinatown-Two Bridges", "nta": "MN0301"},
    {"name": "Holy Apostles Soup Kitchen", "neighborhood": "Chelsea-Hudson Yards", "nta": "MN0501"},
    {"name": "Food Bank For New York City - Bronx", "neighborhood": "Concourse-Concourse Village", "nta": "BX0401"},
    {"name": "Bed-Stuy Campaign Against Hunger", "neighborhood": "Bedford-Stuyvesant (East)", "nta": "BK0302"},
    {"name": "City Harvest Mobile Market - Jackson Heights", "neighborhood": "Jackson Heights", "nta": "QN0301"},
    {"name": "St. John's Bread and Life", "neighborhood": "Bushwick (East)", "nta": "BK0202"},
    {"name": "CAMBA Food Pantry", "neighborhood": "Flatbush", "nta": "BK1401"},
    {"name": "West Side Campaign Against Hunger", "neighborhood": "Upper West Side", "nta": "MN0901"},
    {"name": "Part of the Solution (POTS)", "neighborhood": "Fordham-Bedford", "nta": "BX0702"},
    {"name": "Masbia Soup Kitchen - Flatbush", "neighborhood": "Flatbush", "nta": "BK1401"},
    {"name": "New York Common Pantry", "neighborhood": "East Harlem", "nta": "MN1101"},
    {"name": "Bowery Mission", "neighborhood": "Lower East Side", "nta": "MN0401"},
    {"name": "God's Love We Deliver", "neighborhood": "Chelsea-Hudson Yards", "nta": "MN0501"},
    {"name": "Elmhurst Community Food Pantry", "neighborhood": "Elmhurst", "nta": "QN0401"},
    {"name": "Staten Island Food Pantry", "neighborhood": "St. George-New Brighton", "nta": "SI0101"},
]

TEMPLATES = {
    "wait_time_positive": [
        "Only waited about {wait} minutes today. Much better than before.",
        "In and out in {wait} minutes. Love the new appointment system.",
        "Quick service today, {wait} minute wait. Volunteers moved fast.",
    ],
    "wait_time_negative": [
        "Waited over {wait} minutes in the cold. They need better organization.",
        "The line was around the block. {wait} minute wait is unacceptable.",
        "Arrived at opening, still waited {wait} minutes. Very frustrating.",
    ],
    "food_quality_positive": [
        "Great selection today! Fresh vegetables, fruits, and canned goods.",
        "They had fresh bread, milk, eggs, and even some meat. Very grateful.",
        "Love that they offer culturally appropriate foods now. Found rice, beans, and plantains.",
        "The produce was really fresh. Much better quality than last month.",
    ],
    "food_quality_negative": [
        "Most of the produce was wilted or past its prime. Disappointing.",
        "Very limited selection. Just canned beans and pasta, nothing fresh.",
        "No fresh fruits or vegetables available. Only processed foods.",
        "The bread was stale and some canned items were near expiration.",
    ],
    "hours_positive": [
        "Love that they're open on Saturdays now. Makes it so much easier for working families.",
        "The evening hours are a lifesaver for those of us who work during the day.",
        "Consistent hours every week. I always know when to come.",
    ],
    "hours_negative": [
        "Got there at the posted opening time but they were closed. No explanation.",
        "They changed hours without any notice. Wasted a trip.",
        "Only open 2 days a week for 3 hours. Not enough for the neighborhood.",
        "Website says open till 4pm but they ran out of food by 2pm.",
    ],
    "staff_positive": [
        "The volunteers are always so kind and respectful. Makes a tough situation easier.",
        "Staff helped me carry bags to my car. Above and beyond.",
        "They treat everyone with dignity. Never feel judged here.",
        "Bilingual staff made it easy for my grandmother to communicate.",
    ],
    "staff_negative": [
        "Some volunteers were rude and impatient. Made me feel unwelcome.",
        "Staff seemed disorganized and frustrated. Not a pleasant experience.",
        "Was told I couldn't come back for 2 weeks even though my family is struggling.",
    ],
    "accessibility_positive": [
        "Wheelchair accessible entrance and they helped load my cart. Very accommodating.",
        "Close to the subway, easy to get to with public transit.",
        "They offer delivery for elderly and disabled. Such an important service.",
    ],
    "accessibility_negative": [
        "No elevator and the pantry is on the 3rd floor. Impossible for elderly visitors.",
        "Nowhere close to public transit. You need a car to get here.",
        "No seating in the waiting area. Hard for seniors and pregnant women.",
    ],
    "variety_demand": [
        "Would love to see more fresh produce options, especially leafy greens.",
        "Need more baby food and formula. Many young families in this area.",
        "Wish they had halal or kosher options for our community.",
        "More protein options would be great. Always heavy on carbs.",
        "Gluten-free options would help. My child has celiac disease.",
    ],
}


def generate_feedback(count: int = 500, seed: int = 42) -> list[dict]:
    random.seed(seed)
    feedback = []
    for i in range(count):
        pantry = random.choice(PANTRIES)
        sentiment_roll = random.random()
        if sentiment_roll < 0.35:
            sentiment = "positive"
            rating = random.choice([4, 4, 5, 5, 5])
        elif sentiment_roll < 0.75:
            sentiment = "negative"
            rating = random.choice([1, 1, 2, 2, 3])
        else:
            sentiment = "neutral"
            rating = random.choice([2, 3, 3, 4])

        if sentiment == "positive":
            cats = [k for k in TEMPLATES if "positive" in k]
        elif sentiment == "negative":
            cats = [k for k in TEMPLATES if "negative" in k or k == "variety_demand"]
        else:
            cats = list(TEMPLATES.keys())

        category = random.choice(cats)
        template = random.choice(TEMPLATES[category])

        if "{wait}" in template:
            wait = random.randint(5, 15) if "positive" in category else random.randint(30, 90)
            template = template.replace("{wait}", str(wait))

        days_ago = random.randint(0, 365)
        date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")

        feedback.append({
            "id": i + 1,
            "pantry_name": pantry["name"],
            "neighborhood": pantry["neighborhood"],
            "nta": pantry["nta"],
            "rating": rating,
            "comment": template,
            "date": date,
            "sentiment": sentiment,
            "categories": [category.replace("_positive", "").replace("_negative", "")],
        })

    return feedback
