# ui/dashboard_page.py — Premium Dashboard

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QScrollArea, QGridLayout, QSizePolicy)
from PyQt5.QtCore import Qt
from ui.components.cards import StatCard, ContentCard, InsightRow, ProgressRow
from ui.components.charts import GPABarChart, GPADistChart, RiskPieChart
from database.db_manager import DatabaseManager
from analytics.analytics_engine import AnalyticsEngine


class DashboardPage(QWidget):
    def __init__(self, db: DatabaseManager):
        super().__init__()
        self.db = db
        self.engine = AnalyticsEngine(db)
        self._build()
        self.refresh()

    def _build(self):
        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(0)
        scroll.setStyleSheet("background:#F8F9FC;")

        content = QWidget()
        content.setStyleSheet("background:#F8F9FC;")
        self.layout_main = QVBoxLayout(content)
        self.layout_main.setContentsMargins(28, 24, 28, 28)
        self.layout_main.setSpacing(20)

        scroll.setWidget(content)
        outer.addWidget(scroll)

        # ── Stat cards row ────────────────────────────
        self.stats_row = QHBoxLayout()
        self.stats_row.setSpacing(14)
        self.layout_main.addLayout(self.stats_row)

        # ── Charts row ────────────────────────────────
        charts_row = QHBoxLayout()
        charts_row.setSpacing(14)
        self.layout_main.addLayout(charts_row)

        # GPA bar chart card
        self.gpa_chart_card = ContentCard("Student GPA Overview", "All registered students")
        self.gpa_chart_placeholder = QWidget()
        self.gpa_chart_placeholder.setMinimumHeight(200)
        self.gpa_chart_card.body_layout.addWidget(self.gpa_chart_placeholder)
        charts_row.addWidget(self.gpa_chart_card, 3)

        # Distribution card
        right_col = QVBoxLayout()
        right_col.setSpacing(14)
        self.dist_card = ContentCard("GPA Distribution", "Grouped by range")
        self.dist_placeholder = QWidget()
        self.dist_placeholder.setMinimumHeight(140)
        self.dist_card.body_layout.addWidget(self.dist_placeholder)
        right_col.addWidget(self.dist_card)

        self.risk_card = ContentCard("Risk Levels", "Student risk breakdown")
        self.risk_placeholder = QWidget()
        self.risk_placeholder.setMinimumHeight(140)
        self.risk_card.body_layout.addWidget(self.risk_placeholder)
        right_col.addWidget(self.risk_card)
        charts_row.addLayout(right_col, 2)

        # ── Bottom row: insights + top students ───────
        bottom_row = QHBoxLayout()
        bottom_row.setSpacing(14)
        self.layout_main.addLayout(bottom_row)

        self.insights_card = ContentCard("AI Insights", "System-generated observations")
        self.insights_body = self.insights_card.body_layout
        bottom_row.addWidget(self.insights_card, 1)

        self.top_card = ContentCard("Top Performers", "Ranked by GPA")
        self.top_body = self.top_card.body_layout
        bottom_row.addWidget(self.top_card, 1)

    def refresh(self):
        self._clear_stats()
        stats = self.engine.get_dashboard_stats()

        avg_gpa = stats.get('avg_gpa') or 0
        avg_att = stats.get('avg_att') or 0
        total   = stats.get('total') or 0
        at_risk = stats.get('at_risk') or 0
        top_p   = stats.get('top_performers') or 0

        cards = [
            StatCard("👥", "Total Students",  total,          badge_text="Active",           badge_color='blue',   accent='#4F6EF7'),
            StatCard("🎯", "Average GPA",     f"{avg_gpa:.2f}", badge_text="This Semester",  badge_color='green',  accent='#10B981'),
            StatCard("📅", "Avg Attendance",  f"{avg_att:.1f}%", badge_text="Attendance",    badge_color='purple', accent='#7C3AED'),
            StatCard("⚠️", "At-Risk Students", at_risk,       badge_text="Need Help",        badge_color='red',    accent='#EF4444'),
            StatCard("🌟", "Top Performers",  top_p,          badge_text="GPA ≥ 3.5",        badge_color='yellow', accent='#F59E0B'),
        ]
        for c in cards:
            self.stats_row.addWidget(c)

        # Charts
        names, gpas = self.engine.get_gpa_chart_data()
        self._replace_widget(self.gpa_chart_card.body_layout, 0,
                             GPABarChart(names, gpas, figsize=(7, 2.6)))

        bins = self.engine.get_gpa_bins()
        self._replace_widget(self.dist_card.body_layout, 0,
                             GPADistChart(bins, figsize=(4, 2.2)))

        risk = self.engine.get_risk_breakdown()
        self._replace_widget(self.risk_card.body_layout, 0,
                             RiskPieChart(risk, figsize=(4, 2.2)))

        # Insights
        self._clear_layout(self.insights_body)
        for ins in self.engine.get_performance_insights():
            row = InsightRow(ins['icon'], ins['text'], ins['color'])
            self.insights_body.addWidget(row)
        self.insights_body.addStretch()

        # Top performers
        self._clear_layout(self.top_body)
        for i, s in enumerate(self.db.get_top_students(6), 1):
            row = QHBoxLayout()
            rank = QLabel(f"#{i}")
            rank.setFixedWidth(28)
            rank.setStyleSheet("font-size:12px;font-weight:700;color:#9CA3AF;")
            name = QLabel(s['name'])
            name.setStyleSheet("font-size:13px;font-weight:600;color:#111827;")
            gpa_lbl = QLabel(f"{s['gpa']:.2f}")
            gpa_lbl.setStyleSheet("font-size:13px;font-weight:700;color:#10B981;")
            row.addWidget(rank)
            row.addWidget(name, 1)
            row.addWidget(gpa_lbl)
            self.top_body.addLayout(row)
        self.top_body.addStretch()

    def _clear_stats(self):
        while self.stats_row.count():
            item = self.stats_row.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

    def _clear_layout(self, layout):
        while layout.count():
            item = layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
            elif item.layout():
                self._clear_layout(item.layout())

    def _replace_widget(self, layout, idx, new_widget):
        old = layout.itemAt(idx)
        if old and old.widget():
            old.widget().deleteLater()
        layout.insertWidget(idx, new_widget)
