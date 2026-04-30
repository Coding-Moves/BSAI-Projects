# config.py — Central configuration for AI Academic System

APP_NAME = "EduAI Analytics"
APP_VERSION = "2.0"
DB_PATH = "database/academic.db"
MODEL_PATH = "models/gpa_model.pkl"
DATASET_PATH = "datasets/student_data.csv"
EXPORT_DIR = "exports/"

# ── Color Palette (Light Professional SaaS) ──────────────────────────────────
COLORS = {
    "bg_main":       "#F8F9FC",
    "bg_sidebar":    "#FFFFFF",
    "bg_card":       "#FFFFFF",
    "bg_hover":      "#F1F4FF",
    "accent":        "#4F6EF7",
    "accent_light":  "#EEF1FF",
    "accent2":       "#7C3AED",
    "success":       "#10B981",
    "success_light": "#D1FAE5",
    "warning":       "#F59E0B",
    "warning_light": "#FEF3C7",
    "danger":        "#EF4444",
    "danger_light":  "#FEE2E2",
    "text_primary":  "#111827",
    "text_secondary":"#6B7280",
    "text_muted":    "#9CA3AF",
    "border":        "#E5E7EB",
    "border_light":  "#F3F4F6",
    "sidebar_active":"#EEF1FF",
    "sidebar_text":  "#374151",
    "shadow":        "rgba(0,0,0,0.06)",
    "white":         "#FFFFFF",
    "chart_blue":    "#4F6EF7",
    "chart_purple":  "#7C3AED",
    "chart_green":   "#10B981",
    "chart_orange":  "#F59E0B",
    "chart_red":     "#EF4444",
}

C = COLORS  # shorthand

# ── Career Data ───────────────────────────────────────────────────────────────
CAREERS = [
    {
        "title": "AI / ML Engineer",
        "icon": "🤖",
        "color": "#4F6EF7",
        "min_gpa": 3.2,
        "skills": ["Python", "TensorFlow", "Scikit-learn", "Math", "Deep Learning"],
        "desc": "Design and build machine learning models and AI systems at scale.",
        "salary": "PKR 150K–300K/month",
        "demand": "Very High",
    },
    {
        "title": "Data Scientist",
        "icon": "📊",
        "color": "#7C3AED",
        "min_gpa": 3.0,
        "skills": ["Python", "R", "SQL", "Statistics", "Visualization"],
        "desc": "Extract insights from large datasets to drive business decisions.",
        "salary": "PKR 120K–250K/month",
        "demand": "High",
    },
    {
        "title": "Cloud Engineer",
        "icon": "☁️",
        "color": "#0EA5E9",
        "min_gpa": 2.8,
        "skills": ["AWS", "Docker", "Kubernetes", "Linux", "Terraform"],
        "desc": "Architect and manage scalable cloud infrastructure and DevOps pipelines.",
        "salary": "PKR 130K–280K/month",
        "demand": "Very High",
    },
    {
        "title": "Cybersecurity Analyst",
        "icon": "🔐",
        "color": "#EF4444",
        "min_gpa": 2.7,
        "skills": ["Networking", "Linux", "Python", "Ethical Hacking", "SIEM"],
        "desc": "Protect systems and networks from cyber threats and vulnerabilities.",
        "salary": "PKR 100K–220K/month",
        "demand": "High",
    },
    {
        "title": "Software Engineer",
        "icon": "💻",
        "color": "#10B981",
        "min_gpa": 2.5,
        "skills": ["Java", "Python", "Algorithms", "Git", "System Design"],
        "desc": "Build robust, scalable software products and backend systems.",
        "salary": "PKR 80K–200K/month",
        "demand": "Very High",
    },
    {
        "title": "Data Analyst",
        "icon": "📈",
        "color": "#F59E0B",
        "min_gpa": 2.4,
        "skills": ["SQL", "Excel", "PowerBI", "Tableau", "Statistics"],
        "desc": "Analyze data trends and create dashboards to support decisions.",
        "salary": "PKR 60K–140K/month",
        "demand": "Moderate",
    },
]

SKILLS_DB = {
    "AI / ML Engineer":         ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Mathematics", "Deep Learning", "NLP", "Computer Vision"],
    "Data Scientist":           ["Python", "R", "SQL", "Pandas", "NumPy", "Statistics", "Seaborn", "Jupyter"],
    "Cloud Engineer":           ["AWS", "GCP", "Docker", "Kubernetes", "Linux", "Terraform", "CI/CD", "Networking"],
    "Cybersecurity Analyst":    ["Networking", "Linux", "Python", "Wireshark", "Kali Linux", "SIEM", "Penetration Testing"],
    "Software Engineer":        ["Python", "Java", "C++", "Git", "Algorithms", "REST APIs", "SQL", "System Design"],
    "Data Analyst":             ["SQL", "Excel", "PowerBI", "Tableau", "Python", "Statistics", "Data Cleaning"],
}

CHATBOT_RESPONSES = {
    "gpa":        ["Focus on weaker subjects first. Consistent daily study (4–6 hrs) dramatically improves GPA.", "Attend all classes, complete assignments on time, and review past papers before exams."],
    "career":     ["Your strongest career paths depend on GPA + skills. Use the Career tab to see your match %.", "AI, Data Science, and Cloud are top-paying fields in Pakistan right now."],
    "study":      ["Break your study sessions: 50 min study + 10 min break (Pomodoro technique).", "Prioritize subjects with the most weight. Use the Study Planner for a personalized schedule."],
    "skill":      ["Python and SQL are essential for almost every tech career. Start there.", "After Python, learn a specialization: ML for AI, Docker for Cloud, or Networks for Cybersecurity."],
    "improve":    ["Attend all lectures, take notes actively, and attempt past exams under timed conditions.", "Form study groups and teach concepts to others — the best way to solidify understanding."],
    "weak":       ["Identify weak subjects from the Analytics tab. Spend 30 extra minutes daily on each weak area.", "Seek help early — don't wait until exams. Use online resources like YouTube, Coursera, and Khan Academy."],
    "assignment": ["Never skip assignments — they contribute significantly to your semester grade.", "Start assignments early and use office hours when stuck."],
    "attendance": ["Each missed class is a lost opportunity. Aim for 90%+ attendance in every subject.", "Low attendance correlates strongly with lower GPA. Prioritize showing up."],
    "default":    ["I'm your AI academic assistant. Ask me about GPA, careers, study tips, or skill recommendations.", "Try asking: 'How to improve GPA?', 'Best career for me?', or 'What skills should I learn?'"],
}
