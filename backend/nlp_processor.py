from textblob import TextBlob
from collections import Counter

CATEGORY_KEYWORDS = {
    "wait_time": ["wait", "line", "queue", "minutes", "hour", "long", "slow", "fast", "quick"],
    "food_quality": ["fresh", "produce", "quality", "stale", "expired", "wilted", "rotten", "good food", "bad food", "selection"],
    "hours": ["hours", "open", "closed", "schedule", "time", "morning", "evening", "saturday", "sunday", "weekend"],
    "staff": ["staff", "volunteer", "rude", "kind", "helpful", "friendly", "unfriendly", "respectful", "treated"],
    "accessibility": ["wheelchair", "elevator", "accessible", "transit", "parking", "delivery", "disabled", "elderly"],
    "variety": ["variety", "options", "halal", "kosher", "vegetarian", "vegan", "cultural", "baby food", "formula", "protein", "gluten"],
}


def analyze_sentiment(text: str) -> tuple[str, float]:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0.1:
        return "positive", round(polarity, 3)
    elif polarity < -0.1:
        return "negative", round(polarity, 3)
    else:
        return "neutral", round(polarity, 3)


def categorize_feedback(text: str) -> list[str]:
    text_lower = text.lower()
    categories = []
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            categories.append(category)
    return categories if categories else ["general"]


def extract_keywords(text: str, top_n: int = 5) -> list[tuple[str, int]]:
    blob = TextBlob(text)
    noun_phrases = list(blob.noun_phrases)
    words = [word.lower() for word, tag in blob.tags if tag in ("NN", "NNS", "JJ", "JJR", "JJS")]
    all_terms = noun_phrases + words
    stop = {
        "the", "a", "an", "is", "was", "are", "were", "be", "been", "being",
        "i", "my", "me", "we", "they", "it", "very", "much", "really",
    }
    filtered = [t for t in all_terms if t not in stop and len(t) > 2]
    return Counter(filtered).most_common(top_n)


def summarize_feedback(feedbacks: list[dict]) -> dict:
    if not feedbacks:
        return {
            "total_responses": 0,
            "average_rating": 0,
            "sentiment_distribution": {},
            "top_categories": [],
            "common_themes": [],
            "rating_distribution": {},
        }

    sentiments = Counter(f["sentiment"] for f in feedbacks)
    all_categories = Counter()
    for f in feedbacks:
        for cat in f["categories"]:
            all_categories[cat] += 1

    all_text = " ".join(f["comment"] for f in feedbacks)
    keywords = extract_keywords(all_text, top_n=15)

    ratings = [f["rating"] for f in feedbacks]

    return {
        "total_responses": len(feedbacks),
        "average_rating": round(sum(ratings) / len(ratings), 2),
        "sentiment_distribution": dict(sentiments),
        "top_categories": all_categories.most_common(10),
        "common_themes": keywords,
        "rating_distribution": dict(Counter(ratings)),
    }
