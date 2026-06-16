"""
SIMS - Seed Data Script (Windows-safe, idempotent)
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sims_project.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from sims.models import (
    Entity, Branch, Department, Domain, EntityDepartment,
    UserProfile, Team, EntityConfig,
)

print("SIMS Seed Data Creation")
print("=" * 50)

# 1. Entity
entity, _ = Entity.objects.get_or_create(name='VDart Digital', defaults={
    'description': 'VDart Digital Academy', 'is_active': True,
})
print(f"[OK] Entity: {entity.name}")

# 2. Branch
branch, _ = Branch.objects.get_or_create(entity=entity, name='Chennai HQ', defaults={
    'location': 'Chennai, Tamil Nadu',
})
print(f"[OK] Branch: {branch.name}")

# 3. Departments
dept_data = [
    ('Engineering', 'Software Engineering'),
    ('Data Science', 'ML, AI, Analytics'),
    ('Design', 'UI/UX and Product Design'),
    ('QA', 'Quality Assurance'),
    ('DevOps', 'Infrastructure & Cloud'),
]
departments = {}
for name, desc in dept_data:
    dept, _ = Department.objects.get_or_create(
        name=name, branch=branch, entity=entity, defaults={'description': desc},
    )
    departments[name] = dept
    EntityDepartment.objects.get_or_create(entity=entity, department=dept)
print(f"[OK] Departments: {len(departments)}")

# 4. Domains
domain_data = {
    'Engineering': ['Full Stack', 'Backend', 'Frontend', 'Mobile'],
    'Data Science': ['Machine Learning', 'Data Analytics', 'NLP'],
    'Design': ['UI/UX', 'Product Design', 'Graphic Design'],
    'QA': ['Manual Testing', 'Automation Testing'],
    'DevOps': ['Cloud Infrastructure', 'CI/CD'],
}
domains = {}
for dept_name, dom_list in domain_data.items():
    for dom_name in dom_list:
        dom, _ = Domain.objects.get_or_create(
            name=dom_name, department=departments[dept_name],
            defaults={'required_skills': []},
        )
        domains[dom_name] = dom
print(f"[OK] Domains: {len(domains)}")

# 5. Entity Config
EntityConfig.objects.get_or_create(entity=entity, defaults={
    'working_hours': {'start': '09:00', 'end': '18:00', 'break_minutes': 60},
    'shift_definitions': [
        {'name': 'Morning', 'start': '09:00', 'end': '18:00', 'late_mark_after': 15},
    ],
    'leave_quota': {'casual': 12, 'sick': 6, 'personal': 3},
    'feature_flags': {'learning_phase': True, 'ai_features': True},
    'sla_default_hours': 48,
    'escalation_delay_hours': 24,
})
print("[OK] Entity Config")

def ensure_user(username, email, password, first, last, emp_id, role, status, dept_name, domain_name=None):
    """Create or fix user+profile pair."""
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': email, 'first_name': first, 'last_name': last,
    })
    if created:
        user.set_password(password)
        user.save()
    if not hasattr(user, 'profile') or not UserProfile.objects.filter(user=user).exists():
        dept = departments.get(dept_name)
        dom = domains.get(domain_name) if domain_name else None
        UserProfile.objects.create(
            user=user, emp_id=emp_id, full_name=f"{first} {last}",
            role=role, user_status=status,
            entity=entity, department=dept, domain=dom,
            scheme='free', shift_timing='Morning',
        )
    Token.objects.get_or_create(user=user)
    label = "CREATED" if created else "EXISTS"
    print(f"[{label}] {username} / {password} ({role}, {emp_id})")
    return user

# 6. Create all users
admin_user = User.objects.filter(username='admin').first()
if not admin_user:
    admin_user = User.objects.create_superuser('admin', 'admin@sims.vdart.com', 'admin123',
                                                first_name='Super', last_name='Admin')
if not UserProfile.objects.filter(user=admin_user).exists():
    UserProfile.objects.create(user=admin_user, emp_id='ADMIN-001', full_name='Super Admin',
                                role='superadmin', user_status='active',
                                entity=entity, department=departments['Engineering'])
Token.objects.get_or_create(user=admin_user)
print("[OK] admin / admin123 (superadmin)")

ensure_user('manager1', 'manager@sims.vdart.com', 'manager123', 'Priya', 'Sharma',
            'MGR-001', 'manager', 'active', 'Engineering')

ensure_user('lead1', 'lead@sims.vdart.com', 'lead123', 'Rahul', 'Kumar',
            'LEAD-001', 'lead', 'active', 'Engineering', 'Full Stack')

mentor_user = ensure_user('mentor1', 'mentor@sims.vdart.com', 'mentor123', 'Arun', 'Raj',
                           'MNT-001', 'mentor', 'active', 'Engineering', 'Full Stack')

intern_data = [
    ('intern1', 'intern1@sims.vdart.com', 'intern1123', 'Karthik', 'Rajan', 'INT-001', 'Full Stack', 'active'),
    ('intern2', 'intern2@sims.vdart.com', 'intern2123', 'Divya', 'Lakshmi', 'INT-002', 'Machine Learning', 'active'),
    ('intern3', 'intern3@sims.vdart.com', 'intern3123', 'Santhosh', 'Kumar', 'INT-003', 'UI/UX', 'active'),
    ('intern4', 'intern4@sims.vdart.com', 'intern4123', 'Meera', 'Nair', 'INT-004', 'Backend', 'yettojoin'),
    ('intern5', 'intern5@sims.vdart.com', 'intern5123', 'Vishnu', 'Prasad', 'INT-005', 'Full Stack', 'active'),
]
for uname, email, pwd, first, last, eid, dom, st in intern_data:
    dept_name = 'Engineering' if dom in ['Full Stack', 'Backend', 'Frontend', 'Mobile'] else (
        'Data Science' if dom in ['Machine Learning', 'Data Analytics', 'NLP'] else 'Design'
    )
    ensure_user(uname, email, pwd, first, last, eid, 'intern', st, dept_name, dom)

# 7. Team
mentor_profile = UserProfile.objects.filter(emp_id='MNT-001').first()
team, _ = Team.objects.get_or_create(
    name='Alpha Squad', entity=entity,
    defaults={'description': 'Full Stack Dev Team', 'mentor': mentor_profile},
)
for eid in ['INT-001', 'INT-005']:
    p = UserProfile.objects.filter(emp_id=eid).first()
    if p:
        team.interns.add(p)
print(f"[OK] Team: {team.name}")

print("=" * 50)
print("SEED DATA COMPLETE!")
print("=" * 50)
