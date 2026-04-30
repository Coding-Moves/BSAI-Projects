# database/db_manager.py — Full SQLite database manager

import sqlite3, os, json
from config import DB_PATH

class DatabaseManager:
    def __init__(self):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()
        self._seed_if_empty()

    def _create_tables(self):
        cur = self.conn.cursor()
        cur.executescript("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            semester INTEGER DEFAULT 1,
            attendance REAL DEFAULT 0,
            quiz REAL DEFAULT 0,
            assignment REAL DEFAULT 0,
            midterm REAL DEFAULT 0,
            study_hours REAL DEFAULT 0,
            gpa REAL DEFAULT 0,
            skills TEXT DEFAULT '',
            interest TEXT DEFAULT '',
            predicted_gpa REAL DEFAULT 0,
            risk_level TEXT DEFAULT 'Low',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            predicted_gpa REAL,
            confidence REAL,
            model_used TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id)
        );

        CREATE TABLE IF NOT EXISTS career_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            career TEXT,
            match_pct REAL,
            recommended_skills TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id)
        );
        """)
        self.conn.commit()

    def _seed_if_empty(self):
        if self.get_student_count() > 0:
            return
        import csv
        try:
            with open('datasets/student_data.csv') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.add_student(
                        name=row['name'],
                        attendance=float(row['attendance']),
                        quiz=float(row['quiz']),
                        assignment=float(row['assignment']),
                        midterm=float(row['midterm']),
                        study_hours=float(row['study_hours']),
                        gpa=float(row['gpa']),
                        skills=row.get('skills', ''),
                        interest=row.get('interest', ''),
                    )
        except Exception as e:
            print(f"Seed error: {e}")

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def add_student(self, name, attendance=0, quiz=0, assignment=0,
                    midterm=0, study_hours=0, gpa=0, skills='', interest='',
                    email='', semester=1):
        risk = 'High' if gpa < 2.5 else ('Medium' if gpa < 3.0 else 'Low')
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO students (name,email,semester,attendance,quiz,assignment,
            midterm,study_hours,gpa,skills,interest,risk_level)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """, (name, email, semester, attendance, quiz, assignment,
              midterm, study_hours, gpa, skills, interest, risk))
        self.conn.commit()
        return cur.lastrowid

    def get_all_students(self):
        return self.conn.execute("SELECT * FROM students ORDER BY name").fetchall()

    def get_student(self, student_id):
        return self.conn.execute("SELECT * FROM students WHERE id=?", (student_id,)).fetchone()

    def update_student(self, student_id, **kwargs):
        if 'gpa' in kwargs:
            kwargs['risk_level'] = 'High' if kwargs['gpa'] < 2.5 else ('Medium' if kwargs['gpa'] < 3.0 else 'Low')
        sets = ', '.join(f"{k}=?" for k in kwargs)
        vals = list(kwargs.values()) + [student_id]
        self.conn.execute(f"UPDATE students SET {sets} WHERE id=?", vals)
        self.conn.commit()

    def delete_student(self, student_id):
        self.conn.execute("DELETE FROM students WHERE id=?", (student_id,))
        self.conn.commit()

    def search_students(self, query):
        q = f"%{query}%"
        return self.conn.execute(
            "SELECT * FROM students WHERE name LIKE ? OR interest LIKE ? OR skills LIKE ?",
            (q, q, q)).fetchall()

    def get_student_count(self):
        return self.conn.execute("SELECT COUNT(*) FROM students").fetchone()[0]

    def save_prediction(self, student_id, predicted_gpa, confidence, model_used):
        self.conn.execute("""
            INSERT INTO predictions (student_id,predicted_gpa,confidence,model_used)
            VALUES (?,?,?,?)
        """, (student_id, predicted_gpa, confidence, model_used))
        self.conn.execute("UPDATE students SET predicted_gpa=? WHERE id=?",
                          (predicted_gpa, student_id))
        self.conn.commit()

    def save_career_rec(self, student_id, career, match_pct, recommended_skills):
        self.conn.execute("""
            INSERT INTO career_recommendations (student_id,career,match_pct,recommended_skills)
            VALUES (?,?,?,?)
        """, (student_id, career, match_pct, json.dumps(recommended_skills)))
        self.conn.commit()

    # ── Analytics queries ─────────────────────────────────────────────────────

    def get_stats(self):
        row = self.conn.execute("""
            SELECT COUNT(*) as total,
                   AVG(gpa) as avg_gpa,
                   AVG(attendance) as avg_att,
                   SUM(CASE WHEN risk_level='High' THEN 1 ELSE 0 END) as at_risk,
                   SUM(CASE WHEN gpa>=3.5 THEN 1 ELSE 0 END) as top_performers
            FROM students
        """).fetchone()
        return dict(row)

    def get_gpa_distribution(self):
        rows = self.conn.execute("SELECT gpa FROM students ORDER BY gpa").fetchall()
        return [r['gpa'] for r in rows]

    def get_subject_averages(self):
        row = self.conn.execute("""
            SELECT AVG(quiz) as quiz, AVG(assignment) as assignment,
                   AVG(midterm) as midterm, AVG(attendance) as attendance
            FROM students
        """).fetchone()
        return dict(row)

    def get_top_students(self, n=5):
        return self.conn.execute(
            "SELECT * FROM students ORDER BY gpa DESC LIMIT ?", (n,)).fetchall()

    def get_risk_students(self):
        return self.conn.execute(
            "SELECT * FROM students WHERE risk_level='High' ORDER BY gpa").fetchall()
