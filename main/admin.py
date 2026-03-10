from django.contrib import admin
from .models import (
    User, UserSocialAccount, Meeting, MeetingMember, MeetingInvite,
    Schedule, ScheduleAIRequest, FinTransaction,
    BoardPost, BoardComment, BoardLike
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # User model uses the default 'id' PK now
    list_display = ('id', 'email', 'nickname', 'is_staff', 'is_active')
    search_fields = ('email', 'nickname')
    list_filter = ('is_staff', 'is_active', 'date_joined')

@admin.register(UserSocialAccount)
class UserSocialAccountAdmin(admin.ModelAdmin):
    list_display = ('social_id', 'user', 'provider', 'connected_at')
    list_filter = ('provider',)
    search_fields = ('user__email', 'provider_user_id')

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('meeting_id', 'owner', 'name', 'created_at')
    search_fields = ('name', 'owner__email')
    list_filter = ('created_at',)

@admin.register(MeetingMember)
class MeetingMemberAdmin(admin.ModelAdmin):
    list_display = ('meeting_member_id', 'meeting', 'user', 'email', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('meeting__name', 'user__email', 'email')

@admin.register(MeetingInvite)
class MeetingInviteAdmin(admin.ModelAdmin):
    list_display = ('invite_id', 'meeting', 'invite_code', 'created_at', 'expires_at')
    search_fields = ('invite_code',)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'meeting', 'title', 'type', 'start_at', 'created_via')
    list_filter = ('type', 'created_via', 'start_at')
    search_fields = ('title', 'location')

@admin.register(ScheduleAIRequest)
class ScheduleAIRequestAdmin(admin.ModelAdmin):
    list_display = ('request_id', 'meeting', 'user', 'created_at')

@admin.register(FinTransaction)
class FinTransactionAdmin(admin.ModelAdmin):
    list_display = ('tx_id', 'meeting', 'direction', 'category', 'amount', 'tx_date', 'title', 'receipt_url')
    list_filter = ('direction', 'category', 'created_via', 'tx_date')
    search_fields = ('title', 'memo', 'category')


@admin.register(BoardPost)
class BoardPostAdmin(admin.ModelAdmin):
    list_display = ('post_id', 'meeting', 'author', 'title', 'is_notice', 'status', 'created_at')
    list_filter = ('is_notice', 'status', 'created_at')
    search_fields = ('title', 'content')

@admin.register(BoardComment)
class BoardCommentAdmin(admin.ModelAdmin):
    list_display = ('comment_id', 'post', 'author', 'status', 'created_at')
    list_filter = ('status', 'created_at')

@admin.register(BoardLike)
class BoardLikeAdmin(admin.ModelAdmin):
    # BoardLike uses default 'id' PK
    list_display = ('id', 'post', 'user', 'created_at')
