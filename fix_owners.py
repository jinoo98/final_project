import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from main.models import Meeting, MeetingMember

def fix_owner_memberships():
    meetings = Meeting.objects.all()
    fixed_count = 0
    created_count = 0
    
    for meeting in meetings:
        owner = meeting.owner
        # 방장에 대한 멤버십 레코드 확인
        membership, created = MeetingMember.objects.get_or_create(
            meeting=meeting,
            user=owner,
            defaults={
                'email': owner.email,
                'role': MeetingMember.Role.OWNER,
                'status': MeetingMember.Status.APPROVED
            }
        )
        
        if created:
            created_count += 1
            print(f"Created APPROVED OWNER membership for meeting '{meeting.name}' (Owner: {owner.email})")
        else:
            # 기존 레코드가 있다면 ROLE과 STATUS 강제 업데이트
            if membership.role != MeetingMember.Role.OWNER or membership.status != MeetingMember.Status.APPROVED:
                membership.role = MeetingMember.Role.OWNER
                membership.status = MeetingMember.Status.APPROVED
                membership.save()
                fixed_count += 1
                print(f"Updated OWNER membership for meeting '{meeting.name}' (Owner: {owner.email})")

    print(f"\nFix complete. Created: {created_count}, Updated: {fixed_count}")

if __name__ == "__main__":
    fix_owner_memberships()
