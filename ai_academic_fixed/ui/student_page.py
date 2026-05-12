# ui/student_page.py — Student Management with Add/Edit/Delete + Search

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QLineEdit, QPushButton, QTableWidget, QTableWidgetItem,
                              QDialog, QFormLayout, QDoubleSpinBox, QSpinBox,
                              QHeaderView, QMessageBox, QScrollArea, QFrame,
                              QComboBox, QAbstractItemView)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont
from ui.components.cards import RiskBadge
from database.db_manager import DatabaseManager


class StudentDialog(QDialog):
    """Add / Edit student dialog."""
    def __init__(self, parent=None, data=None):
        super().__init__(parent)
        self.setWindowTitle("Add Student" if data is None else "Edit Student")
        self.setMinimumWidth(420)
        self.setStyleSheet("""
            QDialog { background:#FFFFFF; }
            QLabel { font-size:13px; color:#374151; }
            QLineEdit, QDoubleSpinBox, QSpinBox, QComboBox {
                background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px;
                padding:8px 12px; font-size:13px; color:#111827; min-height:16px;
            }
            QLineEdit:focus, QDoubleSpinBox:focus, QSpinBox:focus {
                border-color:#4F6EF7;
            }
        """)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)

        title = QLabel("Student" if data is None else "Edit Student")
        title.setStyleSheet("font-size:17px;font-weight:700;color:#111827;")
        layout.addWidget(title)

        form = QFormLayout()
        form.setSpacing(10)
        form.setLabelAlignment(Qt.AlignRight)

        def field(val=''):
            w = QLineEdit()
            w.setText(str(val))
            return w

        def spin(min_v, max_v, dec, val):
            w = QDoubleSpinBox() if dec > 0 else QSpinBox()
            w.setRange(min_v, max_v)
            if dec > 0: w.setDecimals(dec)
            w.setValue(val)
            return w

        self.f_name    = field(data['name']         if data else '')
        self.f_email   = field(data['email']        if data else '')
        self.f_attend  = spin(0, 100, 1, data['attendance']  if data else 80.0)
        self.f_quiz    = spin(0, 100, 1, data['quiz']        if data else 75.0)
        self.f_assign  = spin(0, 100, 1, data['assignment']  if data else 75.0)
        self.f_mid     = spin(0, 100, 1, data['midterm']     if data else 70.0)
        self.f_hrs     = spin(0, 12,  1, data['study_hours'] if data else 4.0)
        self.f_gpa     = spin(0, 4,   2, data['gpa']         if data else 3.0)
        self.f_skills  = field(data['skills']       if data else '')
        self.f_int     = field(data['interest']     if data else '')

        form.addRow("Full Name *",    self.f_name)
        form.addRow("Email",          self.f_email)
        form.addRow("Attendance %",   self.f_attend)
        form.addRow("Quiz Score",     self.f_quiz)
        form.addRow("Assignment",     self.f_assign)
        form.addRow("Midterm",        self.f_mid)
        form.addRow("Study Hrs/day",  self.f_hrs)
        form.addRow("Current GPA",    self.f_gpa)
        form.addRow("Skills (;sep)",  self.f_skills)
        form.addRow("Interest",       self.f_int)
        layout.addLayout(form)

        btns = QHBoxLayout()
        cancel = QPushButton("Cancel")
        cancel.setStyleSheet("background:#F3F4F6;color:#374151;border:none;border-radius:8px;"
                              "padding:10px 24px;font-size:13px;")
        cancel.clicked.connect(self.reject)
        save = QPushButton("Save Student")
        save.setStyleSheet("background:#4F6EF7;color:white;border:none;border-radius:8px;"
                            "padding:10px 24px;font-size:13px;font-weight:700;")
        save.clicked.connect(self.accept)
        save.setCursor(Qt.PointingHandCursor)
        cancel.setCursor(Qt.PointingHandCursor)
        btns.addWidget(cancel)
        btns.addWidget(save)
        layout.addLayout(btns)

    def get_data(self):
        return {
            'name':        self.f_name.text().strip(),
            'email':       self.f_email.text().strip(),
            'attendance':  self.f_attend.value(),
            'quiz':        self.f_quiz.value(),
            'assignment':  self.f_assign.value(),
            'midterm':     self.f_mid.value(),
            'study_hours': self.f_hrs.value(),
            'gpa':         self.f_gpa.value(),
            'skills':      self.f_skills.text().strip(),
            'interest':    self.f_int.text().strip(),
        }


class StudentPage(QWidget):
    student_selected = pyqtSignal(dict)

    def __init__(self, db: DatabaseManager):
        super().__init__()
        self.db = db
        self.setStyleSheet("background:#F8F9FC;")
        self._build()
        self.load_students()

    def _build(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 24, 28, 28)
        layout.setSpacing(16)

        # ── Toolbar ───────────────────────────────────
        toolbar = QHBoxLayout()
        self.search = QLineEdit()
        self.search.setPlaceholderText("🔍  Search by name, skill, or interest...")
        self.search.setObjectName("search_box")
        self.search.setFixedHeight(38)
        self.search.setStyleSheet("""
            QLineEdit { background:#FFFFFF; border:1px solid #E5E7EB; border-radius:8px;
                        padding:0 14px; font-size:13px; color:#374151; }
            QLineEdit:focus { border-color:#4F6EF7; }
        """)
        self.search.textChanged.connect(self._on_search)

        btn_add = QPushButton("＋  Add Student")
        btn_add.setFixedHeight(38)
        btn_add.setCursor(Qt.PointingHandCursor)
        btn_add.setStyleSheet("background:#4F6EF7;color:white;border:none;border-radius:8px;"
                               "padding:0 20px;font-size:13px;font-weight:700;")
        btn_add.clicked.connect(self._add_student)

        self.count_lbl = QLabel()
        self.count_lbl.setStyleSheet("font-size:13px;color:#9CA3AF;")

        toolbar.addWidget(self.search, 1)
        toolbar.addWidget(self.count_lbl)
        toolbar.addWidget(btn_add)
        layout.addLayout(toolbar)

        # ── Table card ────────────────────────────────
        card = QWidget()
        card.setStyleSheet("background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;")
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(0, 0, 0, 0)

        self.table = QTableWidget()
        self.table.setAlternatingRowColors(True)
        self.table.setSelectionBehavior(QAbstractItemView.SelectRows)
        self.table.setEditTriggers(QAbstractItemView.NoEditTriggers)
        self.table.verticalHeader().setVisible(False)
        self.table.setShowGrid(False)
        self.table.setFrameShape(QFrame.NoFrame)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setStyleSheet("""
            QTableWidget { background:transparent; border:none; font-size:13px;
                           alternate-background-color:#FAFAFA; gridline-color:#F3F4F6; }
            QTableWidget::item { padding:10px 14px; border-bottom:1px solid #F3F4F6; color:#374151; }
            QTableWidget::item:selected { background:#EEF1FF; color:#4F6EF7; }
            QHeaderView::section { background:#F9FAFB; color:#9CA3AF; font-size:11px;
                font-weight:700; padding:10px 14px; border:none;
                border-bottom:1px solid #E5E7EB; letter-spacing:0.5px; }
        """)

        cols = ['#', 'Name', 'GPA', 'Attendance', 'Quiz', 'Midterm', 'Interest', 'Risk', 'Actions']
        self.table.setColumnCount(len(cols))
        self.table.setHorizontalHeaderLabels(cols)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        for i in [0, 2, 3, 4, 5, 7]: self.table.setColumnWidth(i, 75)
        self.table.setColumnWidth(6, 100)
        self.table.setColumnWidth(8, 110)
        self.table.setRowHeight(0, 44)
        card_layout.addWidget(self.table)
        layout.addWidget(card, 1)

    def load_students(self, rows=None):
        students = rows if rows is not None else self.db.get_all_students()
        self.table.setRowCount(len(students))
        self.count_lbl.setText(f"{len(students)} students")
        for row_idx, s in enumerate(students):
            self.table.setRowHeight(row_idx, 46)
            vals = [
                str(row_idx + 1),
                s['name'],
                f"{s['gpa']:.2f}",
                f"{s['attendance']:.0f}%",
                f"{s['quiz']:.0f}",
                f"{s['midterm']:.0f}",
                s['interest'] or '—',
            ]
            for col, val in enumerate(vals):
                item = QTableWidgetItem(val)
                item.setData(Qt.UserRole, dict(s))
                if col == 0:
                    item.setForeground(Qt.gray)
                    item.setFont(QFont('Segoe UI', 10))
                if col == 2:
                    color = '#10B981' if s['gpa'] >= 3.5 else ('#F59E0B' if s['gpa'] >= 2.5 else '#EF4444')
                    item.setForeground(Qt.green)
                self.table.setItem(row_idx, col, item)

            # Risk badge
            risk_w = QWidget()
            risk_layout = QHBoxLayout(risk_w)
            risk_layout.setContentsMargins(8, 4, 8, 4)
            risk_layout.addWidget(RiskBadge(s['risk_level']))
            self.table.setCellWidget(row_idx, 7, risk_w)

            # Action buttons
            act_w = QWidget()
            act_layout = QHBoxLayout(act_w)
            act_layout.setContentsMargins(6, 4, 6, 4)
            act_layout.setSpacing(4)
            btn_e = QPushButton("Edit")
            btn_e.setFixedHeight(28)
            btn_e.setCursor(Qt.PointingHandCursor)
            btn_e.setStyleSheet("background:#EEF1FF;color:#4F6EF7;border:none;border-radius:6px;"
                                 "padding:0 10px;font-size:11px;font-weight:600;")
            btn_d = QPushButton("Del")
            btn_d.setFixedHeight(28)
            btn_d.setCursor(Qt.PointingHandCursor)
            btn_d.setStyleSheet("background:#FEE2E2;color:#DC2626;border:none;border-radius:6px;"
                                 "padding:0 10px;font-size:11px;font-weight:600;")
            sid = s['id']
            btn_e.clicked.connect(lambda _, sid=sid: self._edit_student(sid))
            btn_d.clicked.connect(lambda _, sid=sid: self._delete_student(sid))
            act_layout.addWidget(btn_e)
            act_layout.addWidget(btn_d)
            self.table.setCellWidget(row_idx, 8, act_w)

    def _on_search(self, text):
        if text.strip():
            results = self.db.search_students(text)
            self.load_students(results)
        else:
            self.load_students()

    def _add_student(self):
        dlg = StudentDialog(self)
        if dlg.exec_() == StudentDialog.Accepted:
            data = dlg.get_data()
            if not data['name']:
                QMessageBox.warning(self, "Validation", "Name is required.")
                return
            self.db.add_student(**data)
            self.load_students()

    def _edit_student(self, sid):
        s = self.db.get_student(sid)
        if not s: return
        dlg = StudentDialog(self, dict(s))
        if dlg.exec_() == StudentDialog.Accepted:
            data = dlg.get_data()
            self.db.update_student(sid, **data)
            self.load_students()

    def _delete_student(self, sid):
        reply = QMessageBox.question(self, "Delete", "Delete this student?",
                                     QMessageBox.Yes | QMessageBox.No)
        if reply == QMessageBox.Yes:
            self.db.delete_student(sid)
            self.load_students()
