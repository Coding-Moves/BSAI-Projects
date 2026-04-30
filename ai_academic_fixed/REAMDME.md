# 🎓 AcadAI — AI Academic Performance Prediction & Career Guidance System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PyQt5](https://img.shields.io/badge/PyQt5-GUI-41CD52?style=for-the-badge&logo=qt&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A professional AI-powered desktop application that predicts student GPA, detects weak subjects, recommends careers, and generates personalized study plans — built as a 4th Semester BSAI Project.**

[Features](#-features) · [Screenshots](#-screenshots) · [Installation](#-installation) · [Usage](#-usage) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure)

</div>

---

## 📌 Overview

**AcadAI** is an intelligent academic analytics platform built for university students. It uses **Machine Learning** to predict future GPA, detect at-risk students, recommend career paths based on academic profile, and generate AI-powered study plans — all inside a clean, professional desktop GUI.

> Built with Python · PyQt5 · scikit-learn · SQLite · Matplotlib

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **GPA Prediction** | Random Forest + Ridge Regression model predicts next semester GPA with ~91% confidence |
| ⚠️ **Weak Subject Detection** | ML model identifies subjects needing attention and suggests improvement strategies |
| 🎯 **Career Recommendation** | AI matches student profile (GPA + skills + interests) to best-fit career paths |
| 🧠 **Skill Roadmap** | Personalized step-by-step learning roadmap for chosen career goal |
| 📅 **Study Planner** | AI generates weekly study schedules prioritizing weak subjects |
| 🤖 **AI Chatbot** | NLP-based academic assistant that reads live database and answers student queries |
| 📈 **Analytics Dashboard** | Interactive charts: GPA trends, subject radar, risk distribution, attendance analysis |
| 👥 **Student Management** | Add, edit, import students via CSV — full CRUD with SQLite backend |
| 📤 **CSV Import/Export** | Bulk import 60+ students from CSV; export reports |

---

## 🖼️ Screenshots

> _Add screenshots of your running app here after launch_

```
Dashboard → Analytics → Career Page → Chatbot → Study Planner
```

---

## 🛠️ Installation

### Prerequisites

Make sure you have **Python 3.10+** installed. Check with:

```bash
python --version
```

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/acadai-academic-system.git
cd acadai-academic-system
```

### Step 2 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3 — Generate Sample Dataset (First Time Only)

```bash
python generate_dataset.py
```

This creates `datasets/student_data.csv` with **60 realistic student records**.

### Step 4 — Run the Application

```bash
python main.py
```

---

## 📦 Requirements

```
PyQt5>=5.15.0
matplotlib>=3.7.0
scikit-learn>=1.3.0
pandas>=2.0.0
numpy>=1.24.0
```

Install all at once:

```bash
pip install PyQt5 matplotlib scikit-learn pandas numpy
```

---

## 🗂️ Project Structure

```
acadai-academic-system/
│
├── main.py                      # App entry point
├── config.py                    # Colors, careers, global settings
├── generate_dataset.py          # CSV dataset generator (run once)
├── requirements.txt
├── README.md
│
├── database/
│   ├── __init__.py
│   └── db_manager.py            # SQLite CRUD + stats queries
│
├── models/
│   ├── __init__.py
│   ├── prediction_model.py      # GPAPredictor — Random Forest ensemble
│   └── training.py              # Model training from CSV data
│
├── chatbot/
│   ├── __init__.py
│   └── chatbot_engine.py        # NLP chatbot — reads live DB data
│
├── analytics/
│   ├── __init__.py
│   └── analytics_engine.py      # Stats engine for dashboard
│
├── recommender/
│   ├── __init__.py
│   ├── career_recommender.py    # Career match scoring
│   └── study_planner.py         # Weekly study plan generator
│
├── ui/
│   ├── __init__.py
│   ├── main_window.py           # Main app window + navigation
│   ├── dashboard_page.py        # Overview + metric cards
│   ├── analytics_page.py        # Charts + AI predictor
│   ├── student_page.py          # Student management table
│   ├── career_page.py           # Career recommendations
│   ├── skills_page.py           # Skill roadmap
│   ├── planner_page.py          # Study planner
│   ├── chatbot_page.py          # AI chatbot interface
│   └── components/
│       ├── __init__.py
│       ├── cards.py             # Reusable card widgets
│       ├── charts.py            # Matplotlib chart components
│       └── sidebar.py           # Navigation sidebar
│
├── assets/
│   └── styles/
│       └── theme.py             # Global QSS stylesheet
│
└── datasets/
    └── student_data.csv         # Auto-generated by generate_dataset.py
```

---

## 🤖 AI & ML Concepts Used

| Concept | Implementation |
|---|---|
| **Random Forest** | GPA prediction model (`models/prediction_model.py`) |
| **Ridge Regression** | Ensemble GPA prediction alongside Random Forest |
| **Classification** | Student risk level detection (High / Medium / Low) |
| **Recommendation System** | Career matching based on GPA + skills + interests |
| **NLP (Keyword Matching)** | Chatbot intent detection and response generation |
| **Data Analytics** | Performance trend analysis across semesters |
| **Predictive Modeling** | Future GPA projection for next 2 semesters |

---

## 📊 Dataset

The included dataset generator (`generate_dataset.py`) creates realistic student records with:

| Column | Description |
|---|---|
| `name` | Student full name |
| `email` | University email |
| `semester` | Current semester (1–8) |
| `attendance` | Attendance percentage (50–98%) |
| `quiz` | Average quiz score (35–96/100) |
| `assignment` | Assignment score (38–96/100) |
| `midterm` | Midterm exam score (32–95/100) |
| `study_hours` | Daily study hours (0.5–7.0) |
| `gpa` | Calculated GPA (0.0–4.0) |
| `interest` | Career interest area |
| `skills` | Current technical skills |

**GPA Formula:**
```
GPA = (Attendance×0.20 + Quiz×0.20 + Assignment×0.20 + Midterm×0.30 + StudyHours×0.10) × 4.0
```

---

## 💬 Chatbot — How It Works

The AI chatbot reads **live data from the SQLite database** and generates dynamic responses. It is not hardcoded.

**Example questions you can ask:**
```
"How can I improve my GPA?"
"Who are the top students?"
"Which career suits me?"
"What skills should I learn for AI?"
"How many students are at risk?"
"Generate a study plan"
"What is the class average GPA?"
```

---

## 🎯 Career Recommendation System

Career matches are scored using a weighted algorithm:

```python
match_score = (
    gpa_score      × 0.40 +   # Academic performance
    skills_match   × 0.35 +   # Matching skills
    interest_match × 0.25     # Career interest alignment
)
```

---

## 👨‍💻 Author

**Ali Khan**
BS Artificial Intelligence — Semester 4
COMSATS University Islamabad

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.
---
## 🙏 Acknowledgements

- [scikit-learn](https://scikit-learn.org/) — Machine Learning library
- [PyQt5](https://riverbankcomputing.com/software/pyqt/) — Desktop GUI framework
- [Matplotlib](https://matplotlib.org/) — Data visualization
- [Kaggle](https://kaggle.com/) — Dataset inspiration

---
<div align="center">
  <b>⭐ Star this repo if you found it helpful!</b>
</div>