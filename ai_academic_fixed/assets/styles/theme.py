# assets/styles/theme.py — Global PyQt5 Stylesheet (Premium SaaS Light Theme)

GLOBAL_STYLE = """
/* ── Global ─────────────────────────────────────── */
QWidget {
    font-family: 'Segoe UI', 'SF Pro Display', Arial, sans-serif;
    font-size: 13px;
    color: #111827;
    background-color: transparent;
}
QMainWindow, QDialog {
    background-color: #F8F9FC;
}
QScrollArea, QScrollArea > QWidget > QWidget {
    background-color: transparent;
    border: none;
     font-size: 14px;
QScrollBar:vertical {
    background: #F3F4F6;
    width: 6px;
    border-radius: 3px;
}
QScrollBar::handle:vertical {
    background: #D1D5DB;
    border-radius: 3px;
     font-size: 18px;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical { height: 0; }

/* ── Sidebar ─────────────────────────────────────── */
#sidebar {
    background-color: #FFFFFF;
    border-right: 1px solid #E5E7EB;
}
#sidebar_logo {
     font-size: 14px;
    font-weight: 700;
    color: #4F6EF7;
    padding: 24px 20px 8px 20px;
}
#sidebar_subtitle {
    font-size: 16px;
    color: #9CA3AF;
    padding: 0 20px 20px 20px;
    line-height: 1.5;
}
     font-size: 14px;
    background: transparent;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    text-align: left;
     font-size: 22px;
    color: #6B7280;
    margin: 1px 8px;
}
#nav_btn:hover {
     font-size: 16px;
    color: #111827;
}
#nav_btn_active {
    background-color: #EEF1FF;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    text-align: left;
    font-size: 13px;
     font-size: 13px;
    color: #4F6EF7;
    margin: 1px 8px;
}
#sidebar_section {
    font-size: 14px;
    font-weight: 500;
    color: #9CA3AF;
    letter-spacing: 0.5px;
    padding: 16px 20px 8px 20px;
     font-size: 13px;
}

/* ── Topbar ──────────────────────────────────────── */
#topbar {
    background-color: #FFFFFF;
    border-bottom: 1px solid #E5E7EB;
    min-height: 56px;
    max-height: 56px;
     font-size: 13px;
#page_title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}
#page_subtitle {
    font-size: 15px;
    line-height: 1.5;
}
#search_box {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 13px;
    color: #374151;
    min-width: 220px;
}
#search_box:focus {
    border-color: #4F6EF7;
    background: #FFFFFF;
    outline: none;
}
#topbar_btn {
    background: #4F6EF7;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 600;
}
#topbar_btn:hover { background: #3B5BDB; }
#topbar_btn_ghost {
    background: transparent;
    color: #6B7280;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 7px 16px;
    font-size: 13px;
}
#topbar_btn_ghost:hover { background: #F9FAFB; color: #111827; }

/* ── Cards ───────────────────────────────────────── */
#stat_card {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 20px;
}
#stat_card:hover {
    border-color: #C7D2FE;
}
#stat_value {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
}
#stat_label {
    font-size: 15px;
    color: #6B7280;
    font-weight: 400;
    line-height: 1.5;
}
#stat_badge {
    font-size: 11px;
    font-weight: 600;
    border-radius: 20px;
    padding: 2px 8px;
}
#content_card {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
}
#card_header {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    padding: 16px 20px 12px 20px;
    border-bottom: 1px solid #F3F4F6;
}
#card_subheader {
    font-size: 15px;
    color: #9CA3AF;
    padding: 0 20px 16px 20px;
    line-height: 1.5;
}

/* ── Table ───────────────────────────────────────── */
QTableWidget {
    background: transparent;
    border: none;
    gridline-color: #F3F4F6;
    font-size: 13px;
    selection-background-color: #EEF1FF;
    alternate-background-color: #FAFAFA;
}
QTableWidget::item {
    padding: 12px 14px;
    border-bottom: 1px solid #F3F4F6;
    color: #374151;
    line-height: 1.5;
}
QTableWidget::item:selected {
    background-color: #EEF1FF;
    color: #4F6EF7;
}
QHeaderView::section {
    background: #F9FAFB;
    color: #6B7280;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 10px 14px;
    border: none;
    border-bottom: 1px solid #E5E7EB;
    text-transform: uppercase;
}

/* ── Inputs ──────────────────────────────────────── */
QLineEdit, QTextEdit, QComboBox, QSpinBox, QDoubleSpinBox {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 8px 12px;
    min-height: 32px;
    font-size: 13px;
    color: #111827;
}
QLineEdit:focus, QTextEdit:focus, QComboBox:focus,
QSpinBox:focus, QDoubleSpinBox:focus {
    border-color: #4F6EF7;
    outline: none;
}
QComboBox::drop-down { border: none; padding-right: 8px; }
QComboBox::down-arrow { width: 12px; height: 12px; }
QComboBox QAbstractItemView {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    selection-background-color: #EEF1FF;
    padding: 4px;
}
QSlider::groove:horizontal {
    background: #E5E7EB;
    height: 4px;
    border-radius: 2px;
}
QSlider::handle:horizontal {
    background: #4F6EF7;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    margin: -6px 0;
}
QSlider::sub-page:horizontal { background: #4F6EF7; border-radius: 2px; }

/* ── Buttons ─────────────────────────────────────── */
#btn_primary {
    background: #4F6EF7;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    min-height: 34px;
    font-size: 13px;
    font-weight: 500;
}
#btn_primary:hover { background: #3B5BDB; }
#btn_secondary {
    background: #F3F4F6;
    color: #374151;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    min-height: 34px;
    font-size: 13px;
    font-weight: 400;
}
#btn_secondary:hover { background: #E5E7EB; }
#btn_danger {
    background: #FEE2E2;
    color: #DC2626;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    min-height: 34px;
    font-size: 15px;
    font-weight: 500;
}
#btn_danger:hover { background: #FECACA; }
#btn_success {
    background: #D1FAE5;
    color: #065F46;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    min-height: 34px;
    font-size: 15px;
    font-weight: 500;
}
#btn_success:hover { background: #A7F3D0; }
#btn_icon {
    background: transparent;
    border: none;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 14px;
    color: #9CA3AF;
}
#btn_icon:hover { background: #F3F4F6; color: #374151; }

/* ── Labels / Badges ──────────────────────────────── */
#badge_blue   { background:#EEF1FF; color:#4F6EF7; border-radius:20px; padding:2px 10px; font-size:11px; font-weight:600; }
#badge_green  { background:#D1FAE5; color:#065F46; border-radius:20px; padding:2px 10px; font-size:11px; font-weight:600; }
#badge_yellow { background:#FEF3C7; color:#92400E; border-radius:20px; padding:2px 10px; font-size:11px; font-weight:600; }
#badge_red    { background:#FEE2E2; color:#991B1B; border-radius:20px; padding:2px 10px; font-size:11px; font-weight:600; }
#badge_purple { background:#EDE9FE; color:#5B21B6; border-radius:20px; padding:2px 10px; font-size:11px; font-weight:600; }

/* ── Progress bars ───────────────────────────────── */
QProgressBar {
    background: #F3F4F6;
    border: none;
    border-radius: 4px;
    height: 6px;
    text-align: center;
    font-size: 0px;
}
QProgressBar::chunk { border-radius: 4px; background: #4F6EF7; }

/* ── Tab bar ─────────────────────────────────────── */
QTabWidget::pane { border: 1px solid #E5E7EB; border-radius: 8px; background: #FFFFFF; }
QTabBar::tab {
    background: transparent;
    border: none;
    padding: 10px 20px;
    font-size: 13px;
    color: #6B7280;
    font-weight: 500;
}
QTabBar::tab:selected {
    color: #4F6EF7;
    font-weight: 700;
    border-bottom: 2px solid #4F6EF7;
}
QTabBar::tab:hover { color: #374151; }

/* ── Chatbot ─────────────────────────────────────── */
#chat_display {
    background: #F9FAFB;
    border: none;
    border-radius: 12px;
    padding: 12px;
    font-size: 13px;
}
#chat_input {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 24px;
    padding: 12px 20px;
    font-size: 13px;
}
#chat_input:focus { border-color: #4F6EF7; }
#chat_send {
    background: #4F6EF7;
    color: white;
    border: none;
    border-radius: 24px;
    padding: 12px 24px;
    font-weight: 600;
    font-size: 13px;
}
#chat_send:hover { background: #3B5BDB; }

/* ── Misc ────────────────────────────────────────── */
QLabel#section_title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    line-height: 1.6;
}
QSplitter::handle { background: #E5E7EB; width: 1px; }
"""
