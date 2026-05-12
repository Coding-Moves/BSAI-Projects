# analytics/analytics_engine.py
import statistics
from database.db_manager import DatabaseManager
from config import MAX_GPA_CHART_STUDENTS

class AnalyticsEngine:
    def __init__(self, db: DatabaseManager):
        self.db = db

    def get_dashboard_stats(self):
        return self.db.get_stats()

    def get_gpa_chart_data(self):
        students = self.db.get_all_students()
        # Limit number of students shown in the GPA chart to avoid visual saturation
        max_n = MAX_GPA_CHART_STUDENTS if MAX_GPA_CHART_STUDENTS and MAX_GPA_CHART_STUDENTS > 0 else len(students)
        students = students[:max_n]
        names = [s['name'].split()[0] for s in students]
        gpas = [s['gpa'] for s in students]
        return names, gpas

    def get_subject_chart_data(self):
        avgs = self.db.get_subject_averages()
        labels = ['Attendance', 'Quiz', 'Assignment', 'Midterm']
        values = [avgs['attendance'], avgs['quiz'], avgs['assignment'], avgs['midterm']]
        return labels, values

    def get_risk_breakdown(self):
        students = self.db.get_all_students()
        low = sum(1 for s in students if s['risk_level'] == 'Low')
        med = sum(1 for s in students if s['risk_level'] == 'Medium')
        high = sum(1 for s in students if s['risk_level'] == 'High')
        return {'Low': low, 'Medium': med, 'High': high}

    def get_gpa_bins(self):
        gpas = self.db.get_gpa_distribution()
        bins = {'<2.0': 0, '2.0–2.5': 0, '2.5–3.0': 0, '3.0–3.5': 0, '3.5–4.0': 0}
        for g in gpas:
            if g < 2.0:   bins['<2.0'] += 1
            elif g < 2.5: bins['2.0–2.5'] += 1
            elif g < 3.0: bins['2.5–3.0'] += 1
            elif g < 3.5: bins['3.0–3.5'] += 1
            else:         bins['3.5–4.0'] += 1
        return bins

    def get_performance_insights(self):
        stats = self.get_dashboard_stats()
        insights = []
        avg_gpa = stats.get('avg_gpa', 0) or 0
        avg_att = stats.get('avg_att', 0) or 0
        at_risk = stats.get('at_risk', 0) or 0
        if avg_gpa >= 3.3:
            insights.append({'icon': '🌟', 'text': f'Average GPA {avg_gpa:.2f} — class is performing well', 'color': '#10B981'})
        elif avg_gpa < 2.8:
            insights.append({'icon': '⚠️', 'text': f'Average GPA {avg_gpa:.2f} — intervention recommended', 'color': '#EF4444'})
        if avg_att >= 85:
            insights.append({'icon': '✅', 'text': f'Attendance at {avg_att:.1f}% — excellent engagement', 'color': '#10B981'})
        elif avg_att < 75:
            insights.append({'icon': '📅', 'text': f'Attendance at {avg_att:.1f}% — needs improvement', 'color': '#F59E0B'})
        if at_risk > 0:
            insights.append({'icon': '🚨', 'text': f'{at_risk} student(s) at high risk — require attention', 'color': '#EF4444'})
        if not insights:
            insights.append({'icon': '📊', 'text': 'All metrics within normal range', 'color': '#4F6EF7'})
        return insights
