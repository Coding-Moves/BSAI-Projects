# ui/chatbot_page.py — Premium AI Chatbot Interface

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QTextEdit, QLineEdit, QPushButton, QScrollArea,
                              QFrame, QSizePolicy)
from PyQt5.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt5.QtGui import QFont, QTextCursor
import time
from chatbot.chatbot_engine import Chatbot


class TypingIndicator(QWidget):
    def __init__(self):
        super().__init__()
        layout = QHBoxLayout(self)
        layout.setContentsMargins(12, 8, 12, 8)
        lbl = QLabel("AI is thinking...")
        lbl.setStyleSheet("color:#9CA3AF;font-size:12px;font-style:italic;")
        layout.addWidget(lbl)
        self.setStyleSheet("background:#F3F4F6;border-radius:12px;")
        self.setFixedHeight(36)


class MessageBubble(QWidget):
    def __init__(self, text, is_user=True):
        super().__init__()
        outer = QHBoxLayout(self)
        outer.setContentsMargins(0, 3, 0, 3)
        outer.setSpacing(8)

        bubble = QLabel(text)
        bubble.setWordWrap(True)
        bubble.setTextInteractionFlags(Qt.TextSelectableByMouse)
        bubble.setMaximumWidth(520)

        if is_user:
            bubble.setStyleSheet("""
                background:#4F6EF7; color:white; border-radius:16px 16px 4px 16px;
                padding:10px 16px; font-size:13px; line-height:1.5;
            """)
            avatar = QLabel("👤")
            avatar.setFont(QFont("Segoe UI Emoji", 16))
            avatar.setFixedWidth(32)
            outer.addStretch()
            outer.addWidget(bubble)
            outer.addWidget(avatar)
        else:
            bubble.setStyleSheet("""
                background:#FFFFFF; color:#111827; border:1px solid #E5E7EB;
                border-radius:4px 16px 16px 16px;
                padding:10px 16px; font-size:13px; line-height:1.5;
            """)
            avatar = QLabel("🤖")
            avatar.setFont(QFont("Segoe UI Emoji", 16))
            avatar.setFixedWidth(32)
            outer.addWidget(avatar)
            outer.addWidget(bubble)
            outer.addStretch()


class ChatbotPage(QWidget):
    def __init__(self):
        super().__init__()
        self.bot = Chatbot()
        self.setStyleSheet("background:#F8F9FC;")
        self._build()
        self._send_welcome()

    def _build(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 24, 28, 24)
        layout.setSpacing(0)

        # ── Chat area card ────────────────────────────
        chat_card = QWidget()
        chat_card.setStyleSheet("background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;")
        chat_card_layout = QVBoxLayout(chat_card)
        chat_card_layout.setContentsMargins(0, 0, 0, 0)
        chat_card_layout.setSpacing(0)

        # Header
        header = QWidget()
        header.setFixedHeight(56)
        header.setStyleSheet("background:#FFFFFF;border-bottom:1px solid #F3F4F6;border-radius:12px 12px 0 0;")
        hl = QHBoxLayout(header)
        hl.setContentsMargins(20, 0, 20, 0)
        bot_icon = QLabel("🤖")
        bot_icon.setFont(QFont("Segoe UI Emoji", 18))
        title_col = QVBoxLayout()
        title_col.setSpacing(0)
        bot_name = QLabel("EduAI Assistant")
        bot_name.setStyleSheet("font-size:14px;font-weight:700;color:#111827;")
        bot_status = QLabel("● Online  •  Academic Intelligence")
        bot_status.setStyleSheet("font-size:11px;color:#10B981;")
        title_col.addWidget(bot_name)
        title_col.addWidget(bot_status)
        clear_btn = QPushButton("Clear Chat")
        clear_btn.setCursor(Qt.PointingHandCursor)
        clear_btn.setStyleSheet("background:#F3F4F6;color:#6B7280;border:none;border-radius:6px;"
                                 "padding:6px 14px;font-size:11px;font-weight:600;")
        clear_btn.clicked.connect(self._clear_chat)
        hl.addWidget(bot_icon)
        hl.addLayout(title_col)
        hl.addStretch()
        hl.addWidget(clear_btn)
        chat_card_layout.addWidget(header)

        # Scroll area for messages
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(0)
        self.scroll.setStyleSheet("background:#F9FAFB;")

        self.msg_container = QWidget()
        self.msg_container.setStyleSheet("background:#F9FAFB;")
        self.msg_layout = QVBoxLayout(self.msg_container)
        self.msg_layout.setContentsMargins(20, 16, 20, 16)
        self.msg_layout.setSpacing(4)
        self.msg_layout.addStretch()

        self.scroll.setWidget(self.msg_container)
        chat_card_layout.addWidget(self.scroll, 1)

        # Input row
        input_bar = QWidget()
        input_bar.setFixedHeight(64)
        input_bar.setStyleSheet("background:#FFFFFF;border-top:1px solid #F3F4F6;"
                                 "border-radius:0 0 12px 12px;")
        il = QHBoxLayout(input_bar)
        il.setContentsMargins(16, 12, 16, 12)
        il.setSpacing(10)

        self.input = QLineEdit()
        self.input.setPlaceholderText("Ask me about GPA, careers, study tips, or skills...")
        self.input.setFixedHeight(40)
        self.input.setStyleSheet("""
            QLineEdit { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:20px;
                        padding:0 18px; font-size:13px; color:#111827; }
            QLineEdit:focus { border-color:#4F6EF7; background:#FFFFFF; }
        """)
        self.input.returnPressed.connect(self._send)

        send_btn = QPushButton("Send  ➤")
        send_btn.setFixedHeight(40)
        send_btn.setFixedWidth(100)
        send_btn.setCursor(Qt.PointingHandCursor)
        send_btn.setStyleSheet("background:#4F6EF7;color:white;border:none;border-radius:20px;"
                                "padding:0 16px;font-size:13px;font-weight:700;")
        send_btn.clicked.connect(self._send)
        il.addWidget(self.input, 1)
        il.addWidget(send_btn)
        chat_card_layout.addWidget(input_bar)
        layout.addWidget(chat_card, 1)

        # ── Quick prompts ─────────────────────────────
        quick_lbl = QLabel("Quick questions:")
        quick_lbl.setStyleSheet("font-size:12px;color:#9CA3AF;margin-top:12px;")
        layout.addWidget(quick_lbl)

        prompts_row = QHBoxLayout()
        prompts_row.setSpacing(8)
        QUICK = [
            "How can I improve my GPA?",
            "Which career suits me best?",
            "What skills should I learn?",
            "How many hours should I study?",
            "What if my attendance is low?",
        ]
        for p in QUICK:
            btn = QPushButton(p)
            btn.setCursor(Qt.PointingHandCursor)
            btn.setStyleSheet("""
                QPushButton { background:#FFFFFF; color:#4F6EF7; border:1px solid #C7D2FE;
                    border-radius:20px; padding:6px 14px; font-size:11px; font-weight:600; }
                QPushButton:hover { background:#EEF1FF; }
            """)
            btn.clicked.connect(lambda _, t=p: self._quick_send(t))
            prompts_row.addWidget(btn)
        prompts_row.addStretch()
        layout.addLayout(prompts_row)

    def _send_welcome(self):
        welcome = ("👋  Hello! I'm your EduAI Academic Assistant.\n\n"
                   "I can help you with:\n"
                   "• 📈 GPA improvement strategies\n"
                   "• 🎯 Career path recommendations\n"
                   "• 📚 Study tips and planning\n"
                   "• 🧠 Skill recommendations\n\n"
                   "What would you like to know today?")
        self._add_message(welcome, is_user=False)

    def _add_message(self, text, is_user=True):
        bubble = MessageBubble(text, is_user)
        self.msg_layout.insertWidget(self.msg_layout.count() - 1, bubble)
        QTimer.singleShot(50, self._scroll_to_bottom)

    def _scroll_to_bottom(self):
        sb = self.scroll.verticalScrollBar()
        sb.setValue(sb.maximum())

    def _send(self):
        text = self.input.text().strip()
        if not text: return
        self.input.clear()
        self._add_message(text, is_user=True)
        QTimer.singleShot(400, lambda: self._bot_reply(text))

    def _quick_send(self, text):
        self.input.setText(text)
        self._send()

    def _bot_reply(self, text):
        reply = self.bot.respond(text)
        self._add_message(reply, is_user=False)

    def _clear_chat(self):
        while self.msg_layout.count() > 1:
            item = self.msg_layout.takeAt(0)
            if item.widget(): item.widget().deleteLater()
        self._send_welcome()
