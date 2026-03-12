import os
import firebase_admin
from firebase_admin import credentials, messaging

from django.shortcuts import render, redirect
from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate, logout as auth_logout
from .r2 import upload_file_obj_to_r2
import socket
import json

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    """토큰이 유효한 사용자만 접근 가능한 테스트 API"""
    return Response({
        'message': 'JWT 인증 성공!',
        'user_id': request.user.id
    })

# --- 파이어베이스 Admin 초기화 ---
# 서버가 구동될 때 최초 1회만 실행되어 파이어베이스와 연결합니다.
if not firebase_admin._apps:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    cred_path = os.path.join(current_dir, 'serviceAccountKey.json')
    
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("[OK] 파이어베이스 연결 성공!")
    else:
        print("[ERROR] 에러: serviceAccountKey.json 파일이 없습니다. (views.py와 같은 폴더에 넣어주세요!)")
# ----------------------------------------------------

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # 이 주소는 실제로 연결을 시도하지 않으며, 단지 라우팅 경로를 확인하는 용도입니다.
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

# Create your views here.

def public_view(request):
    """로그인, 회원가입 등 공개 페이지를 위한 뷰 (이미 로그인된 경우 메인으로 리다이렉트)"""
    if request.user.is_authenticated:
        return redirect('main')
    host = get_local_ip()
    return render(request, 'react_index.html', {'host_domain': host})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('main')
    host = get_local_ip()
    return render(request, 'react_index.html', {'host_domain': host})

@csrf_exempt
def logout_api(request):
    auth_logout(request)
    return JsonResponse({'message': '로그아웃 되었습니다.'})

def login_cancelled_view(request):
    host = get_local_ip()
    return render(request, 'react_index.html', {'host_domain': host})

def main_view(request):
    if not request.user.is_authenticated:
        return redirect('react_login')
    host = get_local_ip()
    return render(request, 'react_index.html', {'host_domain': host})

def mypage_view(request):
    if not request.user.is_authenticated:
        return redirect('react_login')
    host = get_local_ip()
    return render(request, 'react_index.html', {'host_domain': host})

def meeting_detail_view(request, meeting_id):
    if not request.user.is_authenticated:
        return redirect('react_login')
    host = get_local_ip()
    return render(request, 'react_index.html', {'host_domain': host})

def meeting_board_view(request, meeting_id):
    if not request.user.is_authenticated:
        return redirect('react_login')
    host = get_local_ip()
    return render(request, 'react_index.html', {'host_domain': host})

def meeting_ocr_view(request, meeting_id):
    if not request.user.is_authenticated:
        return redirect('react_login')
    host = request.get_host().split(':')[0]
    return render(request, 'react_index.html', {'host_domain': host})

def meeting_schedule_view(request, meeting_id):
    if not request.user.is_authenticated:
        return redirect('react_login')
    host = request.get_host().split(':')[0]
    return render(request, 'react_index.html', {'host_domain': host})


@csrf_exempt
def ocr_upload_view(request, meeting_id):
    """
    스마트스캔 API
    POST: multipart/form-data, 'image' 필드에 영수증 이미지
    → OCR 추론 결과 JSON 반환
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        if 'image' not in request.FILES:
            return JsonResponse({'error': '이미지 파일이 없습니다.'}, status=400)

        image_file = request.FILES['image']

        # PIL Image 변환
        from PIL import Image as PILImage
        import io
        image = PILImage.open(io.BytesIO(image_file.read())).convert("RGB")

        # OCR 추론 (전역 모델 사용)
        from .ocr_service import run_ocr, is_model_ready
        if not is_model_ready():
            return JsonResponse(
                {'error': 'OCR 모델이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.'},
                status=503
            )

        result = run_ocr(image)

        if not result.get('success'):
            return JsonResponse({'error': result.get('error', 'OCR 처리 실패')}, status=500)

        return JsonResponse({
            'success':   True,
            'filename':  image_file.name,
            '상호명':    result.get('상호명', ''),
            '사업자번호': result.get('사업자번호', ''),
            '날짜':      result.get('날짜', ''),
            '합계':      result.get('합계', ''),
            'ocr_raw':   result.get('ocr_raw', ''),
        })

    except Exception as e:
        print(f"[OCR] 처리 오류: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def signup_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            nickname = data.get('nickname')
            password = data.get('password')
            address = data.get('address', '')
            birthday = data.get('birth_date', None)
            gender = data.get('gender', '')

            if not email or not nickname or not password:
                return JsonResponse({'error': '모든 필드를 입력해주세요.'}, status=400)

            from .models import User
            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': '이미 가입된 이메일입니다.'}, status=400)

            # AbstractUser를 상속받았으므로 create_user 사용 (비밀번호 해싱 포함)
            user = User.objects.create_user(
                username=email,
                email=email,
                nickname=nickname,
                password=password,
                adress=address,
                birthday=birthday if birthday else None,
                gender=gender
            )

            # allauth와 호환되도록 EmailAddress 모델에 데이터 추가
            from allauth.account.models import EmailAddress
            EmailAddress.objects.create(
                user=user, 
                email=email, 
                primary=True, 
                verified=True # ACCOUNT_EMAIL_VERIFICATION = "none" 이므로 바로 완료 처리
            )

            # 회원가입 직후 자동 로그인 처리
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            
            return JsonResponse({'message': '회원가입 및 로그인이 완료되었습니다.'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def check_email_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            if not email:
                return JsonResponse({'error': '이메일을 입력해주세요.'}, status=400)
            
            from .models import User
            is_exists = User.objects.filter(email=email).exists()
            return JsonResponse({'available': not is_exists})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def login_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            remember_me = data.get('remember_me', False)

            if not email or not password:
                return JsonResponse({'error': '이메일과 비밀번호를 모두 입력해주세요.'}, status=400)

            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                
                # 로그인 상태 유지 처리
                if remember_me:
                    request.session.set_expiry(30 * 24 * 60 * 60) 
                else:
                    request.session.set_expiry(0)
                
                request.session.modified = True
                    
                return JsonResponse({'message': '로그인에 성공했습니다.', 'redirect_url': '/main'}, status=200)
            else:
                return JsonResponse({'error': '이메일 또는 비밀번호가 일치하지 않습니다.'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def get_profile_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    user = request.user
    return JsonResponse({
        'email': user.email,
        'nickname': user.nickname,
        'adress': user.adress,
        'birthday': user.birthday.isoformat() if hasattr(user.birthday, 'isoformat') else str(user.birthday) if user.birthday else '',
        'gender': user.gender
    })

@csrf_exempt
def update_profile_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = request.user
            
            user.nickname = data.get('nickname', user.nickname)
            user.adress = data.get('adress', user.adress)
            
            birthday = data.get('birthday')
            if birthday:
                user.birthday = birthday
            else:
                user.birthday = None
                
            user.gender = data.get('gender', user.gender)
            user.save()
            return JsonResponse({'message': '프로필이 성공적으로 수정되었습니다.'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_account_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            password = data.get('password')
            
            if not password:
                return JsonResponse({'error': '비밀번호를 입력해주세요.'}, status=400)
            
            user = request.user
            
            if not user.check_password(password):
                return JsonResponse({'error': '비밀번호가 일치하지 않습니다.'}, status=400)
            
            from .models import Meeting, MeetingMember, Schedule, FinTransaction, BoardPost, BoardComment
            
            owned_meetings = Meeting.objects.filter(owner=user)
            for meeting in owned_meetings:
                other_members_count = MeetingMember.objects.filter(
                    meeting=meeting, 
                    status=MeetingMember.Status.APPROVED
                ).exclude(user=user).count()
                
                if other_members_count > 0:
                    return JsonResponse({
                        'error': f"'{meeting.name}' 모임의 방장입니다. 다른 사람에게 방장을 위임하거나 모임원을 정리한 후 탈퇴해 주세요."
                    }, status=400)
            
            owned_meetings.delete()
            Schedule.objects.filter(created_by=user).delete()
            FinTransaction.objects.filter(created_by=user).delete()
            BoardPost.objects.filter(author=user).delete()
            BoardComment.objects.filter(author=user).delete()
            user.delete()
            auth_logout(request)
            
            return JsonResponse({'message': '계정이 성공적으로 삭제되었습니다. 그동안 이용해주셔서 감사합니다.'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def change_password_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            current_password = data.get('current_password')
            new_password = data.get('new_password')
            user = request.user
            
            if not user.check_password(current_password):
                return JsonResponse({'error': '현재 비밀번호가 일치하지 않습니다.'}, status=400)
            
            user.set_password(new_password)
            user.save()
            
            from django.contrib.auth import update_session_auth_hash
            update_session_auth_hash(request, user)
            
            return JsonResponse({'message': '비밀번호가 성공적으로 변경되었습니다.'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_meetings_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    user = request.user
    from .models import Meeting, MeetingMember
    
    memberships = MeetingMember.objects.filter(
        user=user, 
        status=MeetingMember.Status.APPROVED
    ).select_related('meeting')
    
    owned_meetings = Meeting.objects.filter(owner=user)
    
    meeting_ids = set()
    meetings_data = []
    
    for ms in memberships:
        meeting = ms.meeting
        meeting_ids.add(meeting.meeting_id)
        meetings_data.append({
            'id': meeting.meeting_id,
            'title': meeting.name,
            'description': meeting.description,
            'isOwner': ms.role == MeetingMember.Role.OWNER or meeting.owner == user,
            'members': meeting.members.filter(status=MeetingMember.Status.APPROVED).count(),
            'date': meeting.created_at.strftime('%Y-%m-%d'),
            'balance': '0원'
        })
    
    for meeting in owned_meetings:
        if meeting.meeting_id not in meeting_ids:
            meetings_data.append({
                'id': meeting.meeting_id,
                'title': meeting.name,
                'description': meeting.description,
                'isOwner': True,
                'members': meeting.members.filter(status=MeetingMember.Status.APPROVED).count(),
                'date': meeting.created_at.strftime('%Y-%m-%d'),
                'balance': '0원'
            })
    
    return JsonResponse({'meetings': meetings_data})

@csrf_exempt
def create_meeting_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            description = data.get('description', '')
            
            if not name:
                return JsonResponse({'error': '모임 이름을 입력해주세요.'}, status=400)
            
            from .models import Meeting, MeetingMember
            
            meeting = Meeting.objects.create(
                owner=request.user,
                name=name,
                description=description
            )
            
            MeetingMember.objects.create(
                meeting=meeting,
                user=request.user,
                email=request.user.email,
                role=MeetingMember.Role.OWNER,
                status=MeetingMember.Status.APPROVED
            )
            
            return JsonResponse({
                'message': '모임이 성공적으로 생성되었습니다.',
                'meeting': {
                    'id': meeting.meeting_id,
                    'title': meeting.name,
                    'description': meeting.description,
                    'isOwner': True,
                    'members': 1,
                    'date': meeting.created_at.strftime('%Y-%m-%d'),
                    'balance': '0원'
                }
            }, status=201)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_meeting_detail_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import Meeting, MeetingMember
    try:
        meeting = Meeting.objects.get(meeting_id=meeting_id)
        is_owner = (meeting.owner == request.user)
        membership = MeetingMember.objects.filter(meeting=meeting, user=request.user).first()
        
        if not is_owner and (not membership or membership.status != MeetingMember.Status.APPROVED):
            if membership and membership.status == MeetingMember.Status.PENDING:
                return JsonResponse({
                    'id': meeting.meeting_id,
                    'name': meeting.name,
                    'status': membership.status,
                    'is_owner': False,
                    'error': '승인 대기 중입니다.'
                }, status=403)
            return JsonResponse({'error': '권한이 없습니다.'}, status=403)
            
        return JsonResponse({
            'id': meeting.meeting_id,
            'name': meeting.name,
            'description': meeting.description,
            'owner_email': meeting.owner.email,
            'is_owner': is_owner,
            'role': membership.role if membership else (MeetingMember.Role.OWNER if is_owner else None),
            'status': membership.status if membership else (MeetingMember.Status.APPROVED if is_owner else None)
        })
    except Meeting.DoesNotExist:
        return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)

@csrf_exempt
def join_meeting_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            invite_code = data.get('invite_code')
            
            if not invite_code:
                return JsonResponse({'error': '초대 코드를 입력해주세요.'}, status=400)
            
            from .models import Meeting, MeetingMember
            try:
                meeting = Meeting.objects.get(meeting_id=invite_code)
            except Meeting.DoesNotExist:
                return JsonResponse({'error': '유효하지 않은 초대 코드입니다.'}, status=404)
            
            existing_member = MeetingMember.objects.filter(meeting=meeting, user=request.user).first()
            if existing_member:
                if existing_member.status == MeetingMember.Status.REJECTED:
                    existing_member.delete()
                else:
                    return JsonResponse({'error': '이미 가입 신청을 했거나 멤버입니다.'}, status=400)
            
            MeetingMember.objects.create(
                meeting=meeting,
                user=request.user,
                email=request.user.email,
                role=MeetingMember.Role.MEMBER,
                status=MeetingMember.Status.PENDING
            )
            
            return JsonResponse({'message': '가입 신청이 완료되었습니다. 방장의 승인을 기다려주세요.'}, status=201)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_pending_members_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import Meeting, MeetingMember
    try:
        meeting = Meeting.objects.get(meeting_id=meeting_id)
        user_membership = MeetingMember.objects.filter(meeting=meeting, user=request.user).first()
        if meeting.owner != request.user and (not user_membership or user_membership.role != MeetingMember.Role.ADMIN):
            return JsonResponse({'error': '권한이 없습니다.'}, status=403)
        
        pending_members = MeetingMember.objects.filter(
            meeting=meeting, 
            status=MeetingMember.Status.PENDING
        ).select_related('user')
        
        data = []
        for pm in pending_members:
            data.append({
                'member_id': pm.meeting_member_id,
                'user_name': pm.user.nickname or pm.user.username,
                'email': pm.email,
                'applied_at': pm.joined_at.strftime('%Y-%m-%d %H:%M')
            })
            
        return JsonResponse(data, safe=False)
    except Meeting.DoesNotExist:
        return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)

@csrf_exempt
def approve_member_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            member_id = data.get('member_id')
            action = data.get('action')
            
            if not member_id or not action:
                return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)
            
            from .models import Meeting, MeetingMember
            try:
                meeting = Meeting.objects.get(meeting_id=meeting_id)
                user_membership = MeetingMember.objects.filter(meeting=meeting, user=request.user).first()
                if meeting.owner != request.user and (not user_membership or user_membership.role != MeetingMember.Role.ADMIN):
                    return JsonResponse({'error': '권한이 없습니다.'}, status=403)
                
                member = MeetingMember.objects.get(meeting_member_id=member_id, meeting=meeting)
                
                if action == 'APPROVE':
                    member.status = MeetingMember.Status.APPROVED
                    member.save()
                    return JsonResponse({'message': '가입을 승인했습니다.'})
                elif action == 'REJECT':
                    member.status = MeetingMember.Status.REJECTED
                    member.save()
                    return JsonResponse({'message': '가입을 거절했습니다.'})
                else:
                    return JsonResponse({'error': '유효하지 않은 액션입니다.'}, status=400)
                    
            except (Meeting.DoesNotExist, MeetingMember.DoesNotExist):
                return JsonResponse({'error': '대상 데이터를 찾을 수 없습니다.'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def leave_meeting_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            from .models import Meeting, MeetingMember
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            
            if meeting.owner == request.user:
                return JsonResponse({'error': '방장은 모임을 탈퇴할 수 없습니다. 모임을 삭제하거나 권한을 이전해주세요.'}, status=400)
            
            membership = MeetingMember.objects.filter(meeting=meeting, user=request.user).first()
            if membership:
                membership.delete()
                return JsonResponse({'message': '모임에서 탈퇴되었습니다.'})
            else:
                return JsonResponse({'error': '가입된 모임이 아닙니다.'}, status=404)
                
        except Meeting.DoesNotExist:
            return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_meeting_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            from .models import Meeting, MeetingMember
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            
            if meeting.owner != request.user:
                return JsonResponse({'error': '방장만 모임을 삭제할 수 있습니다.'}, status=403)
            
            other_members_count = MeetingMember.objects.filter(meeting=meeting).exclude(user=request.user).count()
            
            if other_members_count > 0:
                return JsonResponse({'error': '방장 외 다른 회원이 있을 때는 모임을 삭제할 수 없습니다.'}, status=400)
            
            meeting.delete()
            return JsonResponse({'message': '모임이 성공적으로 삭제되었습니다.'})
                
        except Meeting.DoesNotExist:
            return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_approved_members_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import Meeting, MeetingMember
    try:
        meeting = Meeting.objects.get(meeting_id=meeting_id)
        user_membership = MeetingMember.objects.filter(meeting=meeting, user=request.user).first()
        if meeting.owner != request.user and (not user_membership or user_membership.role != MeetingMember.Role.ADMIN):
            return JsonResponse({'error': '권한이 없습니다.'}, status=403)
        
        approved_members = MeetingMember.objects.filter(
            meeting=meeting, 
            status=MeetingMember.Status.APPROVED
        ).select_related('user')
        
        data = []
        for am in approved_members:
            data.append({
                'member_id': am.meeting_member_id,
                'user_name': am.user.nickname or am.user.username,
                'email': am.email,
                'joined_at': am.joined_at.strftime('%Y-%m-%d %H:%M'),
                'role': am.role
            })
            
        return JsonResponse(data, safe=False)
    except Meeting.DoesNotExist:
        return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def change_member_role_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            member_id = data.get('member_id')
            new_role = data.get('new_role')
            
            if not member_id or not new_role:
                return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)
            
            if new_role not in ['MEMBER', 'ADMIN', 'OWNER']:
                return JsonResponse({'error': '유효하지 않은 역할입니다.'}, status=400)
            
            from .models import Meeting, MeetingMember
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            
            if meeting.owner != request.user:
                return JsonResponse({'error': '권한이 없습니다.'}, status=403)
            
            member = MeetingMember.objects.get(meeting_member_id=member_id, meeting=meeting)
            
            if member.role == MeetingMember.Role.OWNER:
                return JsonResponse({'error': '이미 방장입니다.'}, status=400)
            
            if new_role == 'OWNER':
                old_owner_member = MeetingMember.objects.get(meeting=meeting, user=request.user)
                old_owner_member.role = MeetingMember.Role.ADMIN
                old_owner_member.save()
                
                member.role = MeetingMember.Role.OWNER
                member.save()
                
                meeting.owner = member.user
                meeting.save()
                
                return JsonResponse({'message': f'방장 권한을 {member.user.nickname or member.user.username}님에게 위임했습니다.'})
            
            member.role = new_role
            member.save()
            
            role_display = '관리자' if new_role == 'ADMIN' else '일반 회원'
            return JsonResponse({'message': f'회원 권한을 {role_display}(으)로 변경했습니다.'})
            
        except Meeting.DoesNotExist:
            return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)
        except MeetingMember.DoesNotExist:
            return JsonResponse({'error': '해당 회원을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_board_posts_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import Meeting, BoardPost, BoardLike, BoardComment, MeetingMember
    try:
        meeting = Meeting.objects.get(meeting_id=meeting_id)
        user_member = MeetingMember.objects.filter(meeting=meeting, user=request.user, status=MeetingMember.Status.APPROVED).first()
        user_role = user_member.role if user_member else None
        
        posts = BoardPost.objects.filter(meeting=meeting, status=BoardPost.Status.VISIBLE).order_by('-is_notice', '-is_pinned', '-created_at')
        
        data = []
        for post in posts:
            is_liked = BoardLike.objects.filter(post=post, user=request.user).exists()
            comments_visible = post.comments.filter(status=BoardComment.Status.VISIBLE)
            likes_count = post.likes.count()
            
            can_delete = (post.author == request.user) or (user_role in [MeetingMember.Role.OWNER, MeetingMember.Role.ADMIN])
            
            data.append({
                'id': post.post_id,
                'title': post.title,
                'content': post.content,
                'author': post.author.nickname or post.author.username,
                'author_id': post.author.id, 
                'date': post.post_date.isoformat() if post.post_date else post.created_at.strftime('%Y-%m-%d'),
                'likes': likes_count,
                'comments': comments_visible.count(),
                'isNotice': post.is_notice,
                'isLiked': is_liked,
                'isPinned': post.is_pinned,
                'canDelete': can_delete,
                'imageUrl': post.image_url,
                'imageUrls': [img.image_url for img in post.images.all()],
                'commentsList': [
                    {
                        'id': c.comment_id,
                        'author': c.author.nickname or c.author.username,
                        'date': c.created_at.strftime('%Y-%m-%d'),
                        'text': c.content,
                        'parentId': c.parent_id
                    } for c in comments_visible.order_by('created_at')
                ]
            })
        return JsonResponse(data, safe=False)
    except Meeting.DoesNotExist:
        return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def delete_board_post_api(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'DELETE':
        from .models import BoardPost, MeetingMember
        try:
            post = BoardPost.objects.get(post_id=post_id)
            meeting = post.meeting
            
            user_member = MeetingMember.objects.filter(meeting=meeting, user=request.user, status=MeetingMember.Status.APPROVED).first()
            user_role = user_member.role if user_member else None
            
            if (post.author == request.user) or (user_role in [MeetingMember.Role.OWNER, MeetingMember.Role.ADMIN]):
                # Delete images from R2
                from .r2 import delete_file_from_r2
                
                # 모든 관련 이미지 URL 수집 (중복 제거를 위해 set 사용)
                urls_to_delete = set()
                if post.image_url:
                    urls_to_delete.add(post.image_url)
                
                # BoardImage 모델에 저장된 추가 이미지들
                for img_obj in post.images.all():
                    urls_to_delete.add(img_obj.image_url)
                
                for url in urls_to_delete:
                    # URL에서 R2 키 추출 (/api/board_images/ 경로 제외)
                    key = url
                    if '/api/board_images/' in url:
                        key = url.split('/api/board_images/')[-1]
                    
                    delete_file_from_r2(key)

                post.status = BoardPost.Status.DELETED
                post.save()
                return JsonResponse({'message': '게시글과 관련 이미지가 삭제되었습니다.'})
            else:
                return JsonResponse({'error': '삭제 권한이 없습니다.'}, status=403)
                
        except BoardPost.DoesNotExist:
            return JsonResponse({'error': '게시글을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def create_board_post_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            from .models import Meeting, BoardPost, BoardImage
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            
            post_date = data.get('date')
            if not post_date:
                from django.utils import timezone
                post_date = timezone.now().date().isoformat()

            post = BoardPost.objects.create(
                meeting=meeting,
                author=request.user,
                title=data.get('title'),
                content=data.get('content'),
                post_date=post_date,
                image_url=data.get('imageUrl'), # 썸네일용 (첫번째 이미지)
                is_notice=data.get('isNotice', False)
            )
            
            # 다중 이미지 저장
            image_urls = data.get('imageUrls', [])
            for url in image_urls:
                BoardImage.objects.create(post=post, image_url=url)
            
            return JsonResponse({'message': '게시글이 저장되었습니다.', 'post_id': post.post_id}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def toggle_post_like_api(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        from .models import BoardPost, BoardLike
        try:
            post = BoardPost.objects.get(post_id=post_id)
            like = BoardLike.objects.filter(post=post, user=request.user).first()
            if like:
                like.delete()
                liked = False
            else:
                BoardLike.objects.create(post=post, user=request.user)
                liked = True
            
            return JsonResponse({'liked': liked, 'likes_count': post.likes.count()})
        except BoardPost.DoesNotExist:
            return JsonResponse({'error': '게시글을 찾을 수 없습니다.'}, status=404)
    return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def toggle_post_pin_api(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        from .models import BoardPost, MeetingMember
        try:
            post = BoardPost.objects.get(post_id=post_id)
            meeting = post.meeting
            
            user_member = MeetingMember.objects.filter(meeting=meeting, user=request.user, status=MeetingMember.Status.APPROVED).first()
            user_role = user_member.role if user_member else None
            
            if user_role in [MeetingMember.Role.OWNER, MeetingMember.Role.ADMIN]:
                post.is_pinned = not post.is_pinned
                post.save()
                return JsonResponse({'pinned': post.is_pinned})
            else:
                return JsonResponse({'error': '고정 권한이 없습니다.'}, status=403)
                
        except BoardPost.DoesNotExist:
            return JsonResponse({'error': '게시글을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def add_board_comment_api(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            from .models import BoardPost, BoardComment
            post = BoardPost.objects.get(post_id=post_id)
            
            comment = BoardComment.objects.create(
                post=post,
                author=request.user,
                content=data.get('text'),
                parent_id=data.get('parentId')
            )
            
            return JsonResponse({
                'id': comment.comment_id,
                'author': comment.author.nickname or comment.author.username,
                'date': comment.created_at.strftime('%Y-%m-%d'),
                'text': comment.content,
                'parentId': comment.parent_id
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def board_image_upload_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            if 'image' not in request.FILES:
                return JsonResponse({'error': 'No image file provided'}, status=400)
            
            image_file = request.FILES['image']
            
            from PIL import Image
            import io
            import datetime
            from .r2 import upload_file_obj_to_r2

            img = Image.open(image_file)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            buffer = io.BytesIO()
            img.save(buffer, format='WEBP')
            buffer.seek(0)
            
            date_prefix = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            original_name = getattr(image_file, 'name', 'image')
            name_without_ext = original_name.rsplit('.', 1)[0]
            object_key = f"{meeting_id}/images/{date_prefix}_{name_without_ext}.webp"
            
            uploaded_path = upload_file_obj_to_r2(buffer, object_key, content_type='image/webp')
            if uploaded_path:
                image_url = uploaded_path.replace('/', '\\') 
                api_url = f"/api/board_images/{image_url}"
                
                return JsonResponse({
                    'message': 'Upload successful',
                    'imageUrl': api_url
                })
            else:
                return JsonResponse({'error': 'Failed to upload to R2'}, status=500)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def serve_board_image_api(request, image_path):
    """
    R2에 저장된 모임 게시판 이미지를 서빙하는 API.
    직접적인 R2 URL 노출을 피하고 보안을 유지하기 위해 프록시 역할을 수행합니다.
    """
    if not request.user.is_authenticated:
        return HttpResponse('Unauthorized', status=401)
    
    from .r2 import create_r2, BUCKET
    try:
        # DB에 저장된 백슬래시(\)를 슬래시(/)로 변환 (R2 호환성)
        safe_path = image_path.replace('\\', '/')
        
        r2 = create_r2()
        # R2에서 객체 가져오기
        response = r2.get_object(Bucket=BUCKET, Key=safe_path)
        
        # HttpResponse가 아닌 FileResponse를 사용하여 스트리밍 방식으로 전달
        return FileResponse(
            response['Body'],
            content_type=response.get('ContentType', 'image/webp')
        )
    except Exception as e:
        print(f"Error serving board image ({image_path}): {e}")
        return HttpResponse(f'Image not found: {str(e)}', status=404)

@csrf_exempt
def get_schedules_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import Meeting, Schedule
    try:
        meeting = Meeting.objects.get(meeting_id=meeting_id)
        schedules = Schedule.objects.filter(meeting=meeting).order_by('start_at')
        
        data = []
        for s in schedules:
            data.append({
                'id': s.event_id,
                'title': s.title,
                'date': s.start_at.strftime('%Y-%m-%d'),
                'time': s.start_at.strftime('%H:%M'),
                'desc': s.location or s.memo,
                'type': 'money' if s.type == Schedule.ScheduleType.FEE else 'meeting'
            })
        return JsonResponse(data, safe=False)
    except Meeting.DoesNotExist:
        return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_manual_schedule_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        from .models import Meeting, Schedule
        from datetime import datetime
        
        try:
            data = json.loads(request.body)
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            
            start_str = f"{data.get('date')} {data.get('time')}"
            start_at = datetime.strptime(start_str, '%Y-%m-%d %H:%M')
            
            stype = Schedule.ScheduleType.MEETING
            if data.get('type') == 'money':
                stype = Schedule.ScheduleType.FEE
            
            schedule = Schedule.objects.create(
                meeting=meeting,
                title=data.get('title'),
                start_at=start_at,
                type=stype,
                location=data.get('location'),
                memo=data.get('description'),
                created_by=request.user,
                created_via=Schedule.CreatedVia.MANUAL
            )
            
            # --- 가입된 모든 회원에게 알림 전송 ---
            from .models import MeetingMember, Notification, UserDevice
            members = MeetingMember.objects.filter(meeting=meeting, status=MeetingMember.Status.APPROVED).exclude(user=request.user)
            
            title = f"🗓️ {meeting.name} 새로운 일정 알림"
            message = f"'{schedule.title}' 일정이 추가되었습니다! 확인해 보세요. ✨"
            
            for member in members:
                # 1. DB 알림 저장
                Notification.objects.create(
                    user=member.user,
                    meeting=meeting,
                    type=Notification.Type.SYSTEM,
                    title=title,
                    message=message
                )
                
                # 2. 푸시 알림 전송 (FCM)
                devices = UserDevice.objects.filter(user=member.user)
                if devices.exists() and firebase_admin._apps:
                    for device in devices:
                        try:
                            message_obj = messaging.Message(
                                notification=messaging.Notification(title=title, body=message),
                                token=device.fcm_token,
                            )
                            messaging.send(message_obj)
                        except Exception as e:
                            print(f"FCM 전 message send fail: {e}")

            return JsonResponse({
                'id': schedule.event_id,
                'message': '일정이 추가되었습니다.'
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_schedule_detail_api(request, meeting_id, event_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import Meeting, Schedule
    try:
        meeting = Meeting.objects.get(meeting_id=meeting_id)
        schedule = Schedule.objects.get(meeting=meeting, event_id=event_id)
        
        from .models import MeetingMember
        user_member = MeetingMember.objects.filter(meeting=meeting, user=request.user, status=MeetingMember.Status.APPROVED).first()
        user_role = user_member.role if user_member else None
        
        can_delete = (schedule.created_by == request.user) or (user_role in [MeetingMember.Role.OWNER, MeetingMember.Role.ADMIN])
        can_edit = (schedule.created_by == request.user) or (user_role == MeetingMember.Role.OWNER)

        return JsonResponse({
            'id': schedule.event_id,
            'title': schedule.title,
            'date': schedule.start_at.strftime('%Y-%m-%d'),
            'time': schedule.start_at.strftime('%H:%M'),
            'location': schedule.location,
            'description': schedule.memo,
            'type': 'money' if schedule.type == Schedule.ScheduleType.FEE else 'meeting',
            'canDelete': can_delete,
            'canEdit': can_edit
        })
    except (Meeting.DoesNotExist, Schedule.DoesNotExist):
        return JsonResponse({'error': '일정을 찾을 수 없습니다.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_attendance_api(request, meeting_id, event_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import MeetingMember, ScheduleAttendance
    try:
        members = MeetingMember.objects.filter(
            meeting_id=meeting_id,
            status=MeetingMember.Status.APPROVED
        ).select_related('user')

        attendances = {att.user_id: att for att in ScheduleAttendance.objects.filter(schedule_id=event_id)}
        
        data = []
        is_user_attending = False
        
        for m in members:
            att = attendances.get(m.user_id)
            status = att.status if att else 'NO'
            
            if m.user == request.user and status == 'YES':
                is_user_attending = True
                
            data.append({
                'id': m.user.id,
                'name': m.user.nickname or m.user.username,
                'status': status,
                'date': att.created_at.strftime('%m-%d') if att else None
            })

        return JsonResponse({
            'participants': data,
            'isAttending': is_user_attending
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def toggle_attendance_api(request, meeting_id, event_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        from .models import Schedule, ScheduleAttendance
        try:
            data = json.loads(request.body)
            status = data.get('status', 'YES')
            
            from django.utils import timezone
            attendance, created = ScheduleAttendance.objects.update_or_create(
                schedule_id=event_id,
                user=request.user,
                defaults={
                    'status': status,
                    'created_at': timezone.now()
                }
            )
            
            return JsonResponse({'message': '처리가 완료되었습니다.', 'status': status})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_schedule_api(request, meeting_id, event_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'DELETE':
        from .models import Meeting, Schedule, MeetingMember
        try:
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            schedule = Schedule.objects.get(meeting=meeting, event_id=event_id)
            
            user_member = MeetingMember.objects.filter(meeting=meeting, user=request.user, status=MeetingMember.Status.APPROVED).first()
            user_role = user_member.role if user_member else None
            
            if (schedule.created_by == request.user) or (user_role in [MeetingMember.Role.OWNER, MeetingMember.Role.ADMIN]):
                schedule.delete()
                return JsonResponse({'message': '일정이 삭제되었습니다.'})
            else:
                return JsonResponse({'error': '삭제 권한이 없습니다.'}, status=403)
                
        except (Meeting.DoesNotExist, Schedule.DoesNotExist):
            return JsonResponse({'error': '일정을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def update_schedule_api(request, meeting_id, event_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        from .models import Meeting, Schedule, MeetingMember
        from datetime import datetime
        try:
            data = json.loads(request.body)
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            schedule = Schedule.objects.get(meeting=meeting, event_id=event_id)
            
            user_member = MeetingMember.objects.filter(meeting=meeting, user=request.user, status=MeetingMember.Status.APPROVED).first()
            user_role = user_member.role if user_member else None
            
            if (schedule.created_by == request.user) or (user_role == MeetingMember.Role.OWNER):
                start_str = f"{data.get('date')} {data.get('time')}"
                start_at = datetime.strptime(start_str, '%Y-%m-%d %H:%M')
                
                stype = Schedule.ScheduleType.MEETING
                if data.get('type') == 'money':
                    stype = Schedule.ScheduleType.FEE
                
                schedule.title = data.get('title')
                schedule.start_at = start_at
                schedule.type = stype
                schedule.location = data.get('location')
                schedule.memo = data.get('description')
                schedule.save()
                
                return JsonResponse({'message': '일정이 수정되었습니다.'})
            else:
                return JsonResponse({'error': '수정 권한이 없습니다.'}, status=403)
                
        except (Meeting.DoesNotExist, Schedule.DoesNotExist):
            return JsonResponse({'error': '일정을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def ask_momo(request):
    if request.method == 'POST':
        try:
            import requests, json
            data = json.loads(request.body)
            user_question = data.get('question', '')
            
            payload = {
                "input": {"question": user_question}
            }
            
            ai_url = "http://ai:8001/momo-chat/invoke"
            
            response = requests.post(ai_url, json=payload, timeout=30)
            response.raise_for_status() 
            
            result = response.json()
            momo_answer = result.get('output', '죄송해요, 잠시 모모가 생각에 빠졌나 봐요.')

            return JsonResponse({'status': 'success', 'answer': momo_answer})

        except requests.exceptions.RequestException as e:
            print(f"AI Server Connection Error: {e}")
            return JsonResponse({'status': 'error', 'message': 'AI 서버와 연결할 수 없습니다.'}, status=503)
        except Exception as e:
            print(f"Error in ask_momo: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'fail', 'message': '잘못된 접근입니다.'}, status=405)

@csrf_exempt
def ask_calendar(request):
    if request.method == 'POST':
        try:
            import requests, json
            data = json.loads(request.body)
            user_input = data.get('input', '')
            current_date = data.get('current_date', '오늘')
            
            payload = {
                "input": {
                    "input": user_input,
                    "current_date": current_date
                }
            }
            
            ai_url = "http://ai:8001/calendar/invoke"
            
            response = requests.post(ai_url, json=payload, timeout=30)
            response.raise_for_status() 
            
            result = response.json()
            calendar_answer = result.get('output', '죄송해요, 일정을 분석하는 중에 문제가 발생했어요.')

            return JsonResponse({'status': 'success', 'answer': calendar_answer})

        except requests.exceptions.RequestException as e:
            print(f"AI Server Connection Error (Calendar): {e}")
            return JsonResponse({'status': 'error', 'message': 'AI 서버와 연결할 수 없습니다.'}, status=503)
        except Exception as e:
            print(f"Error in ask_calendar: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'fail', 'message': '잘못된 접근입니다.'}, status=405)

@csrf_exempt
def ask_search(request):
    if request.method == 'POST':
        try:
            import requests, json
            data = json.loads(request.body)
            user_input = data.get('input', '')
            
            payload = {
                "input": {"input": user_input}
            }
            
            ai_url = "http://ai:8001/search/invoke"
            
            response = requests.post(ai_url, json=payload, timeout=60)
            response.raise_for_status() 
            
            result = response.json()
            search_answer = result.get('output', '죄송해요, 정보를 검색하는 중에 문제가 발생했어요.')

            return JsonResponse({'status': 'success', 'answer': search_answer})

        except requests.exceptions.RequestException as e:
            print(f"AI Server Connection Error (Search): {e}")
            return JsonResponse({'status': 'error', 'message': 'AI 서버와 연결할 수 없습니다.'}, status=503)
        except Exception as e:
            print(f"Error in ask_search: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'fail', 'message': '잘못된 접근입니다.'}, status=405)

# --- 새로 수정한 알림 발송 API ---
@csrf_exempt
def send_notification_api(request, meeting_id):
    """
    관리자가 특정 멤버에게 알림을 전송하는 API (DB 저장 + FCM 실시간 발송)
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            # 꼭 현재 앱의 모델들을 import 해주세요!
            from .models import Meeting, MeetingMember, Notification, User, UserDevice
            
            data = json.loads(request.body)
            member_id = data.get('member_id')
            notification_type = data.get('type', 'FEE_REMINDER')
            
            # 관리자 권한 확인
            try:
                admin_member = MeetingMember.objects.get(meeting_id=meeting_id, user=request.user)
                if admin_member.role not in ['OWNER', 'ADMIN']:
                    return JsonResponse({'error': '알림 전송 권한이 없습니다.'}, status=403)
            except MeetingMember.DoesNotExist:
                return JsonResponse({'error': '모임 멤버가 아닙니다.'}, status=403)
            
            # 대상 멤버 확인
            try:
                target_member = MeetingMember.objects.get(meeting_member_id=member_id)
                target_user = target_member.user
            except MeetingMember.DoesNotExist:
                return JsonResponse({'error': '대상을 찾을 수 없습니다.'}, status=404)
            
            # 알림 메시지 설정
            title = "띵동! 회비 납부 알림이 도착했습니다 💌"
            message = "바쁘시더라도 잊지 말고 입금 부탁드려요! 🖐🏻"
            
            if notification_type == 'FEE_REMINDER':
                # 1. 알림 데이터 저장 (DB)
                Notification.objects.create(
                    user=target_user,
                    meeting_id=meeting_id,
                    type=Notification.Type.FEE_REMINDER,
                    title=title,
                    message=message
                )
                
                # 2. 파이어베이스로 진짜 알림 쏘기!
                devices = UserDevice.objects.filter(user=target_user) # 타겟 유저의 토큰 찾기
                
                if devices.exists() and firebase_admin._apps:
                    for device in devices:
                        try:
                            # 편지봉투(message_obj) 만들기
                            message_obj = messaging.Message(
                                notification=messaging.Notification(title=title, body=message),
                                token=device.fcm_token, # 받을 사람 주소(토큰)
                            )
                            # 파이어베이스 우체국에 전송!
                            response = messaging.send(message_obj)
                            print(f"🔥 FCM 푸시 전송 성공! (대상: {target_user.nickname})")
                        except Exception as e:
                            print(f"❌ FCM 푸시 전송 실패: {e}")
                
                return JsonResponse({'message': f'{target_user.nickname}님에게 알림을 전송했습니다.'})
            else:
                return JsonResponse({'error': '지원하지 않는 알림 타입입니다.'}, status=400)
                
        except Exception as e:
            print(f"Error in send_notification: {e}")
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_notifications_api(request):
    """
    현재 로그인한 유저의 읽지 않은 알림을 가져오는 API
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import Notification
    
    # 읽지 않은 알림 가져오기
    notifications = Notification.objects.filter(user=request.user, is_read=False)
    data = []
    
    for n in notifications:
        data.append({
            'id': n.notification_id,
            'type': n.type,
            'title': n.title,
            'message': n.message,
            'created_at': n.created_at.strftime('%Y-%m-%d %H:%M')
        })
        # 조회 후 읽음 처리
        n.is_read = True
        n.save()
        
    return JsonResponse({'notifications': data})

@csrf_exempt
def save_fcm_token_api(request):
    """프론트엔드에서 발급받은 FCM 토큰을 DB에 저장"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            token = data.get('token')
            
            if not token:
                return JsonResponse({'error': '토큰이 제공되지 않았습니다.'}, status=400)
            
            from .models import UserDevice
            
            device, created = UserDevice.objects.update_or_create(
                fcm_token=token,
                defaults={'user': request.user}
            )
            
            message = '새 FCM 토큰이 저장되었습니다.' if created else '기존 FCM 토큰이 업데이트되었습니다.'
            return JsonResponse({'message': message}, status=200)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# =========================
# FINANCE APIs
# =========================

@csrf_exempt
def get_transactions_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    from .models import Meeting, FinTransaction
    try:
        meeting = Meeting.objects.get(meeting_id=meeting_id)
        transactions = FinTransaction.objects.filter(meeting=meeting).order_by('-tx_date', '-created_at')
        
        data = []
        for tx in transactions:
            data.append({
                'id': tx.tx_id,
                'type': 'income' if tx.direction == 'IN' else 'expense',
                'title': tx.title,
                'subtitle': tx.memo or '',
                'author': tx.created_by.nickname or tx.created_by.username,
                'is_author': request.user == tx.created_by,
                'date': tx.tx_date.isoformat(),
                'amount': f"{'+' if tx.direction == 'IN' else '-'}{tx.amount:,}원",
                'raw_amount': tx.amount,
                'category_name': tx.category if tx.category else '기타',
                'receipt_url': tx.receipt_url
            })
        return JsonResponse(data, safe=False)
    except Meeting.DoesNotExist:
        return JsonResponse({'error': '모임을 찾을 수 없습니다.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def serve_receipt_api(request, receipt_path):
    """
    R2에 저장된 영수증 이미지를 서빙하는 API.
    직접적인 R2 URL 노출을 피하고 보안을 유지하기 위해 프록시 역할을 수행합니다.
    """
    if not request.user.is_authenticated:
        return HttpResponse('Unauthorized', status=401)
    
    from .r2 import create_r2, BUCKET
    try:
        # DB에 저장된 백슬래시(\)를 슬래시(/)로 변환 (R2 호환성)
        safe_path = receipt_path.replace('\\', '/')
        
        r2 = create_r2()
        # R2에서 객체 가져오기
        response = r2.get_object(Bucket=BUCKET, Key=safe_path)
        
        # HttpResponse가 아닌 FileResponse를 사용하여 스트리밍 방식으로 전달
        return FileResponse(
            response['Body'],
            content_type=response.get('ContentType', 'image/webp')
        )
    except Exception as e:
        print(f"Error serving receipt image ({receipt_path}): {e}")
        return HttpResponse(f'Image not found: {str(e)}', status=404)

@csrf_exempt
def create_transaction_api(request, meeting_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
    
    if request.method == 'POST':
        from .models import Meeting, FinTransaction
        import json
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST

            meeting = Meeting.objects.get(meeting_id=meeting_id)
            
            direction = 'IN' if data.get('type') == 'income' else 'OUT'
            
            # 쉼표 제거 및 숫자로 변환
            amount_str = str(data.get('amount')).replace(',', '')
            amount = int(amount_str) if amount_str else 0
            
            category_name = data.get('category_name', '기타')
            
            # 날짜 유효성 검사 추가
            tx_date_str = data.get('date')
            import datetime
            try:
                datetime.datetime.strptime(tx_date_str, "%Y-%m-%d")
            except (ValueError, TypeError):
                return JsonResponse({'error': f'유효하지 않은 날짜 형식입니다: {tx_date_str}'}, status=400)

            receipt_url = None
            if 'receipt_image' in request.FILES:
                receipt_file = request.FILES['receipt_image']
                from PIL import Image
                import io
                import datetime
                from .r2 import upload_file_obj_to_r2

                img = Image.open(receipt_file)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                buffer = io.BytesIO()
                img.save(buffer, format='WEBP')
                buffer.seek(0)

                date_prefix = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                original_name = getattr(receipt_file, 'name', 'receipt')
                name_without_ext = original_name.rsplit('.', 1)[0]
                object_key = f"{meeting_id}/receipt/{date_prefix}_{name_without_ext}.webp"

                uploaded_path = upload_file_obj_to_r2(buffer, object_key, content_type='image/webp')
                if uploaded_path:
                    receipt_url = uploaded_path.replace('/', '\\')
            
            tx = FinTransaction.objects.create(
                meeting=meeting,
                direction=direction,
                category=category_name,
                amount=amount,
                tx_date=data.get('date'),
                title=data.get('title'),
                memo=data.get('memo'),
                receipt_url=receipt_url,
                created_by=request.user,
                created_via=FinTransaction.CreatedVia.MANUAL
            )
            
            return JsonResponse({
                'id': tx.tx_id,
                'message': '거래 내역이 추가되었습니다.'
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def edit_transaction_api(request, tx_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
        
    if request.method == 'PUT':
        from .models import FinTransaction, MeetingMember
        try:
            tx = FinTransaction.objects.get(tx_id=tx_id)
            is_author = (request.user == tx.created_by)
            
            user_membership = MeetingMember.objects.filter(meeting=tx.meeting, user=request.user).first()
            role = user_membership.role if user_membership else None
            is_admin_or_owner = role in ['OWNER', 'ADMIN']
            
            if not is_author and not is_admin_or_owner:
                return JsonResponse({'error': '권한이 없습니다.'}, status=403)
                
            data = json.loads(request.body)
            direction = 'IN' if data.get('type') == 'income' else 'OUT'
            
            amount_str = str(data.get('amount')).replace(',', '')
            amount = int(amount_str)
            
            category_name = data.get('category_name', '기타')
            
            # 날짜 유효성 검사 추가
            tx_date_str = data.get('date')
            import datetime
            try:
                datetime.datetime.strptime(tx_date_str, "%Y-%m-%d")
            except (ValueError, TypeError):
                return JsonResponse({'error': f'유효하지 않은 날짜 형식입니다: {tx_date_str}'}, status=400)
            
            tx.direction = direction
            tx.category = category_name
            tx.amount = amount
            tx.tx_date = data.get('date')
            tx.title = data.get('title')
            tx.memo = data.get('memo')
            tx.save()
            
            return JsonResponse({'message': '거래 내역이 수정되었습니다.'})
        except FinTransaction.DoesNotExist:
            return JsonResponse({'error': '해당 거래 내역을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def delete_transaction_api(request, tx_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)
        
    if request.method == 'DELETE':
        from .models import FinTransaction, MeetingMember
        try:
            tx = FinTransaction.objects.get(tx_id=tx_id)
            # Only transaction author or meeting owner/admin can delete
            is_author = (request.user == tx.created_by)
            
            user_membership = MeetingMember.objects.filter(meeting=tx.meeting, user=request.user).first()
            role = user_membership.role if user_membership else None
            is_admin_or_owner = role in ['OWNER', 'ADMIN']
            
            if not is_author and not is_admin_or_owner:
                return JsonResponse({'error': '권한이 없습니다.'}, status=403)
                
            # If there's a receipt image, delete it from R2
            if tx.receipt_url:
                from .r2 import delete_file_from_r2
                delete_file_from_r2(tx.receipt_url)

            tx.delete()
            return JsonResponse({'message': '거래 내역이 삭제되었습니다.'})
        except FinTransaction.DoesNotExist:
            return JsonResponse({'error': '해당 거래 내역을 찾을 수 없습니다.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
