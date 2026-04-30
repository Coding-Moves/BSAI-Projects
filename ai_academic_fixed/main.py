# main.py — Entry point for EduAI Analytics Platform

import sys
import os

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PyQt5.QtWidgets import QApplication, QSplashScreen
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QPixmap, QColor, QFont, QPainter

# ── Pre-train model before GUI starts ────────────────────────────────────────
def ensure_model():
    try:
        from models.training import train_model
        from config import MODEL_PATH
        if not os.path.exists(MODEL_PATH):
            print("Training AI model...")
            result = train_model()
            print(f"Model trained: R²={result['rf_r2']}%")
    except Exception as e:
        print(f"Model training warning: {e}")

ensure_model()

# ── Launch App ────────────────────────────────────────────────────────────────
from ui.main_window import MainWindow

app = QApplication(sys.argv)
app.setApplicationName("EduAI Analytics")

# High DPI support
try:
    app.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    app.setAttribute(Qt.AA_UseHighDpiPixmaps, True)
except:
    pass

# Splash screen
splash_pix = QPixmap(480, 280)
splash_pix.fill(QColor("#FFFFFF"))
painter = QPainter(splash_pix)
painter.setFont(QFont("Segoe UI", 28, QFont.Bold))
painter.setPen(QColor("#4F6EF7"))
painter.drawText(splash_pix.rect(), Qt.AlignCenter, "🎓  EduAI Analytics")
painter.setFont(QFont("Segoe UI", 12))
painter.setPen(QColor("#9CA3AF"))
painter.drawText(0, 200, 480, 40, Qt.AlignCenter, "AI Academic Performance Platform  •  BS AI Exhibition")
painter.end()

splash = QSplashScreen(splash_pix)
splash.show()
app.processEvents()

window = MainWindow()

def show_main():
    splash.finish(window)
    window.show()

QTimer.singleShot(1500, show_main)
sys.exit(app.exec_())
