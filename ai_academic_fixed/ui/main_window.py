# ui/main_window.py — Premium Main Window with Sidebar + Topbar

from PyQt5.QtWidgets import (QMainWindow, QWidget, QHBoxLayout, QVBoxLayout,
                              QLabel, QStackedWidget, QLineEdit, QPushButton,
                              QSizePolicy, QFrame)
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont, QIcon

from ui.components.sidebar import Sidebar
from ui.dashboard_page import DashboardPage
from ui.student_page import StudentPage
from ui.analytics_page import AnalyticsPage
from ui.career_page import CareerPage
from ui.skills_page import SkillsPage
from ui.planner_page import PlannerPage
from ui.chatbot_page import ChatbotPage
from database.db_manager import DatabaseManager
from assets.styles.theme import GLOBAL_STYLE

PAGE_META = [
    ("Dashboard",  "Overview of all academic metrics and AI insights"),
    ("Students",   "Manage student records — add, edit, search, delete"),
    ("Analytics",  "Deep performance analysis with AI GPA prediction"),
    ("Careers",    "Personalized career path recommendations"),
    ("Skills",     "Skill gap analysis and learning roadmaps"),
    ("Planner",    "AI-generated personalized weekly study plans"),
    ("AI Chatbot", "Intelligent academic assistant — ask anything"),
]


class TopBar(QWidget):
    def __init__(self):
        super().__init__()
        self.setObjectName("topbar")
        self.setFixedHeight(58)
        self.setStyleSheet("background:#FFFFFF;border-bottom:1px solid #E5E7EB;")
        layout = QHBoxLayout(self)
        layout.setContentsMargins(28, 0, 24, 0)
        layout.setSpacing(14)

        self.title_lbl = QLabel("Dashboard")
        self.title_lbl.setStyleSheet("font-size:18px;font-weight:600;color:#111827;")
        self.sub_lbl   = QLabel("Overview of all academic metrics")
        self.sub_lbl.setStyleSheet("font-size:13px;color:#9CA3AF;line-height:1.5;")

        title_col = QVBoxLayout()
        title_col.setSpacing(0)
        title_col.addWidget(self.title_lbl)
        title_col.addWidget(self.sub_lbl)

        layout.addLayout(title_col)
        layout.addStretch()

        # Notification dot
        self.notif = QLabel("🔔")
        self.notif.setFont(QFont("Segoe UI Emoji", 15))
        self.notif.setCursor(Qt.PointingHandCursor)
        layout.addWidget(self.notif)

        # User chip
        user_chip = QWidget()
        user_chip.setStyleSheet("background:#EEF1FF;border-radius:20px;")
        ucl = QHBoxLayout(user_chip)
        ucl.setContentsMargins(10, 5, 14, 5)
        ucl.setSpacing(7)
        avatar = QLabel("🎓")
        avatar.setFont(QFont("Segoe UI Emoji", 14))
        name = QLabel("BS AI Student")
        name.setStyleSheet("font-size:13px;font-weight:500;color:#4F6EF7;")
        ucl.addWidget(avatar)
        ucl.addWidget(name)
        layout.addWidget(user_chip)

    def update(self, idx):
        title, sub = PAGE_META[idx]
        self.title_lbl.setText(title)
        self.sub_lbl.setText(sub)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("AcadAI Analytics Platform")
        self.resize(1340, 840)
        self.setMinimumSize(1100, 700)
        self.setStyleSheet(GLOBAL_STYLE)

        # Database
        self.db = DatabaseManager()

        # Central widget
        central = QWidget()
        central.setStyleSheet("background:#F8F9FC;")
        self.setCentralWidget(central)
        root = QHBoxLayout(central)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Sidebar
        self.sidebar = Sidebar()
        self.sidebar.page_changed.connect(self._switch_page)
        root.addWidget(self.sidebar)

        # Right side: topbar + pages
        right = QVBoxLayout()
        right.setContentsMargins(0, 0, 0, 0)
        right.setSpacing(0)

        self.topbar = TopBar()
        right.addWidget(self.topbar)

        # Pages stack
        self.stack = QStackedWidget()
        self.stack.setStyleSheet("background:#F8F9FC;")

        self.dash_page    = DashboardPage(self.db)
        self.student_page = StudentPage(self.db)
        self.analytics    = AnalyticsPage(self.db)
        self.career_page  = CareerPage(self.db)
        self.skills_page  = SkillsPage()
        self.planner_page = PlannerPage()
        self.chatbot_page = ChatbotPage()

        for page in [self.dash_page, self.student_page, self.analytics,
                     self.career_page, self.skills_page, self.planner_page,
                     self.chatbot_page]:
            self.stack.addWidget(page)

        right.addWidget(self.stack, 1)
        right_widget = QWidget()
        right_widget.setLayout(right)
        root.addWidget(right_widget, 1)

    def _switch_page(self, idx):
        self.stack.setCurrentIndex(idx)
        self.topbar.update(idx)
        # Refresh dashboard when returning to it
        if idx == 0:
            self.dash_page.refresh()
        if idx == 1:
            self.student_page.load_students()
