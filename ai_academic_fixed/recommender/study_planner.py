# recommender/study_planner.py

DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

def generate_plan(attendance, quiz, assignment, midterm, study_hours, interest=''):
    weak_subjects = []
    if attendance < 80:   weak_subjects.append(('Attendance Review', 'HIGH', '#EF4444'))
    if midterm < 65:      weak_subjects.append(('Core Theory',       'HIGH', '#EF4444'))
    if quiz < 70:         weak_subjects.append(('Practice Quizzes',  'MED',  '#F59E0B'))
    if assignment < 75:   weak_subjects.append(('Assignments',       'MED',  '#F59E0B'))
    
    regular = [
        ('Mathematics',          'LOW', '#10B981'),
        ('Programming Practice', 'LOW', '#10B981'),
        ('Research & Reading',   'LOW', '#4F6EF7'),
    ]

    all_subjects = weak_subjects + regular
    daily_hrs = max(2, min(8, int(study_hours)))
    
    plan = []
    for i, day in enumerate(DAYS):
        if day == 'Sunday':
            plan.append({'day': day, 'sessions': [{'subject': 'Rest & Revision', 'duration': 60, 'priority': 'REST', 'color': '#6B7280'}], 'total_hrs': 1})
            continue
        sessions = []
        remaining = daily_hrs * 60  # minutes
        idx = 0
        while remaining > 0 and idx < len(all_subjects):
            subj, prio, color = all_subjects[idx % len(all_subjects)]
            dur = 90 if prio == 'HIGH' else (60 if prio == 'MED' else 45)
            dur = min(dur, remaining)
            sessions.append({'subject': subj, 'duration': dur, 'priority': prio, 'color': color})
            remaining -= dur + 10  # 10 min break
            idx += 1
        plan.append({'day': day, 'sessions': sessions, 'total_hrs': round(daily_hrs * 0.9, 1)})
    
    return plan
