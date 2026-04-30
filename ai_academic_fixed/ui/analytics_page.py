# ui/analytics_page.py — Full Analytics with Prediction Engine

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QComboBox, QDoubleSpinBox, QPushButton,
                              QScrollArea, QGridLayout, QSizePolicy, QFrame)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from ui.components.cards import ContentCard, StatCard, ProgressRow, InsightRow
from ui.components.charts import (GPABarChart, SubjectRadarChart,
                                   SubjectBarChart, RiskPieChart)
from analytics.analytics_engine import AnalyticsEngine
from models.prediction_model import GPAPredictor
from database.db_manager import DatabaseManager


class AnalyticsPage(QWidget):
    def __init__(self, db: DatabaseManager):
        super().__init__()
        self.db = db
        self.engine = AnalyticsEngine(db)
        self.predictor = GPAPredictor()
        self.setStyleSheet("background:#F8F9FC;")
        self._build()
        self._load_charts()

    def _build(self):
        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(0)
        scroll.setStyleSheet("background:#F8F9FC;")

        content = QWidget()
        content.setStyleSheet("background:#F8F9FC;")
        self.main_layout = QVBoxLayout(content)
        self.main_layout.setContentsMargins(28, 24, 28, 28)
        self.main_layout.setSpacing(20)
        scroll.setWidget(content)
        outer.addWidget(scroll)

        # ── AI Prediction Panel ───────────────────────
        pred_card = ContentCard("🔮  AI GPA Predictor", "Enter student metrics for real-time prediction")
        pl = pred_card.body_layout
        pl.setSpacing(14)

        row1 = QHBoxLayout()
        row1.setSpacing(12)

        def make_spin(label, min_v, max_v, dec, default):
            col = QVBoxLayout()
            lbl = QLabel(label)
            lbl.setStyleSheet("font-size:11px;color:#9CA3AF;font-weight:600;letter-spacing:0.3px;")
            sp = QDoubleSpinBox()
            sp.setRange(min_v, max_v)
            sp.setDecimals(dec)
            sp.setValue(default)
            sp.setFixedHeight(38)
            sp.setStyleSheet("background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;"
                              "padding:0 10px;font-size:13px;color:#111827;")
            col.addWidget(lbl)
            col.addWidget(sp)
            return col, sp

        c1, self.sp_att  = make_spin("ATTENDANCE %",   0, 100, 1, 85.0)
        c2, self.sp_quiz = make_spin("QUIZ SCORE",     0, 100, 1, 78.0)
        c3, self.sp_asgn = make_spin("ASSIGNMENT",     0, 100, 1, 80.0)
        c4, self.sp_mid  = make_spin("MIDTERM",        0, 100, 1, 72.0)
        c5, self.sp_hrs  = make_spin("STUDY HRS/DAY",  0, 12,  1, 4.0)

        for c in [c1, c2, c3, c4, c5]:
            row1.addLayout(c)
        pl.addLayout(row1)

        btn_row = QHBoxLayout()
        self.predict_btn = QPushButton("  Run AI Prediction")
        self.predict_btn.setFixedHeight(40)
        self.predict_btn.setCursor(Qt.PointingHandCursor)
        self.predict_btn.setStyleSheet("""
            QPushButton { background:#4F6EF7;color:white;border:none;border-radius:8px;
                          padding:0 28px;font-size:13px;font-weight:700; }
            QPushButton:hover { background:#3B5BDB; }
        """)
        self.predict_btn.clicked.connect(self._run_prediction)
        btn_row.addStretch()
        btn_row.addWidget(self.predict_btn)
        pl.addLayout(btn_row)

        # Result area
        self.result_row = QHBoxLayout()
        self.result_row.setSpacing(10)
        pl.addLayout(self.result_row)

        self.main_layout.addWidget(pred_card)

        # ── Charts grid ───────────────────────────────
        grid = QGridLayout()
        grid.setSpacing(14)
        self.main_layout.addLayout(grid)

        self.bar_card = ContentCard("GPA by Student", "")
        self.bar_ph = QWidget()
        self.bar_ph.setMinimumHeight(200)
        self.bar_card.body_layout.addWidget(self.bar_ph)
        grid.addWidget(self.bar_card, 0, 0, 1, 2)

        self.radar_card = ContentCard("Subject Radar", "Class averages")
        self.radar_ph = QWidget()
        self.radar_ph.setMinimumHeight(240)
        self.radar_card.body_layout.addWidget(self.radar_ph)
        grid.addWidget(self.radar_card, 1, 0)

        self.subj_card = ContentCard("Score Breakdown", "By subject area")
        self.subj_ph = QWidget()
        self.subj_ph.setMinimumHeight(240)
        self.subj_card.body_layout.addWidget(self.subj_ph)
        grid.addWidget(self.subj_card, 1, 1)

        self.risk_card = ContentCard("Risk Distribution", "Student risk levels")
        self.risk_ph = QWidget()
        self.risk_ph.setMinimumHeight(200)
        self.risk_card.body_layout.addWidget(self.risk_ph)
        grid.addWidget(self.risk_card, 2, 0)

        # At-risk students list
        self.atrisk_card = ContentCard("⚠️  At-Risk Students", "GPA below 2.5")
        self.atrisk_body = self.atrisk_card.body_layout
        grid.addWidget(self.atrisk_card, 2, 1)

    def _load_charts(self):
        names, gpas = self.engine.get_gpa_chart_data()
        self._swap(self.bar_card.body_layout, 0, GPABarChart(names, gpas, figsize=(8, 2.6)))

        avgs = self.db.get_subject_averages()
        labels = ['Attendance', 'Quiz', 'Assignment', 'Midterm']
        values = [avgs['attendance'], avgs['quiz'], avgs['assignment'], avgs['midterm']]
        self._swap(self.radar_card.body_layout, 0, SubjectRadarChart(labels, values, figsize=(4, 3.5)))
        self._swap(self.subj_card.body_layout,  0, SubjectBarChart(labels, values, figsize=(4, 3.5)))

        risk = self.engine.get_risk_breakdown()
        self._swap(self.risk_card.body_layout, 0, RiskPieChart(risk, figsize=(4, 3)))

        # At-risk students
        self._clear(self.atrisk_body)
        risk_students = self.db.get_risk_students()
        if not risk_students:
            lbl = QLabel("✅  No students currently at risk")
            lbl.setStyleSheet("color:#10B981;font-size:13px;")
            self.atrisk_body.addWidget(lbl)
        for s in risk_students:
            row = QHBoxLayout()
            n = QLabel(s['name'])
            n.setStyleSheet("font-size:13px;font-weight:600;color:#111827;")
            g = QLabel(f"GPA: {s['gpa']:.2f}")
            g.setStyleSheet("font-size:12px;color:#EF4444;font-weight:700;")
            row.addWidget(n, 1)
            row.addWidget(g)
            self.atrisk_body.addLayout(row)
        self.atrisk_body.addStretch()

    def _run_prediction(self):
        att  = self.sp_att.value()
        quiz = self.sp_quiz.value()
        asgn = self.sp_asgn.value()
        mid  = self.sp_mid.value()
        hrs  = self.sp_hrs.value()

        result = self.predictor.predict(att, quiz, asgn, mid, hrs)

        # Clear old results
        while self.result_row.count():
            item = self.result_row.takeAt(0)
            if item.widget(): item.widget().deleteLater()

        def res_card(label, value, color='#4F6EF7', bg='#EEF1FF'):
            w = QWidget()
            w.setStyleSheet(f"background:{bg};border-radius:10px;padding:4px;")
            l = QVBoxLayout(w)
            l.setContentsMargins(16, 12, 16, 12)
            v = QLabel(str(value))
            v.setStyleSheet(f"font-size:22px;font-weight:800;color:{color};")
            lb = QLabel(label)
            lb.setStyleSheet("font-size:11px;color:#6B7280;font-weight:600;")
            l.addWidget(v)
            l.addWidget(lb)
            return w

        gpa = result['predicted_gpa']
        color = '#10B981' if gpa >= 3.5 else ('#F59E0B' if gpa >= 2.5 else '#EF4444')
        self.result_row.addWidget(res_card("Predicted GPA", f"{gpa:.2f}", color, f"{color}18"))
        self.result_row.addWidget(res_card("Grade",         result['grade'],       '#7C3AED', '#EDE9FE'))
        self.result_row.addWidget(res_card("Confidence",    f"{result['confidence']}%", '#4F6EF7', '#EEF1FF'))
        self.result_row.addWidget(res_card("Trend",         result['trend'],        '#F59E0B', '#FEF3C7'))
        self.result_row.addWidget(res_card("Risk Level",    result['risk'],
                                           '#EF4444' if result['risk']=='High' else '#10B981', '#F8F9FC'))
        self.result_row.addStretch()

    def _swap(self, layout, idx, widget):
        old = layout.itemAt(idx)
        if old and old.widget(): old.widget().deleteLater()
        layout.insertWidget(idx, widget)

    def _clear(self, layout):
        while layout.count():
            item = layout.takeAt(0)
            if item.widget(): item.widget().deleteLater()
            elif item.layout(): self._clear(item.layout())
