# 1. 파이썬 3.12 슬림 버전 이미지 사용 (경량화)
FROM python:3.12-slim

# 2. 환경 변수 설정
# PYTHONDONTWRITEBYTECODE=1: .pyc 파일 생성 방지 (디스크 쓰기 최소화)
# PYTHONUNBUFFERED=1: 로그를 버퍼링 없이 즉시 출력 (디버깅 용이)
# POETRY_VERSION: Poetry 버전 고정
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=2.3.2

# 3. 작업 디렉토리 설정
# /app은 컨테이너 내부의 경로입니다. 호스트(내 컴퓨터)에 이 폴더가 없어도 됩니다.
WORKDIR /app

# 4. 필요한 시스템 패키지 설치
# --no-install-recommends: 필수 패키지만 설치하여 이미지 크기 줄임
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Poetry 설치
RUN pip install "poetry==$POETRY_VERSION"

# 6. 의존성 파일만 먼저 복사 (캐싱 활용)
COPY pyproject.toml poetry.lock* /app/

# 7. 가상환경 생성 없이 시스템에 직접 패키지 설치 (컨테이너 내부이므로 안전)
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

# 8. 나머지 프로젝트 코드 전체 복사
COPY . /app/

# 9. 포트 개방
EXPOSE 8000

# 10. 서버 실행 명령어
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]