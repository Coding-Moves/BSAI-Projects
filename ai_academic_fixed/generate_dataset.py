# generate_dataset.py
# ─────────────────────────────────────────────────────────────────────────────
# Run this file ONCE to create:  datasets/student_data.csv
#
# HOW IT WORKS:
#   • Generates 30 realistic Pakistani university student records
#   • GPA is calculated using a weighted formula (same as the ML model)
#   • Data is correlated — higher attendance → better GPA
#   • Covers all risk levels: High / Medium / Low
#
# HOW TO RUN:
#   python generate_dataset.py
#
# OUTPUT:
#   datasets/student_data.csv
# ─────────────────────────────────────────────────────────────────────────────

import csv
import random
import os

random.seed(42)

# ── Pakistani student names ───────────────────────────────────────────────────
FIRST_NAMES = [
    "Ali", "Ahmed", "Usman", "Hassan", "Bilal", "Faisal", "Hamza", "Zain",
    "Omar", "Saad", "Talha", "Asad", "Junaid", "Tariq", "Fahad", "Imran",
    "Kamran", "Rizwan", "Shahid", "Waqas", "Ayesha", "Fatima", "Zara",
    "Sana", "Hira", "Nadia", "Rabia", "Amna", "Sara", "Maryam",
    "Kiran", "Nimra", "Alina", "Saima", "Rida", "Mehwish", "Iqra",
    "Zainab", "Sumera", "Hafsa", "Mahnoor", "Laiba", "Hoorain", "Anum",
]

LAST_NAMES = [
    "Khan", "Ahmed", "Ali", "Hassan", "Malik", "Qureshi", "Butt", "Iqbal",
    "Chaudhry", "Mirza", "Sheikh", "Siddiqui", "Raza", "Rehman", "Hussain",
    "Bajwa", "Cheema", "Awan", "Nawaz", "Riaz", "Zafar", "Baig", "Ansari",
]

# ── Interests and Skills ─────────────────────────────────────────────────────
INTERESTS = [
    "AI", "Data Science", "Web Development", "Mobile Apps", "Cybersecurity",
    "Cloud Computing", "IoT", "Game Development", "Robotics", "UI/UX"
]

SKILLS_POOL = [
    "Python", "Java", "C++", "SQL", "HTML", "CSS", "JavaScript", "React",
    "Node.js", "Django", "Flask", "TensorFlow", "PyTorch", "Keras", "Pandas",
    "NumPy", "Matplotlib", "Scikit-learn", "AWS", "Azure", "Firebase",
    "Linux", "Git", "Docker", "Kubernetes", "Figma", "Photoshop"
]
# ── GPA Calculation ─────────────────────────────────────────────────────────
def calculate_gpa(attendance, quiz, assignment, midterm, study_hours):
    # Model-learnable, noisy GPA formula
    import numpy as np
    raw = (
        0.015 * attendance +
        0.018 * quiz +
        0.016 * assignment +
        0.022 * midterm +
        0.08  * study_hours +
        np.random.normal(0, 0.25)
    )
    return round(float(np.clip(raw, 0.0, 4.0)), 2)

def make_student_profile(profile_type):

    if profile_type == "strong":
        attendance   = round(random.uniform(88, 98), 1)
        quiz         = round(random.uniform(78, 96), 1)
        assignment   = round(random.uniform(80, 96), 1)
        midterm      = round(random.uniform(75, 95), 1)
        study_hours  = round(random.uniform(4.0, 7.0), 1)

    elif profile_type == "average":
        attendance   = round(random.uniform(72, 88), 1)
        quiz         = round(random.uniform(60, 80), 1)
        assignment   = round(random.uniform(62, 82), 1)
        midterm      = round(random.uniform(58, 78), 1)
        study_hours  = round(random.uniform(2.5, 4.5), 1)

    else:  # weak / at-risk
        attendance   = round(random.uniform(50, 72), 1)
        quiz         = round(random.uniform(35, 62), 1)
        assignment   = round(random.uniform(38, 62), 1)
        midterm      = round(random.uniform(32, 60), 1)
        study_hours  = round(random.uniform(0.5, 2.5), 1)

    gpa = calculate_gpa(attendance, quiz, assignment, midterm, study_hours)

    return attendance, quiz, assignment, midterm, study_hours, gpa


# ── Main generation logic ─────────────────────────────────────────────────────
def generate_csv(output_path="datasets/student_data.csv", n_students=30):

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    used_names = set()

    def unique_name():
        for _ in range(100):
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

            if name not in used_names:
                used_names.add(name)
                return name

        return f"Student {len(used_names)+1}"

    # 12 strong, 12 average, 6 weak = 30 total
    profiles = (
        ["strong"]  * 12 +
        ["average"] * 12 +
        ["weak"]    * 6
    )

    random.shuffle(profiles)

    rows = []

    for profile in profiles:

        name = unique_name()

        email = (
            f"{name.split()[0].lower()}."
            f"{name.split()[1].lower()}"
            f"{random.randint(10,99)}@student.edu.pk"
        )

        semester = random.randint(1, 8)
        interest = random.choice(INTERESTS)

        # Pick 3–5 random skills
        n_skills = random.randint(3, 5)
        skills = ", ".join(random.sample(SKILLS_POOL, n_skills))

        att, quiz, asgn, mid, hrs, gpa = make_student_profile(profile)

        rows.append({
            "name":        name,
            "email":       email,
            "semester":    semester,
            "attendance":  att,
            "quiz":        quiz,
            "assignment":  asgn,
            "midterm":     mid,
            "study_hours": hrs,
            "gpa":         gpa,
            "interest":    interest,
            "skills":      skills,
        })

    # Sort by name
    rows.sort(key=lambda r: r["name"])

    fieldnames = [
        "name",
        "email",
        "semester",
        "attendance",
        "quiz",
        "assignment",
        "midterm",
        "study_hours",
        "gpa",
        "interest",
        "skills"
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:

        writer = csv.DictWriter(f, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(rows)

    # ── Summary ──────────────────────────────────────────────────────────────
    gpas = [r["gpa"] for r in rows]

    avg_gpa = sum(gpas) / len(gpas)
    high_risk = sum(1 for g in gpas if g < 2.5)
    top_perf = sum(1 for g in gpas if g >= 3.5)

    print("=" * 55)
    print("  CSV Dataset Generated Successfully!")
    print("=" * 55)
    print(f"  File       : {output_path}")
    print(f"  Students   : {len(rows)}")
    print(f"  Avg GPA    : {avg_gpa:.2f}")
    print(f"  Top (>=3.5): {top_perf}")
    print(f"  At-Risk    : {high_risk}  (GPA < 2.5)")
    print(f"  Columns    : {', '.join(fieldnames)}")
    print("=" * 55)
    print()
    print("  Next step: run  python main.py")
    print("  The app will auto-load this CSV on first launch.")
    print("=" * 55)


if __name__ == "__main__":
    generate_csv()