# ui/career_page.py — Career Recommendation Page

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QLineEdit, QComboBox, QPushButton, QScrollArea,
                              QGridLayout, QDoubleSpinBox, QFrame, QProgressBar)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from ui.components.cards import ContentCard, CareerCard
from recommender.career_recommender import CareerRecommender
from database.db_manager import DatabaseManager


class CareerPage(QWidget):
    def __init__(self, db: DatabaseManager):
        super().__init__()
        self.db = db
        self.recommender = CareerRecommender()
        self.setStyleSheet("background:#F8F9FC;")
        self._build()
        self._run_recommendation()

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

        # ── Input card ────────────────────────────────
        input_card = ContentCard("🎯  Career Match Engine", "Enter your academic profile to get personalized career recommendations")
        il = input_card.body_layout
        il.setSpacing(14)

        row = QHBoxLayout()
        row.setSpacing(12)

        def col_field(label, placeholder=''):
            c = QVBoxLayout()
            lb = QLabel(label)
            lb.setStyleSheet("font-size:11px;color:#9CA3AF;font-weight:600;letter-spacing:0.3px;")
            f = QLineEdit()
            f.setPlaceholderText(placeholder)
            f.setFixedHeight(38)
            f.setStyleSheet("background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;"
                             "padding:0 12px;font-size:13px;color:#111827;")
            c.addWidget(lb)
            c.addWidget(f)
            return c, f

        def col_spin(label, min_v=0.0, max_v=4.0, val=3.0):
            c = QVBoxLayout()
            lb = QLabel(label)
            lb.setStyleSheet("font-size:11px;color:#9CA3AF;font-weight:600;letter-spacing:0.3px;")
            sp = QDoubleSpinBox()
            sp.setRange(min_v, max_v)
            sp.setDecimals(2)
            sp.setValue(val)
            sp.setFixedHeight(38)
            sp.setStyleSheet("background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;"
                              "padding:0 10px;font-size:13px;color:#111827;")
            c.addWidget(lb)
            c.addWidget(sp)
            return c, sp

        c1, self.gpa_spin = col_spin("CURRENT GPA", 0, 4.0, 3.2)
        c2, self.skills_f = col_field("YOUR SKILLS  (comma-separated)", "e.g. Python, SQL, ML")
        c3, self.int_f    = col_field("YOUR INTEREST", "e.g. AI, Cloud, Web")

        for c in [c1, c2, c3]:
            row.addLayout(c)

        btn = QPushButton("  Find Careers")
        btn.setFixedHeight(38)
        btn.setFixedWidth(160)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setStyleSheet("background:#4F6EF7;color:white;border:none;border-radius:8px;"
                           "padding:0 20px;font-size:13px;font-weight:700;margin-top:17px;")
        btn.clicked.connect(self._run_recommendation)

        row.addWidget(btn)
        il.addLayout(row)
        self.main_layout.addWidget(input_card)

        # ── Career cards grid ─────────────────────────
        results_lbl = QLabel("Recommended Career Paths")
        results_lbl.setStyleSheet("font-size:16px;font-weight:700;color:#111827;")
        self.main_layout.addWidget(results_lbl)

        self.grid_widget = QWidget()
        self.grid_widget.setStyleSheet("background:transparent;")
        self.grid_layout = QGridLayout(self.grid_widget)
        self.grid_layout.setSpacing(14)
        self.main_layout.addWidget(self.grid_widget)

        # ── Skill detail section ──────────────────────
        self.skill_detail = ContentCard("🧠  Skills Required for Top Career", "")
        self.skill_body = self.skill_detail.body_layout
        self.main_layout.addWidget(self.skill_detail)

    def _run_recommendation(self):
        gpa    = self.gpa_spin.value()
        skills = self.skills_f.text()
        inter  = self.int_f.text()

        careers = self.recommender.recommend(gpa, skills, inter)

        # Clear grid
        for i in reversed(range(self.grid_layout.count())):
            w = self.grid_layout.itemAt(i).widget()
            if w: w.deleteLater()

        col = 0
        for i, c in enumerate(careers):
            card = CareerCard(c)
            self.grid_layout.addWidget(card, i // 2, i % 2)

        # Skill detail for top career
        self._show_skill_detail(careers[0], skills)

    def _show_skill_detail(self, top_career, user_skills_str):
        self._clear(self.skill_body)
        self.skill_detail.findChild(QLabel).setText(
            f"🧠  Skills for: {top_career['title']} ({top_career['match']}% match)")

        skill_data = self.recommender.get_skill_recommendations(top_career['title'], user_skills_str)

        if skill_data['present']:
            lbl = QLabel("✅  Skills You Already Have")
            lbl.setStyleSheet("font-size:12px;font-weight:700;color:#10B981;")
            self.skill_body.addWidget(lbl)
            present_row = QHBoxLayout()
            for s in skill_data['present']:
                badge = QLabel(s)
                badge.setStyleSheet("background:#D1FAE5;color:#065F46;border-radius:20px;"
                                     "padding:3px 12px;font-size:12px;font-weight:600;")
                present_row.addWidget(badge)
            present_row.addStretch()
            self.skill_body.addLayout(present_row)

        if skill_data['missing']:
            lbl2 = QLabel("📚  Skills to Learn Next")
            lbl2.setStyleSheet("font-size:12px;font-weight:700;color:#EF4444;margin-top:8px;")
            self.skill_body.addWidget(lbl2)
            missing_row = QHBoxLayout()
            for s in skill_data['missing']:
                badge = QLabel(s)
                badge.setStyleSheet("background:#FEE2E2;color:#991B1B;border-radius:20px;"
                                     "padding:3px 12px;font-size:12px;font-weight:600;")
                missing_row.addWidget(badge)
            missing_row.addStretch()
            self.skill_body.addLayout(missing_row)

        # Progress bar per skill
        all_s = skill_data['all']
        pres  = set(s.lower() for s in skill_data['present'])
        self.skill_body.addSpacing(6)
        for s in all_s:
            row = QHBoxLayout()
            name = QLabel(s)
            name.setFixedWidth(160)
            name.setStyleSheet("font-size:12px;color:#374151;font-weight:500;")
            bar = QProgressBar()
            bar.setRange(0, 1)
            bar.setValue(1 if s.lower() in pres else 0)
            bar.setFixedHeight(6)
            c = '#10B981' if s.lower() in pres else '#E5E7EB'
            bar.setStyleSheet(f"QProgressBar{{background:#F3F4F6;border:none;border-radius:3px;}}"
                               f"QProgressBar::chunk{{background:{c};border-radius:3px;}}")
            status = QLabel("✅" if s.lower() in pres else "⬜")
            status.setFixedWidth(20)
            row.addWidget(status)
            row.addWidget(name)
            row.addWidget(bar, 1)
            self.skill_body.addLayout(row)
        self.skill_body.addStretch()

    def _clear(self, layout):
        while layout.count():
            item = layout.takeAt(0)
            if item.widget(): item.widget().deleteLater()
            elif item.layout(): self._clear(item.layout())
