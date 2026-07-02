# 🎓 Système de gestion des PFA — v3

Application web complète de gestion des projets de fin d'année avec :

- 🔐 **Auth JWT** + 3 rôles (Admin / Professeur / Étudiant)
- 📚 **Gestion des sujets** (CRUD complet)
- 👥 **Équipes auto-formées** (max 4 étudiants par projet)
- 📊 **Kanban drag & drop** (TODO / DOING / DONE)
- 💬 **Messagerie temps réel** (polling 3s)
- 📁 **Upload de fichiers** PDF / Word / images (drag & drop, max 10 Mo)
- 🟢🔴 **Vue verts/rouges** : qui a choisi un sujet vs en attente
- 🤖 **IA TF-IDF** pour la similarité entre sujets
- 💡 **Suggestions IA** : idées + stack technique adaptés au sujet
- 🌓 **Mode sombre/clair** + animations Framer Motion partout

## 📁 Structure

```
pfa-system/
├── backend/         Spring Boot REST API
├── frontend/        React + Tailwind UI premium
├── ai-service/      Microservice Python (similarité + suggestions)
└── database/        Script SQL Server
```

## 🚀 Démarrage rapide (3 terminaux)

### 1. Backend Spring Boot

```bash
cd backend
mvn spring-boot:run
```

➜ http://localhost:8080 — H2 en mémoire avec données de démo.

**Comptes créés automatiquement** :

| Rôle       | Email              | Mot de passe | Particularité                          |
|------------|--------------------|--------------|----------------------------------------|
| Admin      | admin@pfa.ma       | admin123     |                                        |
| Professeur | prof1@pfa.ma       | prof123      | A déjà des projets en cours            |
| Professeur | prof2@pfa.ma       | prof123      |                                        |
| Étudiant   | etudiant1@pfa.ma   | etu123       | 🟢 En équipe avec etudiant2             |
| Étudiant   | etudiant2@pfa.ma   | etu123       | 🟢 En équipe avec etudiant1             |
| Étudiant   | etudiant3@pfa.ma   | etu123       | 🟢 Seule sur un projet                  |
| Étudiant   | etudiant4@pfa.ma   | etu123       | 🔴 Sans projet                          |
| Étudiant   | etudiant5@pfa.ma   | etu123       | 🔴 Sans projet                          |

### 2. Service IA Python

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate    # Windows
# source .venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
python app.py
```

➜ http://localhost:5001

### 3. Frontend React

```bash
cd frontend
npm install
npm run dev
```

➜ http://localhost:5173

## 🧱 API REST

### 🔐 Authentification
- `POST /api/auth/login` — `{ email, motDePasse }`
- `POST /api/auth/register` — `{ nom, prenom, email, motDePasse, role }`

### 📚 Sujets
- `GET /api/sujets?keyword=&professeurId=&annee=`
- `GET /api/sujets/{id}`
- `POST /api/sujets` (PROFESSEUR)
- `PUT /api/sujets/{id}` (propriétaire)
- `DELETE /api/sujets/{id}` (propriétaire)
- `GET /api/sujets/{id}/similaires` — **IA : sujets similaires (TF-IDF)**
- `GET /api/sujets/{id}/suggestions` — **IA : idées + stack**

### 📁 Projets / Équipes
- `GET /api/projets` / `GET /api/projets/{id}`
- `GET /api/projets/mes-projets` (ETUDIANT)
- `GET /api/projets/encadres` (PROFESSEUR)
- `POST /api/projets/choisir-sujet/{sujetId}` — **rejoint l'équipe ou la crée**
- `POST /api/equipes/{projetId}/etudiants/{etudiantId}` — ajouter à une équipe (PROF)
- `DELETE /api/equipes/{projetId}/etudiants/{etudiantId}` — retirer
- `GET /api/equipes/etudiants-status` — **liste verts/rouges**
- `GET /api/equipes/incompletes` (PROFESSEUR) — équipes < 4 étudiants

### 📊 Kanban
- `GET /api/projets/{id}/tasks`
- `POST /api/projets/{id}/tasks`
- `PUT /api/tasks/{id}` (changer statut)
- `DELETE /api/tasks/{id}`

### 💬 Messages
- `GET /api/projets/{projetId}/messages` — liste + marque comme lus
- `POST /api/projets/{projetId}/messages` — `{ contenu }`
- `GET /api/projets/{projetId}/messages/non-lus` — compteur

### 📁 Documents
- `POST /api/projets/{projetId}/documents` (multipart) — upload PDF/Word/image
- `GET /api/projets/{projetId}/documents` — liste
- `GET /api/documents/{id}/download` — télécharger
- `DELETE /api/documents/{id}` (propriétaire)

### ⚙️ Admin
- `GET|POST|DELETE /api/admin/utilisateurs`
- `GET|POST|DELETE /api/admin/modules`

Toutes les requêtes (sauf `/api/auth/**`) requièrent :
```
Authorization: Bearer <jwt-token>
```

## 🤖 Service IA Python

### `POST /similarity`
TF-IDF + cosinus pour la détection de sujets similaires.
```json
{ "query": "...", "documents": [...], "top_k": 5 }
```

### `POST /suggestions`
Détecte la catégorie (web/mobile/IA/data/chat/iot) du sujet et propose :
- **Idées** pour aller plus loin
- **Stack technique** recommandée
- **Mots-clés** extraits

```json
{ "titre": "...", "description": "...", "module": "..." }
```

## 👥 Permissions par rôle

| Action                              | Étudiant | Prof | Admin |
|-------------------------------------|:--------:|:----:|:-----:|
| Consulter / chercher les sujets     | ✅       | ✅   | ✅    |
| Voir les sujets similaires (IA)     | ✅       | ✅   | ✅    |
| Voir les suggestions IA             | ✅       | ✅   | ✅    |
| Choisir un sujet / rejoindre équipe | ✅       | —    | —     |
| Voir son projet / Kanban / Chat     | ✅       | —    | —     |
| Upload de fichiers                  | ✅       | ✅   | —     |
| Créer / modifier des sujets         | —        | ✅   | —     |
| Encadrer (voir projets)             | —        | ✅   | ✅    |
| Voir verts/rouges                   | —        | ✅   | ✅    |
| Gérer équipes (ajout/retrait)       | —        | ✅   | ✅    |
| Gérer utilisateurs / modules        | —        | —    | ✅    |

## 🛠 Stack technique

| Couche      | Technologies                                                       |
|-------------|--------------------------------------------------------------------|
| Frontend    | React 18, Vite, Tailwind 3, Framer Motion, Recharts, @dnd-kit     |
| Backend     | Java 17, Spring Boot 3.2, Spring Security 6, JPA, JJWT             |
| Upload      | Multipart Spring + stockage local dans `backend/uploads/`          |
| BDD         | SQL Server (prod) / H2 (dev)                                       |
| IA          | Python 3, Flask, scikit-learn (TF-IDF + cosinus)                   |
| Auth        | JWT HS256                                                          |

## 🎨 Design system

- **Typographie** : Fraunces (display serif) + Manrope (body)
- **Palette** : crème `#fdfcf8` / anthracite `#0f0e0d` / accent ember `#fc4a17`
- **Mode sombre / clair** persistant
- **Animations** : Framer Motion (page transitions, stagger, drag overlays, micro-interactions)
- **Composants** : design system maison (Avatar, Badge, Button, Card, Input, StatCard, Skeleton, EmptyState)

## 🧪 Comment tester chaque feature

1. Connectez-vous en **étudiant1@pfa.ma**
2. Allez sur **Mon projet** → vous voyez le projet partagé avec etudiant2
3. Cliquez sur **Kanban** → drag & drop des tâches
4. Cliquez sur **Discussion** → messages avec le prof + indicateur non-lus
5. Cliquez sur **Fichiers** → glissez un PDF
6. Allez sur **Sujets** → cliquez sur un sujet → vous voyez les **suggestions IA**
7. Déconnectez-vous, connectez-vous en **prof1@pfa.ma**
8. Allez sur **Étudiants** → vue verts/rouges
9. Allez sur **Projets encadrés** → vous voyez le projet de etudiant1+etudiant2

## 📝 Licence

Projet académique — usage libre.
