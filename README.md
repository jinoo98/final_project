# 🚀 final_project

이 프로젝트는 Django와 Poetry를 기반으로 한 최종 프로젝트입니다.
**이제 Docker 환경에서 개발 및 실행됩니다.**

## 🛠️ 개발 환경 (Prerequisites)
- **Docker**: Docker Desktop 또는 Docker Engine & Compose가 설치되어 있어야 합니다.
- **Git**: 소스 코드 버전 관리

## 📥 설치 및 실행 방법 (Setup & Installation)

### 1. 저장소 복제 (Git Clone)
먼저 프로젝트 코드를 로컬 컴퓨터로 가져옵니다.
```bash
# 저장소 복사
git clone https://github.com/jinoo98/final_project.git
cd final_project
```

### 2. Docker로 서버 실행 (Recommended)
복잡한 설치 과정 없이 Docker만 있으면 바로 실행할 수 있습니다.
```bash
# 이미지를 빌드하고 컨테이너 실행
docker-compose up --build
```
- 처음 실행 시 이미지가 없으면 자동으로 빌드합니다.
- 실행이 완료되면 브라우저에서 `http://localhost:8000` 으로 접속하세요.
- **서버 종료**: `Ctrl + C` 또는 다른 터미널에서 `docker-compose down`

---

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

## 4. 🗄️ 데이터베이스 업데이트 (Database Migration - Docker)

모델(`models.py`)을 수정한 경우, 실행 중인 Docker 컨테이너 안에서 명령어를 실행해야 합니다.

```bash
# Step 1: 설계도 만들기 (makemigrations)
docker-compose exec web python manage.py makemigrations

# Step 2: DB에 적용 (migrate)
docker-compose exec web python manage.py migrate
```

- **관리자 계정 생성 (Superuser)**
```bash
docker-compose exec web python manage.py createsuperuser
```

## 5. 📦 라이브러리 추가 및 관리 (Dependency Management - Docker)

프로젝트에 외부 라이브러리를 추가할 때는 `poetry`를 사용하며, 컨테이너 환경과 로컬 환경을 동기화해야 합니다.

### 라이브러리 설치하기 (Add)
```bash
# 실행 중인 컨테이너에 라이브러리 추가
docker-compose exec web poetry add 라이브러리이름
# 예: docker-compose exec web poetry add django>=5.1.0
```
> **중요**: 컨테이너 안에서 `poetry add`를 실행하면, 호스트(내 컴퓨터)의 `pyproject.toml`과 `poetry.lock` 파일도 자동으로 업데이트됩니다 (Docker Volume 설정 덕분).

### 라이브러리 변경 사항 반영 (Rebuild)
`pyproject.toml`이 변경되었다면, 이미지를 다시 빌드해야 컨테이너 환경에 반영됩니다.
```bash
# 컨테이너 중지 후 다시 빌드 및 실행
docker-compose down
docker-compose up --build
```

### 라이브러리 목록 확인 (Show)
```bash
docker-compose exec web poetry show
```

### 동료가 추가한 라이브러리 적용
다른 팀원이 라이브러리를 추가해서 `pyproject.toml`이 변경된 채로 `pull`을 받았다면:
```bash
# 이미지를 다시 빌드하여 의존성 설치
docker-compose up --build
```

---

## 📥 (참고) 로컬 직접 설치 (Manual Setup - Legacy)
<details>
<summary>Docker를 사용하지 않는 경우 (클릭하여 펼치기)</summary>

### 1. 프로젝트 설정
```bash
# poetry 설치
pip install poetry

# 패키지 설치
python -m poetry install

# DB 마이그레이션
python -m poetry run python manage.py migrate

# 서버 실행
python -m poetry run python manage.py runserver
```
</details>
