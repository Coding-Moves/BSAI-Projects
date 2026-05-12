# ui/planner_page.py — AI Study Planner Page

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QDoubleSpinBox, QPushButton, QScrollArea,
                              QFrame, QProgressBar)
from PyQt5.QtCore import Qt
from ui.components.cards import ContentCard
from recommender.study_planner import generate_plan


class PlannerPage(QWidget):
    def __init__(self):
        super().__init__()
        self.setStyleSheet("background:#F8F9FC;")
        self._build()
        self._generate()

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
        inp_card = ContentCard("📅  AI Study Plan Generator", "Enter your current performance to get a personalized weekly plan")
        il = inp_card.body_layout
        row = QHBoxLayout()
        row.setSpacing(12)

        def make_spin(label, min_v, max_v, val):
            c = QVBoxLayout()
            lb = QLabel(label)
            lb.setStyleSheet("font-size:11px;color:#9CA3AF;font-weight:600;letter-spacing:0.3px;")
            sp = QDoubleSpinBox()
            sp.setRange(min_v, max_v)
            sp.setDecimals(1)
            sp.setValue(val)
            sp.setFixedHeight(38)
            sp.setStyleSheet("background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;"
                              "padding:0 10px;font-size:13px;color:#111827;")
            c.addWidget(lb)
            c.addWidget(sp)
            return c, sp

        c1, self.sp_att  = make_spin("ATTENDANCE %",  0, 100, 80)
        c2, self.sp_quiz = make_spin("QUIZ SCORE",    0, 100, 72)
        c3, self.sp_asgn = make_spin("ASSIGNMENT",    0, 100, 75)
        c4, self.sp_mid  = make_spin("MIDTERM",       0, 100, 68)
        c5, self.sp_hrs  = make_spin("STUDY HRS/DAY", 1, 12,   4)

        for c in [c1, c2, c3, c4, c5]:
            row.addLayout(c)

        btn = QPushButton("  Generate Plan")
        btn.setFixedHeight(38)
        btn.setFixedWidth(160)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setStyleSheet("background:#4F6EF7;color:white;border:none;border-radius:8px;"
                           "padding:0 20px;font-size:13px;font-weight:700;margin-top:17px;")
        btn.clicked.connect(self._generate)
        row.addWidget(btn)
        il.addLayout(row)
        self.main_layout.addWidget(inp_card)

        # ── Plan display ──────────────────────────────
        plan_lbl = QLabel("📋  Your Weekly Study Plan")
        plan_lbl.setStyleSheet("font-size:16px;font-weight:700;color:#111827;")
        self.main_layout.addWidget(plan_lbl)

        self.plan_row = QHBoxLayout()
        self.plan_row.setSpacing(10)
        self.main_layout.addLayout(self.plan_row)

        self.tips_card = ContentCard("💡  Study Tips", "Evidence-based productivity tips")
        tb = self.tips_card.body_layout
        TIPS = [
            ("⏱️", "Pomodoro Technique", "Study 50 min, break 10 min. Repeat 3–4 cycles then take a long break.", "#4F6EF7"),
            ("📖", "Active Recall",       "Test yourself instead of re-reading. Use flashcards and past papers.", "#7C3AED"),
            ("🌙", "Sleep Priority",      "8 hrs sleep consolidates memory. Don't sacrifice sleep for extra hours.", "#10B981"),
            ("📌", "Priority Matrix",     "Focus on high-weight, low-score subjects first for maximum GPA impact.", "#F59E0B"),
            ("👥", "Study Groups",        "Teach concepts to peers. Explaining solidifies your own understanding.", "#0EA5E9"),
        ]
        for icon, title, desc, color in TIPS:
            tip = QWidget()
            tip.setStyleSheet(f"background:{color}0D;border-radius:8px;border-left:3px solid {color};")
            tl = QHBoxLayout(tip)
            tl.setContentsMargins(12, 10, 12, 10)
            tl.setSpacing(10)
            ico = QLabel(icon)
            ico.setFixedWidth(24)
            col = QVBoxLayout()
            col.setSpacing(2)
            t = QLabel(title)
            t.setStyleSheet(f"font-size:12px;font-weight:700;color:{color};")
            d = QLabel(desc)
            d.setStyleSheet("font-size:11px;color:#6B7280;")
            d.setWordWrap(True)
            col.addWidget(t)
            col.addWidget(d)
            tl.addWidget(ico)
            tl.addLayout(col, 1)
            tb.addWidget(tip)
        tb.addStretch()
        self.main_layout.addWidget(self.tips_card)

    def _generate(self):
        att  = self.sp_att.value()
        quiz = self.sp_quiz.value()
        asgn = self.sp_asgn.value()
        mid  = self.sp_mid.value()
        hrs  = self.sp_hrs.value()

        plan = generate_plan(att, quiz, asgn, mid, hrs)

        # Clear old plan
        while self.plan_row.count():
            item = self.plan_row.takeAt(0)
            if item.widget(): item.widget().deleteLater()

        COLORS = {'HIGH': '#EF4444', 'MED': '#F59E0B', 'LOW': '#10B981', 'REST': '#9CA3AF'}

        for day_data in plan:
            day_card = QWidget()
            day_card.setStyleSheet("background:#FFFFFF;border:1px solid #E5E7EB;border-radius:10px;")
            day_card.setFixedWidth(150)
            dl = QVBoxLayout(day_card)
            dl.setContentsMargins(10, 12, 10, 12)
            dl.setSpacing(6)

            day_lbl = QLabel(day_data['day'])
            day_lbl.setStyleSheet("font-size:12px;font-weight:700;color:#111827;")
            dl.addWidget(day_lbl)

            hrs_lbl = QLabel(f"{day_data['total_hrs']} hrs")
            hrs_lbl.setStyleSheet("font-size:10px;color:#9CA3AF;")
            dl.addWidget(hrs_lbl)

            sep = QFrame(); sep.setFrameShape(QFrame.HLine)
            sep.setStyleSheet("background:#F3F4F6;max-height:1px;border:none;")
            dl.addWidget(sep)

            for sess in day_data['sessions']:
                s_w = QWidget()
                c = sess['color']
                s_w.setStyleSheet(f"background:{c}18;border-radius:6px;border-left:2px solid {c};")
                sl = QVBoxLayout(s_w)
                sl.setContentsMargins(7, 6, 7, 6)
                sl.setSpacing(2)
                s_lbl = QLabel(sess['subject'])
                s_lbl.setStyleSheet(f"font-size:10px;font-weight:700;color:{c};")
                s_lbl.setWordWrap(True)
                dur = QLabel(f"{sess['duration']} min")
                dur.setStyleSheet("font-size:9px;color:#9CA3AF;")
                sl.addWidget(s_lbl)
                sl.addWidget(dur)
                dl.addWidget(s_w)

            dl.addStretch()
            self.plan_row.addWidget(day_card)
        self.plan_row.addStretch()
