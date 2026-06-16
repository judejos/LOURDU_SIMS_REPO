import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sims_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from sims.models import UserProfile, Department

User = get_user_model()

print("Removing old users...")
# Remove the old seeded users
old_usernames = ['superadmin', 'manager1', 'lead1', 'mentor1', 'intern1']
User.objects.filter(username__in=old_usernames).delete()

# We also need to map the "Staff" role to an actual role in our system. 
# In our system roles are typically: superadmin, manager, lead, mentor, intern. 
# We'll map "Staff" to a generic staff user.

roles_data = [
    {'username': 'Admin', 'email': 'admin@vdart.com', 'role': 'superadmin', 'name': 'Super Admin', 'dept': 'Administration'},
    {'username': 'Manager', 'email': 'manager@vdart.com', 'role': 'manager', 'name': 'General Manager', 'dept': 'Management'},
    {'username': 'Lead', 'email': 'lead@vdart.com', 'role': 'lead', 'name': 'Tech Lead', 'dept': 'Engineering'},
    {'username': 'Staff', 'email': 'staff@vdart.com', 'role': 'staff', 'name': 'General Staff', 'dept': 'Administration'}, # Using staff role or mentor if staff doesn't exist
    {'username': 'Mentor', 'email': 'mentor@vdart.com', 'role': 'mentor', 'name': 'Senior Mentor', 'dept': 'Training'},
    {'username': 'Intern', 'email': 'intern@vdart.com', 'role': 'intern', 'name': 'New Intern', 'dept': 'Development'},
]

print("Seeding new VDart users...")

for r in roles_data:
    # Create department if it doesn't exist
    dept, _ = Department.objects.get_or_create(name=r['dept'], defaults={'description': f"{r['dept']} Department"})

    # Create or update user
    user, created = User.objects.get_or_create(
        username=r['username'],
        defaults={
            'email': r['email'],
            'first_name': r['name'].split()[0],
            'last_name': ' '.join(r['name'].split()[1:]) if len(r['name'].split()) > 1 else ''
        }
    )
    user.set_password('Vdart@123')
    user.save()
    
    # Create or update profile
    profile, p_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'emp_id': f"EMP-{r['username'].upper()}",
            'full_name': r['name'],
            'role': r['role'],
            'user_status': 'active',
            'department': dept
        }
    )
    if not p_created:
        profile.role = r['role']
        profile.department = dept
        profile.save()
        
    status_str = "Created" if created else "Updated"
    print(f"{status_str}: {r['username']} ({r['role']}) - Password: Vdart@123")

print("Done.")
