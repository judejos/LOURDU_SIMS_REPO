import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sims_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from sims.models import UserProfile

User = get_user_model()

roles = [
    {'username': 'superadmin', 'email': 'admin@sims.com', 'role': 'superadmin', 'name': 'System Admin'},
    {'username': 'manager1', 'email': 'manager@sims.com', 'role': 'manager', 'name': 'Project Manager'},
    {'username': 'lead1', 'email': 'lead@sims.com', 'role': 'lead', 'name': 'Tech Lead'},
    {'username': 'mentor1', 'email': 'mentor@sims.com', 'role': 'mentor', 'name': 'Senior Mentor'},
    {'username': 'intern1', 'email': 'intern@sims.com', 'role': 'intern', 'name': 'John Intern'},
]

print("Seeding test users...")

for r in roles:
    # Create or update user
    user, created = User.objects.get_or_create(
        username=r['username'],
        defaults={
            'email': r['email'],
            'first_name': r['name'].split()[0],
            'last_name': ' '.join(r['name'].split()[1:]) if len(r['name'].split()) > 1 else ''
        }
    )
    user.set_password('password123')
    user.save()
    
    # Create or update profile
    profile, p_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'emp_id': f"EMP-{r['username'].upper()}",
            'full_name': r['name'],
            'role': r['role'],
            'user_status': 'active'
        }
    )
    if not p_created:
        profile.role = r['role']
        profile.save()
        
    status_str = "Created" if created else "Updated"
    print(f"{status_str}: {r['username']} ({r['role']}) - Password: password123")

print("Done seeding users.")
