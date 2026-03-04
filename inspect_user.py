import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from main.models import Meeting, MeetingMember

User = get_user_model()

def inspect_user(email):
    print(f"--- Inspecting user: {email} ---")
    try:
        user = User.objects.get(email=email)
        print(f"User ID: {user.id}, Username: {user.username}")
        
        # Owned meetings
        owned = Meeting.objects.filter(owner=user)
        print(f"\nOwned Meetings ({owned.count()}):")
        for m in owned:
            print(f"- {m.name} (id: {m.meeting_id})")
            
        # Memberships
        memberships = MeetingMember.objects.filter(user=user)
        print(f"\nMemberships ({memberships.count()}):")
        for ms in memberships:
            print(f"- Meeting: {ms.meeting.name}, Role: {ms.role}, Status: {ms.status}")
            
    except User.DoesNotExist:
        print("User not found.")

if __name__ == "__main__":
    inspect_user('test02@naver.com')
