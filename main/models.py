from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


# =========================
# USER / AUTH
# =========================
class User(AbstractUser):
    """
    ERD(논리):
      - user_id(PK)  -> Django에서는 기본 PK인 id를 사용 (자동 생성)
      - email        -> unique
      - password     -> AbstractUser가 관리
      - nickname     -> 추가 필드
    """
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=50, blank=True)
    adress = models.CharField(max_length=255, blank=True, help_text="OO시 OO동 까지만 입력")
    birthday = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10, 
        choices=[('M', '남성'), ('F', '여성')], 
        blank=True
    )



    # 이메일을 로그인 ID로 사용
    USERNAME_FIELD = "email"
    # createsuperuser 등에서 요구할 필드(이메일을 USERNAME_FIELD로 쓰면 username을 요구하는 경우가 많아서 남겨두는 게 안전)
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.nickname or self.email


class UserSocialAccount(models.Model):
    """
    ERD: user_social_account
      - social_id (PK)
      - user (FK -> User)
      - provider (GOOGLE/NAVER/KAKAO)
      - provider_user_id
      - connected_at
    """
    class Provider(models.TextChoices):
        GOOGLE = "GOOGLE", "Google"
        NAVER = "NAVER", "Naver"
        KAKAO = "KAKAO", "Kakao"

    social_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="social_accounts")
    provider = models.CharField(max_length=20, choices=Provider.choices)
    provider_user_id = models.CharField(max_length=255)
    connected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "provider_user_id"],
                name="uq_social_provider_user",
            )
        ]

    def __str__(self):
        return f"{self.user_id} - {self.provider}"



import random
import string

def generate_meeting_code():
    """10자리의 영문 대문자와 숫자 조합의 고유 코드 생성"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

# =========================
# MEETING
# =========================
class Meeting(models.Model):
    """
    ERD: CREATE TABLE meeting (
      meeting_id      VARCHAR(20) PRIMARY KEY,
      owner_user_id   INTEGER NOT NULL,
      ...
    );
    """
    meeting_id = models.CharField(primary_key=True, max_length=20, default=generate_meeting_code)
    owner = models.ForeignKey(User, on_delete=models.PROTECT, related_name="owned_meetings")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, help_text="모여서 하는 활동에 대한 간단한 설명")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MeetingMember(models.Model):
    """
    ERD: CREATE TABLE meeting_member (
      meeting_member_id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id        INTEGER NOT NULL,
      user_id           INTEGER NOT NULL,
      email             TEXT NOT NULL,
      ...
    );
    """
    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"
        ADMIN = "ADMIN", "Admin"
        MEMBER = "MEMBER", "Member"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    meeting_member_id = models.AutoField(primary_key=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="meeting_memberships")
    email = models.EmailField()
    role = models.CharField(max_length=10, choices=Role.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.APPROVED)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["meeting", "user"], name="uq_meeting_user")
        ]


class MeetingInvite(models.Model):
    """
    ERD: CREATE TABLE meeting_invite (
      invite_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id   INTEGER NOT NULL,
      ...
    );
    """
    invite_id = models.AutoField(primary_key=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="invites")
    invite_code = models.CharField(max_length=64, unique=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_invites"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)


# =========================
# SCHEDULE
# =========================
class Schedule(models.Model):
    """
    ERD: CREATE TABLE schedule (
      event_id            INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id          INTEGER NOT NULL,
      ...
    );
    """
    class CreatedVia(models.TextChoices):
        MANUAL = "MANUAL", "Manual"
        AI = "AI", "AI"

    class ScheduleType(models.TextChoices):
        MEETING = "MEETING", "Meeting"
        ADMIN = "ADMIN", "Admin"
        FEE = "FEE", "Fee"
        OTHER = "OTHER", "Other"

    event_id = models.AutoField(primary_key=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="schedules")
    title = models.CharField(max_length=200)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField(null=True, blank=True)
    is_all_day = models.BooleanField(default=False)
    type = models.CharField(max_length=30, choices=ScheduleType.choices, default=ScheduleType.MEETING)
    color = models.CharField(max_length=30, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    memo = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_schedules")
    created_via = models.CharField(max_length=10, choices=CreatedVia.choices, default=CreatedVia.MANUAL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ScheduleAttendance(models.Model):
    attendance_id = models.AutoField(primary_key=True)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name="attendances")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="schedule_attendances")
    status = models.CharField(max_length=10, choices=[('YES', 'Yes'), ('NO', 'No')], default='YES')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('schedule', 'user')


class ScheduleAIRequest(models.Model):
    """
    ERD: CREATE TABLE schedule_ai_request (
      request_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      ...
    );
    """
    request_id = models.AutoField(primary_key=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="ai_requests")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_requests")
    prompt_text = models.TextField()
    result_json = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


# =========================
# FINANCE
# =========================
class FinCategory(models.Model):
    """
    ERD: CREATE TABLE fin_category (
      category_id  INTEGER PRIMARY KEY AUTOINCREMENT,
      ...
    );
    """
    category_id = models.AutoField(primary_key=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="fin_categories")
    name = models.CharField(max_length=50)
    direction = models.CharField(max_length=3, choices=models.TextChoices('Direction', ['IN', 'OUT']).choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["meeting", "name", "direction"], name="uq_fin_category")
        ]


class FinTransaction(models.Model):
    """
    ERD: CREATE TABLE fin_transaction (
      tx_id              INTEGER PRIMARY KEY AUTOINCREMENT,
      ...
    );
    """
    class Direction(models.TextChoices):
        IN_ = "IN", "IN"
        OUT = "OUT", "OUT"

    class CreatedVia(models.TextChoices):
        MANUAL = "MANUAL", "Manual"
        OCR = "OCR", "OCR"
        AI = "AI", "AI"

    tx_id = models.AutoField(primary_key=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="fin_transactions")
    direction = models.CharField(max_length=3, choices=Direction.choices)
    category = models.ForeignKey(FinCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions")
    amount = models.PositiveIntegerField()
    tx_date = models.DateField()
    title = models.CharField(max_length=200)
    memo = models.TextField(null=True, blank=True)

    payer_member = models.ForeignKey(
        MeetingMember, on_delete=models.SET_NULL, null=True, blank=True, related_name="paid_in_transactions"
    )
    paid_by_member = models.ForeignKey(
        MeetingMember, on_delete=models.SET_NULL, null=True, blank=True, related_name="paid_out_transactions"
    )

    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_transactions")
    created_via = models.CharField(max_length=10, choices=CreatedVia.choices, default=CreatedVia.MANUAL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["meeting", "tx_date"], name="idx_tx_meeting_date"),
        ]


class FinAttachment(models.Model):
    """
    ERD: CREATE TABLE fin_attachment (
      attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      ...
    );
    """
    attachment_id = models.AutoField(primary_key=True)
    tx = models.ForeignKey(FinTransaction, on_delete=models.CASCADE, related_name="attachments")
    type = models.CharField(max_length=30)  # IMAGE/FILE/LINK
    file_url = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)


# =========================
# BOARD
# =========================
class BoardPost(models.Model):
    """
    ERD: CREATE TABLE board_post (
      post_id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ...
    );
    """
    class Status(models.TextChoices):
        VISIBLE = "VISIBLE", "Visible"
        HIDDEN = "HIDDEN", "Hidden"
        DELETED = "DELETED", "Deleted"

    post_id = models.AutoField(primary_key=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name="posts")
    title = models.CharField(max_length=200)
    content = models.TextField()
    image_url = models.URLField(max_length=500, null=True, blank=True)
    post_date = models.DateField(null=True, blank=True)
    is_notice = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.VISIBLE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["meeting", "created_at"], name="idx_post_meeting_created"),
        ]


class BoardImage(models.Model):
    """
    게시글에 첨부된 여러 이미지를 저장하는 모델
    """
    post = models.ForeignKey(BoardPost, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class BoardComment(models.Model):
    """
    ERD: CREATE TABLE board_comment (
      comment_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      ...
    );
    """
    class Status(models.TextChoices):
        VISIBLE = "VISIBLE", "Visible"
        DELETED = "DELETED", "Deleted"

    comment_id = models.AutoField(primary_key=True)
    post = models.ForeignKey(BoardPost, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name="comments")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    content = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.VISIBLE)
    created_at = models.DateTimeField(auto_now_add=True)


class BoardLike(models.Model):
    """
    ERD: CREATE TABLE board_like (
      post_id    INTEGER NOT NULL,
      user_id    INTEGER NOT NULL,
      ...
      PRIMARY KEY (post_id, user_id),
      ...
    );
    """
    post = models.ForeignKey(BoardPost, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_posts")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["post", "user"], name="uq_board_post_user_like")
        ]


# =========================
# RECEIPT (OCR)
# =========================
class Receipt(models.Model):
    """
    ERD: CREATE TABLE receipt (
      receipt_id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ...
    );
    """
    receipt_id = models.AutoField(primary_key=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="receipts")
    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="uploaded_receipts")
    image_url = models.URLField(max_length=500)
    ocr_raw_text = models.TextField(null=True, blank=True)
    store_name = models.CharField(max_length=200, null=True, blank=True)
    total_amount = models.PositiveIntegerField(null=True, blank=True)
    purchased_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["meeting", "created_at"], name="idx_receipt_meeting_created"),
        ]


class ReceiptItem(models.Model):
    """
    ERD: CREATE TABLE receipt_item (
      receipt_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      ...
    );
    """
    receipt_item_id = models.AutoField(primary_key=True)
    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, related_name="items")
    item_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.PositiveIntegerField(null=True, blank=True)
    line_amount = models.PositiveIntegerField(null=True, blank=True)
# =========================
# NOTIFICATION
# =========================
class Notification(models.Model):
    """
    유저별 알림 정보를 저장하는 모델
    """
    class Type(models.TextChoices):
        FEE_REMINDER = "FEE_REMINDER", "회비 납부 알림"
        SYSTEM = "SYSTEM", "시스템 알림"

    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.user.nickname}: {self.title}"


class UserDevice(models.Model):
    # 유저 한 명이 여러 기기(PC, 모바일 등)를 쓸 수 있으므로 ForeignKey 사용
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='devices')
    fcm_token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}의 기기 ({self.fcm_token[:10]}...)"
