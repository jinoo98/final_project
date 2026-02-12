import os
import mimetypes
import boto3
from botocore.client import Config

# ——— 설정 ———
ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
SECRET_KEY = os.getenv("R2_SECRET_KEY")
ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
BUCKET    = os.getenv("R2_BUCKET")

def upload_to_r2(file_path):
    # 업로드할 로컬 파일 경로
    local_file = os.path.expanduser(file_path)

    # ——— MIME 타입 자동 추측 ———
    content_type, _ = mimetypes.guess_type(local_file)
    if content_type is None:
        content_type = 'application/octet-stream'

    # R2에 저장될 객체 키 (thumbnail 폴더)
    object_key = f"test/{os.path.basename(local_file)}"

# ——— R2 S3 클라이언트 생성 ———
    r2 = boto3.client(
        's3',
        endpoint_url=f'https://{ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name='auto',
        config=Config(signature_version='s3v4'),
    )

    # ——— 업로드 옵션 ———
    extra_args = {
        'ContentType': content_type
    }

    # ——— 파일 업로드 ———
    try:
        r2.upload_file(local_file, BUCKET, object_key, ExtraArgs=extra_args)
        print(f"✅ Uploaded → {BUCKET}/{object_key} (ContentType: {content_type})")
    except Exception as e:
        print(f"❌ Upload failed: {e}")
