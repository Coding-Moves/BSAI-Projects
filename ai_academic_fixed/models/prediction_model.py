# models/prediction_model.py
import joblib, os, numpy as np
from models.preprocessing import preprocess_input
from models.training import train_model
from config import MODEL_PATH

class GPAPredictor:
    def __init__(self):
        self._load_or_train()

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            data = joblib.load(MODEL_PATH)
            self.rf = data['rf']
            self.lr = data['lr']
            self.accuracy = data.get('r2', 0.9)
        else:
            result = train_model()
            data = joblib.load(MODEL_PATH)
            self.rf = data['rf']
            self.lr = data['lr']
            self.accuracy = data.get('r2', 0.9)

    def predict(self, attendance, quiz, assignment, midterm, study_hours):
        X = preprocess_input(attendance, quiz, assignment, midterm, study_hours)
        rf_pred = float(self.rf.predict(X)[0])
        lr_pred = float(self.lr.predict(X)[0])
        ensemble = round((rf_pred * 0.65 + lr_pred * 0.35), 2)
        ensemble = max(0.0, min(4.0, ensemble))
        confidence = round(min(98, max(60, self.accuracy * 100 - abs(rf_pred - lr_pred) * 10)), 1)
        risk = 'High' if ensemble < 2.5 else ('Medium' if ensemble < 3.0 else 'Low')
        trend = self._get_trend(ensemble)
        return {
            'predicted_gpa': ensemble,
            'rf_prediction': round(rf_pred, 2),
            'lr_prediction': round(lr_pred, 2),
            'confidence': confidence,
            'risk': risk,
            'trend': trend,
            'grade': self._gpa_to_grade(ensemble),
        }

    def _gpa_to_grade(self, gpa):
        if gpa >= 3.7: return 'A+'
        if gpa >= 3.5: return 'A'
        if gpa >= 3.3: return 'A-'
        if gpa >= 3.0: return 'B+'
        if gpa >= 2.7: return 'B'
        if gpa >= 2.5: return 'B-'
        if gpa >= 2.0: return 'C'
        return 'D'

    def _get_trend(self, gpa):
        if gpa >= 3.5: return '↑ Excellent'
        if gpa >= 3.0: return '→ Good'
        if gpa >= 2.5: return '↘ Average'
        return '↓ At Risk'

    def get_weak_subjects(self, attendance, quiz, assignment, midterm):
        weak = []
        if attendance < 75: weak.append(('Attendance', attendance, 75))
        if quiz < 65:        weak.append(('Quiz',       quiz,       65))
        if assignment < 70:  weak.append(('Assignment', assignment, 70))
        if midterm < 60:     weak.append(('Midterm',    midterm,    60))
        return weak

    def get_suggestions(self, attendance, quiz, assignment, midterm, study_hours):
        suggestions = []
        if attendance < 80:    suggestions.append("📅 Attendance below 80% — attend all upcoming lectures")
        if quiz < 65:          suggestions.append("✏️ Quiz scores low — practice MCQs and concept drills daily")
        if assignment < 70:    suggestions.append("📝 Assignment marks need improvement — submit all work on time")
        if midterm < 60:       suggestions.append("📚 Midterm performance weak — review lecture notes thoroughly")
        if study_hours < 3:    suggestions.append("⏰ Increase study hours to at least 4–5 hrs/day")
        if not suggestions:    suggestions.append("✅ Performance is strong — maintain consistency and stay ahead!")
        return suggestions
