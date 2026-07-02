# Service IA - Détection de similarité

Microservice Flask qui calcule la similarité cosinus TF-IDF entre un sujet cible et un ensemble de sujets candidats.

## Lancement

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate   # sous Windows : .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Le service écoute sur `http://localhost:5001`.

## Endpoints

### `GET /health`
Healthcheck.

### `POST /similarity`
Body :
```json
{
  "query": "Plateforme de gestion de PFA avec Spring Boot",
  "documents": [
    {"id": 1, "text": "Application web de suivi de projets"},
    {"id": 2, "text": "Détection d'anomalies en ML"}
  ],
  "top_k": 5
}
```

Réponse :
```json
{
  "results": [
    {"id": 1, "score": 0.42},
    {"id": 2, "score": 0.08}
  ]
}
```

## Production

```bash
gunicorn -w 2 -b 0.0.0.0:5001 app:app
```
