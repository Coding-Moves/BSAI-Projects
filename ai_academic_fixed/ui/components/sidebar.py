# ui/components/sidebar.py — Premium fixed sidebar navigation

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QLabel, QPushButton,
                              QHBoxLayout, QFrame, QSizePolicy)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont

NAV_ITEMS = [
    ("🏠", "Dashboard",  0),
    ("👥", "Students",   1),
    ("📊", "Analytics",  2),
    ("🎯", "Careers",    3),
    ("🧠", "Skills",     4),
    ("📅", "Planner",    5),
    ("🤖", "AI Chatbot", 6),
]

class Sidebar(QWidget):
    page_changed = pyqtSignal(int)

    def __init__(self):
        super().__init__()
        self.setObjectName("sidebar")
        self.setFixedWidth(220)
        self._active = 0
        self._buttons = {}
        self._build()

    def _build(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # ── Logo block ────────────────────────────────
        logo_widget = QWidget()
        logo_widget.setStyleSheet("background:#FFFFFF;border-bottom:1px solid #F3F4F6;")
        logo_layout = QVBoxLayout(logo_widget)
        logo_layout.setContentsMargins(20, 22, 20, 18)
        logo_layout.setSpacing(2)

        logo_row = QHBoxLayout()
        icon_lbl = QLabel("🎓")
        icon_lbl.setFont(QFont("Segoe UI Emoji", 22))
        logo_text = QLabel("EduAI")
        logo_text.setStyleSheet("font-size:18px;font-weight:700;color:#4F6EF7;letter-spacing:-0.5px;")
        logo_row.addWidget(icon_lbl)
        logo_row.addWidget(logo_text)
        logo_row.addStretch()
        logo_layout.addLayout(logo_row)

        sub = QLabel("Analytics Platform")
        sub.setStyleSheet("font-size:10px;color:#9CA3AF;font-weight:500;letter-spacing:0.3px;")
        logo_layout.addWidget(sub)
        layout.addWidget(logo_widget)

        # ── Nav section ───────────────────────────────
        nav_widget = QWidget()
        nav_widget.setStyleSheet("background:#FFFFFF;")
        nav_layout = QVBoxLayout(nav_widget)
        nav_layout.setContentsMargins(8, 12, 8, 8)
        nav_layout.setSpacing(2)

        section_lbl = QLabel("MAIN MENU")
        section_lbl.setObjectName("sidebar_section")
        section_lbl.setStyleSheet("font-size:10px;font-weight:700;color:#9CA3AF;"
                                   "letter-spacing:1.2px;padding:8px 12px 6px 12px;")
        nav_layout.addWidget(section_lbl)

        for icon, label, idx in NAV_ITEMS:
            btn = self._make_nav_btn(icon, label, idx)
            self._buttons[idx] = btn
            nav_layout.addWidget(btn)

        nav_layout.addStretch()
        layout.addWidget(nav_widget, 1)

        # ── Footer ────────────────────────────────────
        footer = QWidget()
        footer.setFixedHeight(70)
        footer.setStyleSheet("background:#FFFFFF;border-top:1px solid #F3F4F6;")
        fl = QVBoxLayout(footer)
        fl.setContentsMargins(16, 12, 16, 12)
        ver = QLabel("v2.0  •  BS AI Exhibition")
        ver.setStyleSheet("font-size:10px;color:#D1D5DB;")
        fl.addWidget(ver)
        layout.addWidget(footer)

        self._set_active(0)

    def _make_nav_btn(self, icon, label, idx):
        btn = QPushButton(f"  {icon}   {label}")
        btn.setObjectName("nav_btn")
        btn.setFixedHeight(40)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setStyleSheet("""
            QPushButton {
                background:transparent; border:none; border-radius:8px;
                padding:0 12px; text-align:left; font-size:13px; color:#6B7280;
            }
            QPushButton:hover { background:#F3F4F6; color:#111827; }
        """)
        btn.clicked.connect(lambda _, i=idx: self._on_nav(i))
        return btn

    def _on_nav(self, idx):
        self._set_active(idx)
        self.page_changed.emit(idx)

    def _set_active(self, idx):
        self._active = idx
        for i, btn in self._buttons.items():
            if i == idx:
                btn.setStyleSheet("""
                    QPushButton {
                        background:#EEF1FF; border:none; border-radius:8px;
                        padding:0 12px; text-align:left; font-size:13px;
                        font-weight:700; color:#4F6EF7;
                    }
                """)
            else:
                btn.setStyleSheet("""
                    QPushButton {
                        background:transparent; border:none; border-radius:8px;
                        padding:0 12px; text-align:left; font-size:13px; color:#6B7280;
                    }
                    QPushButton:hover { background:#F3F4F6; color:#111827; }
                """)

    def set_active(self, idx):
        self._set_active(idx)
