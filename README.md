# 🚀 final_project

이 프로젝트는 Django와 Poetry를 기반으로 한 최종 프로젝트입니다.

## 🛠️ 개발 환경 (Prerequisites)
- **Python**: 3.12 버전 이상 (3.13 권장)
- **Poetry**: 의존성 관리 도구
- **django**: 웹 프레임워크 5.1.0 버전 이상
- **python-dotenv**: env파일 관리 1.2.1버전 이상 

## 📥 설치 및 실행 방법 (Setup & Installation)

### 1. 저장소 복제 (Git Clone)
먼저 프로젝트 코드를 로컬 컴퓨터로 가져옵니다.
```bash
# 저장소 복사
git clone [https://github.com/jinoo98/final_project.git](https://github.com/jinoo98/final_project.git)
cd final_project

# poetry 설치 (안 되어 있을 경우)
pip install poetry

# 가상환경 생성 및 패키지 설치
python -m poetry install

# 데이터베이스 마이그레이션
python -m poetry run python manage.py migrate

# 서버 실행
python -m poetry run python manage.py runserver
```

## 2. 🤝 Git 협업 가이드 (Git Usage)

팀 프로젝트에서 코드를 안전하게 공유하기 위해 아래 순서를 지켜주세요.

### 작업을 시작하기 전 (필수)
상대방이 올린 최신 코드를 먼저 내 컴퓨터로 가져와야 합니다.
```bash
# 최신 코드 로컬로 가져오기
git pull origin main

# 파일 추가
git add .

# commit 메시지와 저장소 업데이트
git commit -m "feat: 어떤 기능을 추가했는지 적어주세요"

# 자신의 브랜치에 업데이트
git push origin [본인의-브랜치-이름]
```

## 3. 🤝 Git 브랜치 생성
main 브랜치는 최종 배포용이므로, 모든 기능 개발은 새로운 브랜치를 생성해서 진행합니다.
```bash
# 새로운 브랜치를 만들고 바로 이동합니다.
git checkout -b feature/기능이름

# 현재 브랜치 확인
git branch

# 1. main 브랜치로 이동
git checkout main

# 2. 내 브랜치의 내용을 main에 합침
git merge feature/[기능이름]  # ex)feature/Login, feature/SignUp

# 3. 합쳐진 최신 main을 서버에 올림
git push origin main
```

## 4. 🗄️ 데이터베이스 업데이트 (Database Migration)

장고에서는 모델(models.py)의 구조를 변경(테이블 생성, 컬럼 추가 등)하면 반드시 아래 두 단계를 거쳐 데이터베이스에 반영해야 합니다.
`models.py`를 수정한 후, 장고가 바뀐 내용을 이해할 수 있도록 설계도 파일(migration 파일)을 생성합니다.

```bash
# Step 1: 설계도 만들기 (makemigrations)
python -m poetry run python manage.py makemigrations

# ⚠️ 컬럼 추가 시 나타나는 선택지 (중요!)
# 이미 데이터가 있는 상태에서 새로운 컬럼을 추가하고 `makemigrations`를 실행하면 아래와 같은 메시지가 뜰 수 있습니다:

# ```text
# It is impossible to add a non-nullable field '새컬럼명' to '모델명' without specifying a default...
# 1) Provide a one-off default now (make sure the docs explain why...)
# 2) Quit, and let me add a default in models.py
# Select an option:

# 다음 화면에서는 1번을 누르고 '' 또는 엔터를 누르면 Null값이 자동으로 채워집니다

# Step 2: 설계도 만들기 (makemigrations)
python -m poetry run python manage.py migrate

```
