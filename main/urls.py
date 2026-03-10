from django.urls import path, re_path, include
from . import views

urlpatterns = [
    # 1. 구체적인 주소들을 위에 배치
    path('', views.public_view, name='react_login'),
    path('login/', views.public_view, name='react_login'),
    path('signup/', views.public_view, name='react_signup'),
    path('forgot-password/', views.public_view, name='react_forgot_password'),
    path('unauthorized/', views.public_view, name='unauthorized'),
    
    path('accounts/', include('allauth.urls')),
    path('main/', views.main_view, name='main'),
    path('mypage/', views.mypage_view, name='mypage'),
    path('meeting/<str:meeting_id>/detail/', views.meeting_detail_view, name='meeting_detail'),
    path('meeting/<str:meeting_id>/board/', views.meeting_board_view, name='meeting_board'),
    path('meeting/<str:meeting_id>/ocr/', views.meeting_ocr_view, name='meeting_ocr'),
    path('meeting/<str:meeting_id>/schedule/', views.meeting_schedule_view, name='meeting_schedule'),
    path('meeting/<str:meeting_id>/admin/', views.public_view, name='meeting_admin'),
    
    path('api/meetings/<str:meeting_id>/schedules/', views.get_schedules_api, name='get_schedules_api'),
    path('api/meetings/<str:meeting_id>/schedules/<int:event_id>/', views.get_schedule_detail_api, name='get_schedule_detail_api'),
    path('api/meetings/<str:meeting_id>/schedules/<int:event_id>/attendance/', views.get_attendance_api, name='get_attendance_api'),
    path('api/meetings/<str:meeting_id>/schedules/<int:event_id>/attendance/toggle/', views.toggle_attendance_api, name='toggle_attendance_api'),
    path('api/meetings/<str:meeting_id>/schedules/<int:event_id>/delete/', views.delete_schedule_api, name='delete_schedule_api'),
    path('api/meetings/<str:meeting_id>/schedules/<int:event_id>/update/', views.update_schedule_api, name='update_schedule_api'),
    path('api/meetings/<str:meeting_id>/schedules/create/', views.create_manual_schedule_api, name='create_manual_schedule_api'),
    path('api/meeting/<str:meeting_id>/ocr/upload/', views.ocr_upload_view, name='ocr_upload'),
    path('api/signup/', views.signup_api, name='signup_api'),
    path('api/check-email/', views.check_email_api, name='check_email_api'),
    path('api/login/', views.login_api, name='login_api'),
    path('api/logout/', views.logout_api, name='logout_api'),
    path('api/profile/', views.get_profile_api, name='get_profile_api'),
    path('api/profile/update/', views.update_profile_api, name='update_profile_api'),
    path('api/profile/delete/', views.delete_account_api, name='delete_account_api'),
    path('api/profile/change-password/', views.change_password_api, name='change_password_api'),
    path('api/meetings/', views.get_meetings_api, name='get_meetings_api'),
    path('api/meetings/create/', views.create_meeting_api, name='create_meeting_api'),
    path('api/meetings/join/', views.join_meeting_api, name='join_meeting_api'),
    path('api/meetings/<str:meeting_id>/', views.get_meeting_detail_api, name='get_meeting_detail_api'),
    path('api/meetings/<str:meeting_id>/pending/', views.get_pending_members_api, name='get_pending_members_api'),
    path('api/meetings/<str:meeting_id>/approve/', views.approve_member_api, name='approve_member_api'),
    path('api/meetings/<str:meeting_id>/leave/', views.leave_meeting_api, name='leave_meeting_api'),
    path('api/meetings/<str:meeting_id>/delete/', views.delete_meeting_api, name='delete_meeting_api'),
    path('api/meetings/<str:meeting_id>/members/', views.get_approved_members_api, name='get_approved_members_api'),
    path('api/meetings/<str:meeting_id>/change-role/', views.change_member_role_api, name='change_member_role_api'),
    
    # Board APIs
    path('api/meetings/<str:meeting_id>/posts/', views.get_board_posts_api, name='get_board_posts_api'),
    path('api/meetings/<str:meeting_id>/posts/create/', views.create_board_post_api, name='create_board_post_api'),
    path('api/meetings/<str:meeting_id>/posts/upload/', views.board_image_upload_api, name='board_image_upload_api'),
    path('api/board_images/<path:image_path>', views.serve_board_image_api, name='serve_board_image_api'),
    path('api/posts/<int:post_id>/delete/', views.delete_board_post_api, name='delete_board_post_api'),
    path('api/posts/<int:post_id>/like/', views.toggle_post_like_api, name='toggle_post_like_api'),
    path('api/posts/<int:post_id>/pin/', views.toggle_post_pin_api, name='toggle_post_pin_api'),
    path('api/posts/<int:post_id>/comment/', views.add_board_comment_api, name='add_board_comment_api'),
    
    # AI Chat API
    path('api/ask_momo/', views.ask_momo, name='ask_momo'),
    path('api/ask_calendar/', views.ask_calendar, name='ask_calendar'),
    path('api/ask_search/', views.ask_search, name='ask_search'),



    path('api/meetings/<str:meeting_id>/notifications/send/', views.send_notification_api, name='send_notification_api'),
    path('api/notifications/', views.get_notifications_api, name='get_notifications_api'),
    path('api/save-fcm-token/', views.save_fcm_token_api, name='save_fcm_token'),

    # Finance APIs
    path('api/meetings/<str:meeting_id>/transactions/', views.get_transactions_api, name='get_transactions_api'),
    path('api/meetings/<str:meeting_id>/transactions/create/', views.create_transaction_api, name='create_transaction_api'),
    path('api/transactions/<int:tx_id>/edit/', views.edit_transaction_api, name='edit_transaction_api'),
    path('api/transactions/<int:tx_id>/delete/', views.delete_transaction_api, name='delete_transaction_api'),
    path('api/receipts/<path:receipt_path>', views.serve_receipt_api, name='serve_receipt_api'),

    path('accounts/3rdparty/login/cancelled/', views.login_cancelled_view, name='login_cancelled'),
    # 2. 마지막에 Catch-all (리액트 라우팅용)
    # 위에서 안 걸러진 모든 주소(예: 리액트 내부 경로)는 main_view로 보냄
    re_path(r'^.*$', views.main_view), 
]