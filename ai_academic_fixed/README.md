# AcadAI — AI Academic Performance Prediction & Career Guidance System

**A professional AI-powered desktop application that predicts student GPA, detects weak subjects, recommends careers, and generates personalized study plans — built as a 4th Semester BSAI Project.**

---

## Project Info

**Subject:** Artificial Intelligence  
**Semester:** 4th  
**Submitted To:** [Dr. Muhammad Siddique](mailto:msiddique@nfciet.edu.pk)

**Members:**

- [Faizan Ishfaq](https://github.com/faizanrajpoot774-debug)
- [Muawiya Amir](https://github.com/Muawiya-contact)

---

## Overview

**AcadAI** is an intelligent academic analytics platform built for university students. It uses Machine Learning to predict future GPA, detect at-risk students, recommend career paths based on academic profile, and generate AI-powered study plans — all inside a clean, professional desktop GUI.

Built with Python · PyQt5 · scikit-learn · SQLite · Matplotlib

---

## Features

| Feature                | Description                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------- |
| GPA Prediction         | Random Forest + Ridge Regression model predicts next semester GPA with ~91% accuracy  |
| Weak Subject Detection | ML model identifies subjects needing attention and suggests improvement strategies    |
| Career Recommendation  | Matches student profile (GPA + skills + interests) to best-fit career paths           |
| Skill Roadmap          | Personalized step-by-step learning roadmap for chosen career goal                     |
| Study Planner          | Generates weekly study schedules prioritizing weak subjects                           |
| AI Chatbot 🤖          | NLP-based academic assistant that reads live database and answers student queries     |
| Analytics Dashboard    | Interactive charts: GPA trends, subject radar, risk distribution, attendance analysis |
| Student Management     | Add, edit, import students via CSV — full CRUD with SQLite backend                    |
| CSV Import/Export      | Bulk import 60+ students from CSV; export reports                                     |

---

## Installation

### Prerequisites

Make sure you have **Python 3.10+** installed:

```bash
python --version
```

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/acadai.git
cd acadAI
```

### Step 2 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3 — Generate Sample Dataset (First Time Only)

```bash
python generate_dataset.py
```

This creates `datasets/student_data.csv` with 60 realistic student records.

### Step 4 — Run the Application

```bash
python main.py
```

---

## Requirements

```batch
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

## Project Structure

```txt
AcadAI/
```
