# recommender/career_recommender.py
from config import CAREERS, SKILLS_DB

class CareerRecommender:
    def recommend(self, gpa, skills_str='', interest=''):
        user_skills = set(s.strip().lower() for s in skills_str.replace(';', ',').split(',') if s.strip())
        results = []
        for career in CAREERS:
            match = self._compute_match(gpa, user_skills, interest, career)
            results.append({**career, 'match': match})
        results.sort(key=lambda x: x['match'], reverse=True)
        return results

    def _compute_match(self, gpa, user_skills, interest, career):
        score = 0
        # GPA component (40%)
        gpa_norm = min(1.0, gpa / 4.0)
        gpa_score = gpa_norm * 40

        # Skills component (40%)
        req_skills = set(s.lower() for s in career['skills'])
        if req_skills:
            skill_overlap = len(user_skills & req_skills) / len(req_skills)
        else:
            skill_overlap = 0
        skill_score = skill_overlap * 40

        # Interest component (20%)
        interest_score = 0
        if interest:
            int_lower = interest.lower()
            career_lower = career['title'].lower()
            if any(w in career_lower for w in int_lower.split()):
                interest_score = 20

        total = gpa_score + skill_score + interest_score
        # bonus for exceeding min GPA
        if gpa >= career['min_gpa']:
            total = min(100, total + 5)
        return round(min(100, max(5, total)))

    def get_skill_recommendations(self, career_title, user_skills_str=''):
        user_skills = set(s.strip().lower() for s in user_skills_str.replace(';', ',').split(',') if s.strip())
        all_skills = SKILLS_DB.get(career_title, [])
        missing = [s for s in all_skills if s.lower() not in user_skills]
        present = [s for s in all_skills if s.lower() in user_skills]
        return {'missing': missing, 'present': present, 'all': all_skills}
