# ui/skills_page.py — Smart Skill Recommendation Page

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QComboBox, QProgressBar, QPushButton, QScrollArea,
                              QLineEdit, QDoubleSpinBox, QFrame)
from PyQt5.QtCore import Qt
from ui.components.cards import ContentCard
from config import SKILLS_DB, CAREERS
from recommender.career_recommender import CareerRecommender


class SkillsPage(QWidget):
    def __init__(self):
        super().__init__()
        self.recommender = CareerRecommender()
        self.setStyleSheet("background:#F8F9FC;")
        self._build()
        self._load_skills()

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

        # ── Filter card ───────────────────────────────
        filter_card = ContentCard("🧠  Skill Recommendation Engine", "Select a career goal to see required skills")
        fl = filter_card.body_layout
        row = QHBoxLayout()
        row.setSpacing(12)

        career_lbl = QLabel("CAREER GOAL")
        career_lbl.setStyleSheet("font-size:11px;color:#9CA3AF;font-weight:600;")
        self.career_combo = QComboBox()
        self.career_combo.addItems([c['title'] for c in CAREERS])
        self.career_combo.setFixedHeight(38)
        self.career_combo.setStyleSheet("background:#F9FAFB;border:1px solid #E5E7EB;"
            "border-radius:8px;padding:0 12px;font-size:13px;color:#111827;")
        self.career_combo.currentTextChanged.connect(self._load_skills)

        your_lbl = QLabel("YOUR SKILLS  (comma-separated)")
        your_lbl.setStyleSheet("font-size:11px;color:#9CA3AF;font-weight:600;")
        self.skills_input = QLineEdit()
        self.skills_input.setPlaceholderText("e.g. Python, SQL, Linux")
        self.skills_input.setFixedHeight(38)
        self.skills_input.setStyleSheet("background:#F9FAFB;border:1px solid #E5E7EB;"
            "border-radius:8px;padding:0 12px;font-size:13px;color:#111827;")

        btn = QPushButton("Analyze")
        btn.setFixedHeight(38)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setStyleSheet("background:#4F6EF7;color:white;border:none;border-radius:8px;"
                           "padding:0 20px;font-size:13px;font-weight:700;")
        btn.clicked.connect(self._load_skills)

        c1 = QVBoxLayout(); c1.addWidget(career_lbl); c1.addWidget(self.career_combo)
        c2 = QVBoxLayout(); c2.addWidget(your_lbl);   c2.addWidget(self.skills_input)
        row.addLayout(c1, 1)
        row.addLayout(c2, 2)
        row.addWidget(btn)
        fl.addLayout(row)
        self.main_layout.addWidget(filter_card)

        # ── Results ───────────────────────────────────
        results_row = QHBoxLayout()
        results_row.setSpacing(14)
        self.main_layout.addLayout(results_row)

        self.required_card = ContentCard("📋  Required Skills", "For your selected career")
        self.required_body = self.required_card.body_layout
        results_row.addWidget(self.required_card, 1)

        self.roadmap_card = ContentCard("🗺️  Learning Roadmap", "Suggested order to learn skills")
        self.roadmap_body = self.roadmap_card.body_layout
        results_row.addWidget(self.roadmap_card, 1)

        # ── All skills matrix ─────────────────────────
        self.matrix_card = ContentCard("📊  Skills Matrix — All Careers", "")
        self.matrix_body = self.matrix_card.body_layout
        self.main_layout.addWidget(self.matrix_card)

    def _load_skills(self):
        career_title = self.career_combo.currentText()
        user_skills_str = self.skills_input.text()
        user_skills = set(s.strip().lower() for s in user_skills_str.replace(';', ',').split(',') if s.strip())

        skill_data = self.recommender.get_skill_recommendations(career_title, user_skills_str)
        present = set(s.lower() for s in skill_data['present'])

        # Required skills
        self._clear(self.required_body)
        for s in skill_data['all']:
            is_present = s.lower() in present
            row = QHBoxLayout()
            icon = QLabel("✅" if is_present else "📚")
            icon.setFixedWidth(24)
            name = QLabel(s)
            name.setStyleSheet(f"font-size:13px;font-weight:{'700' if is_present else '500'};"
                                f"color:{'#10B981' if is_present else '#374151'};")
            bar = QProgressBar()
            bar.setRange(0, 100)
            bar.setValue(100 if is_present else 0)
            bar.setFixedHeight(6)
            c = '#10B981' if is_present else '#E5E7EB'
            bar.setStyleSheet(f"QProgressBar{{background:#F3F4F6;border:none;border-radius:3px;}}"
                               f"QProgressBar::chunk{{background:{c};border-radius:3px;}}")
            status = QLabel("Acquired" if is_present else "Missing")
            status.setStyleSheet(f"font-size:11px;color:{'#10B981' if is_present else '#EF4444'};font-weight:600;")
            status.setFixedWidth(60)
            row.addWidget(icon)
            row.addWidget(name, 1)
            row.addWidget(bar, 2)
            row.addWidget(status)
            self.required_body.addLayout(row)
        self.required_body.addStretch()

        # Roadmap
        self._clear(self.roadmap_body)
        missing = skill_data['missing']
        if not missing:
            done = QLabel("🎉  You have all required skills for this career!")
            done.setStyleSheet("color:#10B981;font-size:13px;font-weight:600;")
            done.setWordWrap(True)
            self.roadmap_body.addWidget(done)
        else:
            for i, s in enumerate(missing, 1):
                step = QWidget()
                step.setStyleSheet("background:#F9FAFB;border-radius:8px;border-left:3px solid #4F6EF7;")
                sl = QHBoxLayout(step)
                sl.setContentsMargins(12, 10, 12, 10)
                num = QLabel(f"Step {i}")
                num.setStyleSheet("font-size:11px;color:#9CA3AF;font-weight:700;")
                num.setFixedWidth(48)
                skill_lbl = QLabel(s)
                skill_lbl.setStyleSheet("font-size:13px;color:#111827;font-weight:600;")
                sl.addWidget(num)
                sl.addWidget(skill_lbl, 1)
                self.roadmap_body.addWidget(step)
        self.roadmap_body.addStretch()

        # Matrix
        self._clear(self.matrix_body)
        header_row = QHBoxLayout()
        career_h = QLabel("Career")
        career_h.setFixedWidth(160)
        career_h.setStyleSheet("font-size:11px;font-weight:700;color:#9CA3AF;")
        header_row.addWidget(career_h)
        header_row.addWidget(QLabel("Key Skills"))
        self.matrix_body.addLayout(header_row)

        line = QFrame(); line.setFrameShape(QFrame.HLine)
        line.setStyleSheet("background:#F3F4F6;max-height:1px;border:none;")
        self.matrix_body.addWidget(line)

        colors = ['#4F6EF7','#7C3AED','#0EA5E9','#EF4444','#10B981','#F59E0B']
        for i, (career, skills) in enumerate(SKILLS_DB.items()):
            row = QHBoxLayout()
            c_lbl = QLabel(career)
            c_lbl.setFixedWidth(160)
            c_lbl.setStyleSheet("font-size:12px;font-weight:600;color:#374151;")
            row.addWidget(c_lbl)
            for s in skills[:5]:
                badge = QLabel(s)
                bg = colors[i % len(colors)]
                badge.setStyleSheet(f"background:{bg}18;color:{bg};border-radius:12px;"
                                     f"padding:2px 10px;font-size:11px;font-weight:600;")
                row.addWidget(badge)
            row.addStretch()
            self.matrix_body.addLayout(row)
        self.matrix_body.addStretch()

    def _clear(self, layout):
        while layout.count():
            item = layout.takeAt(0)
            if item.widget(): item.widget().deleteLater()
            elif item.layout(): self._clear(item.layout())
