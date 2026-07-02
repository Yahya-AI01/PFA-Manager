"""
Service IA pour la d\u00e9tection de similarit\u00e9 et la suggestion d'id\u00e9es.

Endpoints :
  - /health       : healthcheck
  - /similarity   : TF-IDF + cosinus
  - /suggestions  : id\u00e9es / inspirations bas\u00e9es sur le titre/module du sujet
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import random

app = Flask(__name__)
CORS(app)

STOPWORDS = {
    "le", "la", "les", "de", "du", "des", "un", "une", "et", "ou", "a", "au", "aux",
    "ce", "ces", "pour", "par", "sur", "dans", "en", "que", "qui", "est", "avec",
    "the", "and", "or", "of", "for", "in", "on", "to", "with", "is", "an",
}


def preprocess(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(
        r"[^a-z\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5\u00e7\u00e8\u00e9\u00ea\u00eb\u00ec\u00ed\u00ee\u00ef\u00f1\u00f2\u00f3\u00f4\u00f5\u00f6\u00f9\u00fa\u00fb\u00fc\u00fd0-9\s]",
        " ", text
    )
    tokens = [t for t in text.split() if len(t) > 2 and t not in STOPWORDS]
    return " ".join(tokens)


# ============================================================================
# /similarity - TF-IDF cosinus
# ============================================================================
@app.route("/similarity", methods=["POST"])
def similarity():
    data = request.get_json(silent=True) or {}
    query = data.get("query", "")
    documents = data.get("documents", [])
    top_k = int(data.get("top_k", 5))

    if not query or not documents:
        return jsonify({"results": []})

    query_clean = preprocess(query)
    doc_ids = [d.get("id") for d in documents]
    doc_texts = [preprocess(d.get("text", "")) for d in documents]

    corpus = [query_clean] + doc_texts
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=5000)
        matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        return jsonify({"results": []})

    sims = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    ranked = sorted(zip(doc_ids, sims.tolist()), key=lambda x: x[1], reverse=True)
    results = [
        {"id": doc_id, "score": round(float(score), 4)}
        for doc_id, score in ranked[:top_k] if score > 0
    ]
    return jsonify({"results": results})


# ============================================================================
# /suggestions - Id\u00e9es et inspirations
# ============================================================================

# Templates d'id\u00e9es par mots-cl\u00e9s d\u00e9tect\u00e9s
IDEA_TEMPLATES = {
    "web": [
        "Ajouter une authentification multi-facteurs (2FA)",
        "Int\u00e9grer un syst\u00e8me de notifications en temps r\u00e9el (WebSocket)",
        "Mettre en place un SSR (Server-Side Rendering) pour le SEO",
        "Ajouter un mode hors ligne avec Service Workers",
        "Int\u00e9grer Stripe pour les paiements",
    ],
    "mobile": [
        "Ajouter le support des notifications push (Firebase/Expo)",
        "Impl\u00e9menter le mode hors ligne avec synchronisation diff\u00e9r\u00e9e",
        "Int\u00e9grer la g\u00e9olocalisation et les cartes interactives",
        "Ajouter l'authentification biom\u00e9trique (FaceID, TouchID)",
        "Optimiser le rendu pour les tablettes",
    ],
    "ia": [
        "Comparer plusieurs algorithmes (Random Forest, XGBoost, Neural Net)",
        "Mettre en place un MLOps pipeline (entra\u00eenement automatique)",
        "Ajouter de l'explicabilit\u00e9 (SHAP, LIME)",
        "Cr\u00e9er un dashboard de monitoring du mod\u00e8le",
        "Tester un mod\u00e8le pr\u00e9-entra\u00een\u00e9 (BERT, GPT)",
    ],
    "data": [
        "Cr\u00e9er un pipeline ETL automatis\u00e9",
        "Ajouter des visualisations interactives (Plotly, D3.js)",
        "Optimiser les requ\u00eates SQL avec des index appropri\u00e9s",
        "Mettre en place un data warehouse (star schema)",
        "Ajouter du streaming de donn\u00e9es (Kafka, Pub/Sub)",
    ],
    "chat": [
        "Int\u00e9grer un chatbot avec NLP (Rasa, Dialogflow)",
        "Ajouter la reconnaissance d'intention",
        "Mettre en place une m\u00e9moire conversationnelle",
        "Int\u00e9grer la voix (Speech-to-Text)",
    ],
    "iot": [
        "Connecter \u00e0 un broker MQTT",
        "Ajouter un dashboard temps r\u00e9el des capteurs",
        "Mettre en place des alertes automatiques",
    ],
    "default": [
        "Ajouter des tests unitaires et d'int\u00e9gration",
        "Mettre en place une CI/CD avec GitHub Actions",
        "Documenter l'API avec Swagger/OpenAPI",
        "Optimiser les performances (cache, lazy loading)",
        "Ajouter un logging structur\u00e9 et monitoring",
        "S\u00e9curiser l'application (OWASP top 10)",
        "Internationaliser l'interface (i18n)",
    ],
}

TECH_STACK = {
    "web": ["React", "Vue.js", "Next.js", "Spring Boot", "Node.js + Express", "Django", "PostgreSQL", "Redis"],
    "mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Expo", "Firebase"],
    "ia": ["Python", "Scikit-learn", "TensorFlow", "PyTorch", "Hugging Face", "Pandas", "NumPy"],
    "data": ["Apache Spark", "Airflow", "PostgreSQL", "MongoDB", "Elasticsearch", "Tableau", "Power BI"],
    "default": ["Git", "Docker", "Linux", "REST API"],
}


def detect_categories(text: str):
    text = text.lower()
    cats = []
    rules = {
        "web": ["web", "site", "react", "vue", "angular", "spring", "node", "html", "css"],
        "mobile": ["mobile", "android", "ios", "flutter", "react native", "app"],
        "ia": ["ia", "ai", "ml", "intelligence", "machine learning", "deep", "neural", "nlp", "tf-idf",
               "recommend", "pr\u00e9diction", "classification", "clustering"],
        "data": ["donn\u00e9es", "data", "etl", "bi", "dashboard", "analytics", "sql", "warehouse"],
        "chat": ["chatbot", "chat", "conversation", "bot"],
        "iot": ["iot", "capteur", "sensor", "arduino", "raspberry"],
    }
    for cat, keywords in rules.items():
        if any(k in text for k in keywords):
            cats.append(cat)
    return cats or ["default"]


@app.route("/suggestions", methods=["POST"])
def suggestions():
    """
    Body : { "titre": "...", "description": "...", "module": "..." }
    R\u00e9ponse :
      {
        "ideas": ["...", ...],
        "stack": ["React", ...],
        "keywords": [...]
      }
    """
    data = request.get_json(silent=True) or {}
    text = " ".join([
        data.get("titre", ""),
        data.get("description", ""),
        data.get("module", "")
    ])

    cats = detect_categories(text)

    # Collecte des id\u00e9es
    ideas_pool = []
    for cat in cats:
        ideas_pool.extend(IDEA_TEMPLATES.get(cat, []))
    ideas_pool.extend(IDEA_TEMPLATES["default"])
    # D\u00e9doublonner et limiter
    seen = set()
    ideas = []
    for i in ideas_pool:
        if i not in seen:
            seen.add(i)
            ideas.append(i)
        if len(ideas) >= 8:
            break

    # Tech stack sugg\u00e9r\u00e9e
    stack_pool = []
    for cat in cats:
        stack_pool.extend(TECH_STACK.get(cat, []))
    stack_pool.extend(TECH_STACK["default"])
    seen = set()
    stack = []
    for s in stack_pool:
        if s not in seen:
            seen.add(s)
            stack.append(s)
        if len(stack) >= 8:
            break

    # Mots-cl\u00e9s extraits
    cleaned = preprocess(text)
    keywords = list(dict.fromkeys(cleaned.split()))[:10]

    return jsonify({
        "ideas": ideas,
        "stack": stack,
        "keywords": keywords,
        "categories": cats,
    })


# ============================================================================
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "pfa-ai", "endpoints": ["/similarity", "/suggestions"]})


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "PFA - Service IA",
        "endpoints": {
            "/health": "GET",
            "/similarity": "POST { query, documents, top_k }",
            "/suggestions": "POST { titre, description, module }",
        }
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
