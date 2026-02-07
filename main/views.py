from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate

# Create your views here.

def login_view(request):
    # if request.method == 'POST':
    #     username = request.POST.get('username')
    #     password = request.POST.get('password')
    #     user = authenticate(request, username=username, password=password)
    #     user=1
    #     if user is not None:
    #         login(request, user)
            
    #         if not request.POST.get('remember_me'):
    #             # 체크 안 했으면 브라우저 닫을 때 삭제
    #             request.session.set_expiry(0)
    #         else:
    #             # 체크 했으면 settings.py에 설정된 기간(2주 등)만큼 유지
    #             request.session.set_expiry(None)
                
    #         return redirect('main')
    #     else:
    #         return render(request, 'login/login.html', {'error': 'Invalid credentials'})
            
    return render(request, 'login/login.html')

def main_view(request):
    return render(request, 'main/main.html')

def mypage_view(request):
    return render(request, 'mypage/mypage.html')

def meeting_detail_view(request, meeting_id):
    return render(request, 'meeting/detail.html')

def meeting_board_view(request, meeting_id):
    return render(request, 'meeting/board.html')

def meeting_ocr_view(request, meeting_id):
    return render(request, 'meeting/ocr.html')

def meeting_schedule_view(request, meeting_id):
    return render(request, 'meeting/schedule.html')
