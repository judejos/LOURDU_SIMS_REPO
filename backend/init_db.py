import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sims_project.settings')
django.setup()

from django.contrib.auth.models import User
from sims.models import Entity, Branch, Domain, EntityConfig, UserProfile

# Clear existing users, profiles, entities, domains, branches, configs just in case
UserProfile.objects.all().delete()
User.objects.all().delete()
EntityConfig.objects.all().delete()
Branch.objects.all().delete()
Domain.objects.all().delete()
Entity.objects.all().delete()

# Create Entity
entity = Entity.objects.create(
    name="VDart Digital",
    description="VDart Digital Academy / Company"
)

# Create Branch
branch = Branch.objects.create(
    entity=entity,
    name="Chennai HQ",
    location="Chennai"
)

# Create Domains
domains = {}
for domain_name in ["Full Stack", "Data Science", "Design", "QA", "DevOps"]:
    domains[domain_name] = Domain.objects.create(
        entity=entity,
        name=domain_name,
        description=f"{domain_name} specialization domain"
    )

# Create EntityConfig
entity_config = EntityConfig.objects.create(
    entity=entity,
    working_hours={"weekday": "09:00-18:00"},
    shift_definitions=[
        {"name": "Standard Shift", "start": "09:00", "end": "18:00", "late_mark_after": 15}
    ],
    feature_flags={
        "learning_phase": True,
        "stipend": True,
        "task_self_creation": True,
        "ai_features": True
    }
)

# Create admin user
admin_user = User.objects.create_user(
    username="admin",
    email="admin@sims.vdart.com",
    password="Vdart@123",
    is_staff=True,
    is_superuser=True
)
admin_profile = UserProfile.objects.create(
    user=admin_user,
    emp_id="ADM0001",
    role="superadmin",
    full_name="Super Admin",
    entity=entity,
    user_status="active"
)

# Create other users
roles_data = [
    {"username": "manager", "email": "manager@sims.vdart.com", "role": "manager", "emp_id": "MAN0001", "full_name": "VDart Manager", "domain": None},
    {"username": "sme", "email": "sme@sims.vdart.com", "role": "sme", "emp_id": "SME0001", "full_name": "VDart SME", "domain": None},
    {"username": "mentor", "email": "mentor@sims.vdart.com", "role": "mentor", "emp_id": "MEN0001", "full_name": "VDart Mentor", "domain": "Full Stack"},
    {"username": "staff", "email": "staff@sims.vdart.com", "role": "staff", "emp_id": "STA0001", "full_name": "VDart Staff", "domain": None}
]

for data in roles_data:
    user = User.objects.create_user(
        username=data["username"],
        email=data["email"],
        password="Vdart@123"
    )
    domain_obj = domains[data["domain"]] if data["domain"] else None
    UserProfile.objects.create(
        user=user,
        emp_id=data["emp_id"],
        role=data["role"],
        full_name=data["full_name"],
        entity=entity,
        domain=domain_obj,
        user_status="active"
    )

print("Database seeded successfully!")
