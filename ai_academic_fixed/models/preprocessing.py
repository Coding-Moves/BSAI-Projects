# models/preprocessing.py
import numpy as np, pandas as pd

FEATURES = ['attendance', 'quiz', 'assignment', 'midterm', 'study_hours']

def preprocess(df):
    df = df.copy()
    for col in FEATURES:
        if col not in df.columns:
            df[col] = 0
    X = df[FEATURES].fillna(df[FEATURES].mean())
    y = df['gpa'].fillna(df['gpa'].mean())
    return X.values, y.values

def preprocess_input(attendance, quiz, assignment, midterm, study_hours):
    arr = np.array([[attendance, quiz, assignment, midterm, study_hours]], dtype=float)
    return arr
