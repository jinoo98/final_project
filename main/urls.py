from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('main/', views.main_view, name='main'),
    path('mypage/', views.mypage_view, name='mypage'),
    path('meeting/<int:meeting_id>/detail/', views.meeting_detail_view, name='meeting_detail'),
    path('meeting/<int:meeting_id>/board/', views.meeting_board_view, name='meeting_board'),
    path('meeting/<int:meeting_id>/ocr/', views.meeting_ocr_view, name='meeting_ocr'),
    path('meeting/<int:meeting_id>/schedule/', views.meeting_schedule_view, name='meeting_schedule'),
]
