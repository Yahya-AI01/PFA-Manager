# PFA Manager 🎓

## Description

PFA Manager est une plateforme intelligente développée dans le cadre de mon Projet de Fin d'Année (PFA) en première année du cycle ingénieur.

La plateforme permet aux administrateurs, professeurs et étudiants de gérer efficacement les projets de fin d'année à travers une interface centralisée et sécurisée.

## Fonctionnalités

### Administrateur

* Gestion des utilisateurs
* Gestion des modules
* Import des étudiants via Excel
* Envoi des identifiants par SMS
* Tableau de bord statistique

### Professeur

* Création et gestion des sujets
* Validation des équipes
* Suivi des projets
* Gestion des tâches via Kanban

### Étudiant

* Consultation des sujets
* Création des équipes
* Gestion des tâches
* Dépôt des livrables

### Intelligence Artificielle

* Détection des sujets similaires
* Recommandation de technologies
* Suggestions d'amélioration des projets
* Analyse basée sur TF-IDF et Similarité Cosinus

## Architecture

* Frontend : React.js
* Backend : Spring Boot
* Base de données : SQL Server
* IA : Flask + Scikit-Learn
* Sécurité : JWT Authentication

## Technologies utilisées

* React.js
* Spring Boot
* Java
* SQL Server
* Python
* Flask
* Scikit-Learn
* JWT
* REST API

## structure

PFA-SYSTEM-LV/
│
├── .idea/
│   ├── misc.xml
│   ├── modules.xml
│   ├── pfa-system-lv.iml
│   └── workspace.xml
│
├── pfa-system-lv/
│   │
│   ├── .claude/
│   │   └── settings.local.json
│   │
│   ├── .idea/
│   │   ├── .gitignore
│   │   └── workspace.xml
│   │
│   ├── pfa-system/
│   │   │
│   │   ├── ai-service/
│   │   │   └── (Flask + Scikit-Learn AI Microservice)
│   │   │
│   │   ├── backend/
│   │   │   ├── src/
│   │   │   │   └── main/
│   │   │   │       ├── java/
│   │   │   │       └── resources/
│   │   │   │           ├── application.properties
│   │   │   │           ├── application-dev.properties
│   │   │   │           └── application-prod.properties
│   │   │   │
│   │   │   ├── target/
│   │   │   ├── uploads/
│   │   │   ├── pom.xml
│   │   │   ├── hs_err_pid*.log
│   │   │   └── replay_pid*.log
│   │   │
│   │   ├── database/
│   │   │   └── schema.sql
│   │   │
│   │   ├── frontend/
│   │   │   └── (React.js Application)
│   │   │
│   │   ├── .gitignore
│   │   ├── etudiants-exemple.xlsx
│   │   └── README.md
│   │
│   └── ...
│
└── README.md

## Installation

```bash
git clone https://github.com/uYahya-AI01/PFA-Manager.git
```
