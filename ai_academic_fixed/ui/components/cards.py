# ui/components/cards.py — Reusable card widgets

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QFrame, QProgressBar, QPushButton, QSizePolicy)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QColor


def h_line():
    line = QFrame()
    line.setFrameShape(QFrame.HLine)
    line.setStyleSheet("color:#F3F4F6;background:#F3F4F6;max-height:1px;border:none;")
    return line


class StatCard(QWidget):
    """Top-level KPI card: icon + value + label + optional badge."""
    def __init__(self, icon, label, value, badge_text='', badge_color='blue',
                 accent='#4F6EF7', parent=None):
        super().__init__(parent)
        self.setObjectName("stat_card")
        self.setStyleSheet(f"""
            QWidget#stat_card {{
                background:#FFFFFF; border:1px solid #E5E7EB;
                border-radius:12px;
            }}
            QWidget#stat_card:hover {{ border-color:#C7D2FE; }}
        """)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self.setFixedHeight(110)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(18, 16, 18, 16)
        layout.setSpacing(4)

        # Top row: icon + badge
        top = QHBoxLayout()
        icon_lbl = QLabel(icon)
        icon_lbl.setFont(QFont("Segoe UI Emoji", 20))
        top.addWidget(icon_lbl)
        top.addStretch()
        if badge_text:
            badge = QLabel(badge_text)
            colors = {
                'green':  ('background:#D1FAE5;color:#065F46;',),
                'red':    ('background:#FEE2E2;color:#991B1B;',),
                'yellow': ('background:#FEF3C7;color:#92400E;',),
                'blue':   ('background:#EEF1FF;color:#4F6EF7;',),
                'purple': ('background:#EDE9FE;color:#5B21B6;',),
            }
            style = colors.get(badge_color, colors['blue'])[0]
            badge.setStyleSheet(f"{style} border-radius:20px; padding:2px 9px;"
                                f" font-size:11px; font-weight:700;")
            top.addWidget(badge)
        layout.addLayout(top)

        # Value
        val_lbl = QLabel(str(value))
        val_lbl.setStyleSheet(f"font-size:26px;font-weight:800;color:{accent};"
                               "letter-spacing:-0.5px;")
        layout.addWidget(val_lbl)

        # Label
        lbl = QLabel(label)
        lbl.setStyleSheet("font-size:12px;color:#6B7280;font-weight:500;")
        layout.addWidget(lbl)

        self._val_lbl = val_lbl

    def update_value(self, v):
        self._val_lbl.setText(str(v))


class ContentCard(QWidget):
    """Generic white card with a header."""
    def __init__(self, title='', subtitle='', parent=None):
        super().__init__(parent)
        self.setObjectName("content_card")
        self.setStyleSheet("""
            QWidget#content_card {
                background:#FFFFFF; border:1px solid #E5E7EB; border-radius:12px;
            }
        """)
        self._outer = QVBoxLayout(self)
        self._outer.setContentsMargins(0, 0, 0, 0)
        self._outer.setSpacing(0)

        if title:
            hdr = QWidget()
            hdr.setStyleSheet("background:transparent;")
            hl = QHBoxLayout(hdr)
            hl.setContentsMargins(20, 16, 20, 12)
            t = QLabel(title)
            t.setStyleSheet("font-size:14px;font-weight:700;color:#111827;")
            hl.addWidget(t)
            hl.addStretch()
            if subtitle:
                st = QLabel(subtitle)
                st.setStyleSheet("font-size:11px;color:#9CA3AF;")
                hl.addWidget(st)
            self._outer.addWidget(hdr)
            self._outer.addWidget(h_line())

        self.body = QWidget()
        self.body.setStyleSheet("background:transparent;")
        self.body_layout = QVBoxLayout(self.body)
        self.body_layout.setContentsMargins(20, 16, 20, 16)
        self.body_layout.setSpacing(8)
        self._outer.addWidget(self.body)


class ProgressRow(QWidget):
    """Label + progress bar + value in a single row."""
    def __init__(self, label, value, max_val=100, color='#4F6EF7', parent=None):
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)

        lbl = QLabel(label)
        lbl.setFixedWidth(100)
        lbl.setStyleSheet("font-size:12px;color:#374151;font-weight:500;")
        layout.addWidget(lbl)

        bar = QProgressBar()
        bar.setRange(0, int(max_val))
        bar.setValue(int(value))
        bar.setFixedHeight(7)
        bar.setStyleSheet(f"""
            QProgressBar {{ background:#F3F4F6; border:none; border-radius:4px; }}
            QProgressBar::chunk {{ background:{color}; border-radius:4px; }}
        """)
        layout.addWidget(bar, 1)

        val_lbl = QLabel(f"{value:.0f}")
        val_lbl.setFixedWidth(34)
        val_lbl.setAlignment(Qt.AlignRight | Qt.AlignVCenter)
        val_lbl.setStyleSheet("font-size:12px;color:#6B7280;font-weight:600;")
        layout.addWidget(val_lbl)


class RiskBadge(QLabel):
    _styles = {
        'Low':    'background:#D1FAE5;color:#065F46;',
        'Medium': 'background:#FEF3C7;color:#92400E;',
        'High':   'background:#FEE2E2;color:#991B1B;',
    }
    def __init__(self, level, parent=None):
        super().__init__(level, parent)
        s = self._styles.get(level, self._styles['Low'])
        self.setStyleSheet(f"{s} border-radius:20px; padding:2px 10px;"
                            f" font-size:11px; font-weight:700;")
        self.setAlignment(Qt.AlignCenter)


class CareerCard(QWidget):
    """Premium career recommendation card."""
    def __init__(self, career_data, parent=None):
        super().__init__(parent)
        c = career_data
        color = c.get('color', '#4F6EF7')
        match = c.get('match', 0)
        self.setStyleSheet(f"""
            QWidget {{
                background:#FFFFFF; border:1px solid #E5E7EB;
                border-radius:14px;
            }}
            QWidget:hover {{ border-color:{color}; }}
        """)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self.setMinimumHeight(180)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 18, 20, 18)
        layout.setSpacing(10)

        # Header row
        top = QHBoxLayout()
        icon_lbl = QLabel(c.get('icon', '💼'))
        icon_lbl.setFont(QFont("Segoe UI Emoji", 22))
        top.addWidget(icon_lbl)

        title_col = QVBoxLayout()
        title_col.setSpacing(2)
        t = QLabel(c['title'])
        t.setStyleSheet(f"font-size:15px;font-weight:700;color:#111827;")
        sal = QLabel(c.get('salary', ''))
        sal.setStyleSheet("font-size:11px;color:#9CA3AF;")
        title_col.addWidget(t)
        title_col.addWidget(sal)
        top.addLayout(title_col)
        top.addStretch()

        # Match badge
        match_lbl = QLabel(f"{match}%")
        mc = '#10B981' if match >= 70 else ('#F59E0B' if match >= 40 else '#EF4444')
        match_lbl.setStyleSheet(f"""
            background:{mc}1A; color:{mc}; font-size:18px; font-weight:800;
            border-radius:8px; padding:4px 10px;
        """)
        top.addWidget(match_lbl)
        layout.addLayout(top)

        # Description
        desc = QLabel(c.get('desc', ''))
        desc.setStyleSheet("font-size:12px;color:#6B7280;")
        desc.setWordWrap(True)
        layout.addWidget(desc)

        # Match bar
        bar_row = QHBoxLayout()
        bar_lbl = QLabel("Match")
        bar_lbl.setStyleSheet("font-size:11px;color:#9CA3AF;font-weight:600;")
        bar = QProgressBar()
        bar.setRange(0, 100)
        bar.setValue(match)
        bar.setFixedHeight(6)
        bar.setStyleSheet(f"""
            QProgressBar {{ background:#F3F4F6; border:none; border-radius:3px; }}
            QProgressBar::chunk {{ background:{color}; border-radius:3px; }}
        """)
        bar_row.addWidget(bar_lbl)
        bar_row.addWidget(bar, 1)
        layout.addLayout(bar_row)

        # Demand badge
        demand_lbl = QLabel(f"Demand: {c.get('demand','')}")
        d_color = '#10B981' if 'Very' in c.get('demand','') else '#F59E0B'
        demand_lbl.setStyleSheet(f"font-size:11px;color:{d_color};font-weight:600;")
        layout.addWidget(demand_lbl)


class InsightRow(QWidget):
    """Single insight/suggestion row."""
    def __init__(self, icon, text, color='#4F6EF7', parent=None):
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)
        ico = QLabel(icon)
        ico.setFont(QFont("Segoe UI Emoji", 16))
        ico.setFixedWidth(28)
        layout.addWidget(ico)
        msg = QLabel(text)
        msg.setStyleSheet(f"font-size:12px;color:#374151;")
        msg.setWordWrap(True)
        layout.addWidget(msg, 1)
        self.setStyleSheet(f"""
            QWidget {{ background:{color}12; border-radius:8px;
                       border-left:3px solid {color}; padding:6px 10px; }}
        """)
