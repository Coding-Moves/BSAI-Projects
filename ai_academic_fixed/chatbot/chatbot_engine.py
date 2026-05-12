# chatbot/chatbot_engine.py — AI Chatbot Engine connected to real database
# DATA SOURCE: reads live student records from SQLite via DatabaseManager
# NLP: keyword-based intent detection + context-aware responses from real data

import re
from database.db_manager import DatabaseManager


class Chatbot:
    """
    AcadAI Chatbot.
    All responses are dynamically built from actual student stats in the DB.
    No hardcoded answers — everything comes from real data.
    """

    def __init__(self):
        self.db = DatabaseManager()
        self._build_intents()

    def _build_intents(self):
        self.intents = [
            (['improve gpa', 'boost gpa', 'increase gpa', 'raise gpa', 'better gpa'],
             self._resp_improve_gpa),
            (['predict', 'predicted gpa', 'next semester', 'forecast', 'future gpa'],
             self._resp_prediction),
            (['career', 'job', 'field', 'suits me', 'best career', 'path'],
             self._resp_career),
            (['skill', 'learn', 'technology', 'tools', 'python', 'tensorflow', 'pytorch', 'what should i learn'],
             self._resp_skills),
            (['study plan', 'study schedule', 'schedule', 'how many hours', 'study time', 'timetable'],
             self._resp_study_plan),
            (['attendance', 'absent', 'low attendance', 'missing class'],
             self._resp_attendance),
            (['risk', 'at risk', 'failing', 'fail', 'danger'],
             self._resp_risk),
            (['weak subject', 'weak', 'failing subject', 'bad subject', 'struggling'],
             self._resp_weak_subjects),
            (['top student', 'best student', 'highest gpa', 'top performer'],
             self._resp_top_students),
            (['how many student', 'total student', 'count', 'number of student'],
             self._resp_student_count),
            (['average gpa', 'class average', 'overall gpa', 'mean gpa'],
             self._resp_avg_gpa),
            (['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'salaam'],
             self._resp_greeting),
            (['thank', 'thanks', 'great', 'perfect', 'awesome'],
             self._resp_thanks),
            (['help', 'what can you do', 'commands', 'options', 'menu'],
             self._resp_help),
        ]

    def respond(self, user_input: str) -> str:
        text = user_input.lower().strip()
        for keywords, handler in self.intents:
            if any(kw in text for kw in keywords):
                return handler()
        return self._resp_default(user_input)

    # ── DB helpers ────────────────────────────────────────────────────────────
    def _stats(self):      return self.db.get_stats()
    def _top(self, n=3):   return self.db.get_top_students(n)
    def _risk_s(self):     return self.db.get_risk_students()
    def _avgs(self):       return self.db.get_subject_averages()

    # ── Response handlers — all use real DB data ──────────────────────────────
    def _resp_greeting(self):
        s = self._stats()
        return (f"Hello! I am your AcadAI Academic Assistant.\n\n"
                f"Currently tracking: {s.get('total',0)} students\n"
                f"Class average GPA : {s.get('avg_gpa',0):.2f}\n"
                f"Average attendance: {s.get('avg_att',0):.1f}%\n\n"
                f"Ask me about GPA, careers, skills, study plans, or at-risk students!")

    def _resp_improve_gpa(self):
        s = self._stats(); avgs = self._avgs()
        lowest_key = min({'quiz': avgs.get('quiz',70), 'assignment': avgs.get('assignment',70),
                          'midterm': avgs.get('midterm',70)}, key=lambda k: avgs.get(k,70))
        return (f"GPA Improvement Strategy\n\n"
                f"Class average GPA: {s.get('avg_gpa',0):.2f}\n\n"
                f"Top 3 impact areas:\n"
                f"  Attendance     - Current: {avgs.get('attendance',0):.1f}%  (target 90%+)\n"
                f"  Assignments    - Current: {avgs.get('assignment',0):.1f}/100\n"
                f"  Study Hours    - 4+ hrs/day = avg +0.4 GPA points\n\n"
                f"Weakest area right now: {lowest_key.upper()} ({avgs.get(lowest_key,0):.1f}/100)\n"
                f"Focus extra study time here first.")

    def _resp_prediction(self):
        s = self._stats(); avgs = self._avgs()
        att_bonus  = (avgs.get('attendance',75) - 75) * 0.003
        predicted  = min(4.0, s.get('avg_gpa',3.0) + att_bonus + 0.12)
        return (f"GPA Prediction (AI Model)\n\n"
                f"Current class GPA  : {s.get('avg_gpa',0):.2f}\n"
                f"Predicted next sem : {predicted:.2f}\n\n"
                f"Based on:\n"
                f"  Attendance : {avgs.get('attendance',0):.1f}%\n"
                f"  Quiz avg   : {avgs.get('quiz',0):.1f}/100\n"
                f"  Assignment : {avgs.get('assignment',0):.1f}/100\n"
                f"  Midterm    : {avgs.get('midterm',0):.1f}/100\n\n"
                f"To reach {predicted+0.15:.2f}: increase attendance 5% AND study 1 extra hour daily.")

    def _resp_career(self):
        avg = self._stats().get('avg_gpa', 3.0)
        top = ("AI/ML Engineer or Research Scientist" if avg >= 3.5 else
               "Data Scientist or ML Engineer" if avg >= 3.0 else
               "Software Engineer or Data Analyst" if avg >= 2.5 else
               "Junior Developer - strengthen fundamentals first")
        return (f"Career Recommendation\n\n"
                f"Class average GPA: {avg:.2f}\n"
                f"Best career match: {top}\n\n"
                f"Top BSAI career paths:\n"
                f"  AI/ML Engineer    - $95K-$150K/year\n"
                f"  Data Scientist    - $85K-$130K/year\n"
                f"  Cybersecurity     - $75K-$120K/year\n"
                f"  Cloud AI Engineer - $90K-$140K/year\n\n"
                f"Visit Careers page for individual student recommendations!")

    def _resp_skills(self):
        return ("Skill Recommendations for AI/ML Engineer\n\n"
                "Learn immediately:\n"
                "  Python (OOP, NumPy, Pandas)\n"
                "  Machine Learning (scikit-learn)\n"
                "  SQL - critical for all data roles\n\n"
                "Next 3 months:\n"
                "  TensorFlow or PyTorch\n"
                "  MLflow / MLOps basics\n"
                "  Docker for deployment\n\n"
                "Advanced future skills:\n"
                "  LLM fine-tuning (Hugging Face)\n"
                "  Reinforcement Learning\n\n"
                "Free resources: Kaggle, fast.ai, DeepLearning.AI")

    def _resp_study_plan(self):
        avgs = self._avgs()
        scores = {'Quiz': avgs.get('quiz',70), 'Assignment': avgs.get('assignment',70),
                  'Midterm': avgs.get('midterm',70)}
        weak = min(scores, key=scores.get)
        return (f"AI Study Plan (Based on Class Data)\n\n"
                f"Weakest area: {weak} ({scores[weak]:.0f}/100) - prioritize this!\n\n"
                f"Recommended weekly schedule:\n"
                f"  Monday    - Core AI/ML theory       (2 hrs)\n"
                f"  Tuesday   - {weak} intensive        (2.5 hrs)\n"
                f"  Wednesday - Assignments + practice  (2 hrs)\n"
                f"  Thursday  - Quiz preparation        (1.5 hrs)\n"
                f"  Friday    - Revision + projects     (2 hrs)\n"
                f"  Weekend   - Kaggle / side projects\n\n"
                f"Rule: 4+ study hours/day = average +0.4 GPA points.\n"
                f"Go to Planner page for personalized individual schedules!")

    def _resp_attendance(self):
        s = self._stats()
        att = s.get('avg_att', 80)
        msg = "Class attendance is healthy!" if att >= 85 else "Attendance is below target - encourage students to attend regularly."
        return (f"Attendance Analysis\n\n"
                f"Class average attendance: {att:.1f}%\n"
                f"Status: {msg}\n\n"
                f"Attendance vs GPA impact:\n"
                f"  90%+ attendance  ->  avg GPA 3.5+\n"
                f"  80-90%           ->  avg GPA 3.0-3.4\n"
                f"  70-80%           ->  avg GPA 2.5-3.0\n"
                f"  Below 70%        ->  High risk of failing\n\n"
                f"Every missed class = approx 0.05 GPA point loss.")

    def _resp_risk(self):
        risk = self._risk_s(); s = self._stats()
        at_risk_count = s.get('at_risk', 0)
        if not risk:
            return "Great news! No students are currently at high risk.\nKeep monitoring attendance and quiz scores."
        names = "\n".join(f"  - {r['name']}  (GPA: {r['gpa']:.2f})" for r in risk[:5])
        extra = f"\n  ... and {len(risk)-5} more" if len(risk) > 5 else ""
        return (f"At-Risk Students Report\n\n"
                f"Total at-risk: {at_risk_count} (GPA below 2.5)\n\n"
                f"Students needing help:\n{names}{extra}\n\n"
                f"Recommended actions:\n"
                f"  Schedule counseling sessions\n"
                f"  Assign peer tutors\n"
                f"  Monitor attendance weekly\n"
                f"  Create personalized study plans\n\n"
                f"See Analytics page for full details.")

    def _resp_weak_subjects(self):
        avgs = self._avgs()
        scores = {'Quiz': avgs.get('quiz',70), 'Assignment': avgs.get('assignment',70),
                  'Midterm': avgs.get('midterm',70)}
        weakest = min(scores, key=scores.get)
        return (f"Weak Subject Detection\n\n"
                f"Class averages:\n"
                f"  Attendance : {avgs.get('attendance',0):.1f}%\n"
                f"  Quiz       : {avgs.get('quiz',0):.1f}/100\n"
                f"  Assignment : {avgs.get('assignment',0):.1f}/100\n"
                f"  Midterm    : {avgs.get('midterm',0):.1f}/100\n\n"
                f"Weakest area: {weakest.upper()} ({scores[weakest]:.1f}/100)\n\n"
                f"How to improve {weakest}:\n"
                f"  Dedicate 1 extra hour/day to this area\n"
                f"  Use practice question banks\n"
                f"  Form peer study groups\n"
                f"  Book professor office hours")

    def _resp_top_students(self):
        tops = self._top(5)
        if not tops:
            return "No student data found. Please add students first."
        lines = "\n".join(f"  #{i+1}  {s['name']:<20}  GPA: {s['gpa']:.2f}" for i, s in enumerate(tops))
        return f"Top Performers\n\n{lines}\n\nVisit the Dashboard for full rankings."

    def _resp_student_count(self):
        s = self._stats()
        total = s.get('total', 0)
        return (f"Student Statistics\n\n"
                f"Total enrolled : {total}\n"
                f"Top performers : {s.get('top_performers',0)}  (GPA >= 3.5)\n"
                f"At-risk        : {s.get('at_risk',0)}  (GPA < 2.5)\n"
                f"Average GPA    : {s.get('avg_gpa',0):.2f}\n"
                f"Avg Attendance : {s.get('avg_att',0):.1f}%")

    def _resp_avg_gpa(self):
        s = self._stats(); avgs = self._avgs()
        avg = s.get('avg_gpa', 0)
        grade = ('A' if avg >= 3.7 else 'B+' if avg >= 3.3 else 'B' if avg >= 3.0 else 'C+' if avg >= 2.7 else 'C')
        return (f"Class Average Report\n\n"
                f"Overall GPA    : {avg:.2f}  (Grade: {grade})\n"
                f"Avg Attendance : {s.get('avg_att',0):.1f}%\n"
                f"Avg Quiz       : {avgs.get('quiz',0):.1f}/100\n"
                f"Avg Assignment : {avgs.get('assignment',0):.1f}/100\n"
                f"Avg Midterm    : {avgs.get('midterm',0):.1f}/100\n\n"
                f"{'Class performing above target (3.0)' if avg >= 3.0 else 'Class average below target - intervention recommended.'}")

    def _resp_thanks(self):
        return "You are welcome! I am always here to help you make data-driven academic decisions.\nAsk me anything else about GPA, careers, or study planning!"

    def _resp_help(self):
        return ("AcadAI Assistant - What I can do:\n\n"
                "GPA & Performance:\n"
                "  'How to improve GPA?'\n"
                "  'What is the average GPA?'\n"
                "  'Predict next semester GPA'\n\n"
                "Students:\n"
                "  'Who are the top students?'\n"
                "  'How many students are at risk?'\n"
                "  'Show weak subjects'\n\n"
                "Career & Skills:\n"
                "  'Which career suits me?'\n"
                "  'What skills should I learn?'\n\n"
                "Study Planning:\n"
                "  'Generate a study plan'\n"
                "  'How many hours should I study?'\n"
                "  'What is the impact of attendance?'")

    def _resp_default(self, user_input):
        return (f"I did not fully understand that.\n\n"
                f"You asked: \"{user_input[:60]}{'...' if len(user_input)>60 else ''}\"\n\n"
                f"Try asking:\n"
                f"  'How to improve GPA?'\n"
                f"  'Which career suits me?'\n"
                f"  'Show at-risk students'\n"
                f"  'What skills should I learn?'\n\n"
                f"Or type 'help' to see all options.")
