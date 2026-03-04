import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from main.models import Meeting, MeetingMember

User = get_user_model()

def debug_visibility(email):
    print(f"=== Debugging visibility for {email} ===")
    user = User.objects.filter(email=email).first()
    if not user:
        print(f"User with email {email} not found.")
        # Try finding by username
        user = User.objects.filter(username=email.split('@')[0]).first()
        if user:
            print(f"Found user by username: {user.username} (ID: {user.id})")
        else:
            print("User not found at all matches.")
            return

    print(f"User: {user.username} (ID: {user.id}, Email: {user.email})")

    owned_meetings = Meeting.objects.filter(owner=user)
    print(f"\nOwned Meetings ({owned_meetings.count()}):")
    for m in owned_meetings:
        print(f"- {m.name} (ID: {m.meeting_id})")
        # Check membership for this meeting
        ms = MeetingMember.objects.filter(meeting=m, user=user).first()
        if ms:
            print(f"  Membership: Role={ms.role}, Status={ms.status}")
        else:
            print(f"  No membership record found for owner!")

    memberships = MeetingMember.objects.filter(user=user)
    print(f"\nAll Memberships for this user ({memberships.count()}):")
    for ms in memberships:
        print(f"- Meeting: {ms.meeting.name} (ID: {ms.meeting.meeting_id}), Role: {ms.role}, Status: {ms.status}, IsOwnerOfMeeting: {ms.meeting.owner == user}")

if __name__ == "__main__":
    debug_visibility('test02@naver.com')
