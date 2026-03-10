import os
import mimetypes
import boto3
from botocore.client import Config

# ——— 설정 ———
ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
SECRET_KEY = os.getenv("R2_SECRET_KEY")
ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
BUCKET    = os.getenv("R2_BUCKET")

def create_r2():
    r2 = boto3.client(
        's3',
        endpoint_url=f'https://{ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name='auto',
        config=Config(signature_version='s3v4'),
    )
    return r2

def upload_file_obj_to_r2(file_obj, object_key, content_type='application/octet-stream'):
    """
    메모리나 버퍼에 있는 파일 객체를 직접 R2에 업로드합니다.
    """
    r2 = create_r2()

    extra_args = {
        'ContentType': content_type
    }

    try:
        r2.upload_fileobj(file_obj, BUCKET, object_key, ExtraArgs=extra_args)
        print(f"✅ Uploaded (Obj) → {BUCKET}/{object_key} (ContentType: {content_type})")
        # 저장 경로 (단순 문자열 반환 등)
        return f"{object_key}"
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return None
