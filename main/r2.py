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

def delete_file_from_r2(object_key):
    """
    R2에서 파일을 삭제합니다.
    """
    if not object_key:
        return False
        
    r2 = create_r2()
    # 만약 백슬래시가 포함되어 있다면 슬래시로 변경 (저장 시 replace('/', '\\') 처리가 되어 있는 경우 대비)
    object_key = object_key.replace('\\', '/')
    
    try:
        r2.delete_object(Bucket=BUCKET, Key=object_key)
        print(f"✅ Deleted → {BUCKET}/{object_key}")
        return True
    except Exception as e:
        print(f"❌ Deletion failed: {e}")
        return False
