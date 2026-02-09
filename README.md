# 🚀 final_project

이 프로젝트는 Django와 Poetry를 기반으로 한 최종 프로젝트입니다.

## 🛠️ 개발 환경 (Prerequisites)
- **Python**: 3.12 버전 이상 (3.13 권장)
- **Poetry**: 의존성 관리 도구
- **django**: 웹 프레임워크 5.1.0 버전 이상
- **python-dotenv**: env파일 관리 1.2.1버전 이상 

## 🐳 Docker로 간편 실행 (Recommended)

Docker가 설치되어 있다면 복잡한 설정 없이 바로 실행할 수 있습니다.
자세한 내용은 [🐳 DOCKER_GUIDE.md](./DOCKER_GUIDE.md) 파일을 참고하세요.

```bash
# 서버 실행 (빌드 포함)
docker-compose up --build
```

---

## 📥 (직접 설치) 로컬 개발 환경 설정 (Manual Setup)

Docker를 사용하지 않고 직접 파이썬 환경을 구성하려면 아래 단계를 따르세요.

### 1. 저장소 복제 (Git Clone)
먼저 프로젝트 코드를 로컬 컴퓨터로 가져옵니다.
```bash
# 저장소 복사
git clone https://github.com/jinoo98/final_project.git
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

## 5. 📦 라이브러리 추가 및 관리 (Dependency Management)

프로젝트에 새로운 기능이 필요하여 외부 라이브러리를 설치할 때는 반드시 `poetry` 명령어를 사용해야 팀원들과 개발 환경을 동기화할 수 있습니다.

### 라이브러리 설치하기 (Add)
```bash
# 최신 버전으로 설치할 때
python -m poetry add 라이브러리이름

# 특정 버전을 지정해서 설치할 때
python -m poetry add 라이브러리이름>=버전
# 예: python -m poetry add django>=5.1.0

```

### 라이브러리 버전 확인하기 (Show)
만약 현재 설치된 라이브러리의 정확한 버전이 궁금하거나, 어떤 라이브러리들이 있는지 확인하고 싶을 때 사용합니다.

```bash
# 전체 설치된 라이브러리 목록과 버전 확인
python -m poetry show

# 특정 라이브러리의 상세 정보와 버전 확인
python -m poetry show 라이브러리이름

```

### 팀원이 추가한 라이브러리 내 컴퓨터에 반영하기
다른 팀원이 새로운 라이브러리를 추가해서 pyproject.toml 파일을 업데이트했다면, 내 컴퓨터에서도 아래 명령어를 실행해야 합니다.

```bash
# 최신화된 설정을 내 가상환경에 적용
python -m poetry install

# pyproject.toml changed significantly since poetry.lock was last generated. Run `poetry lock` to fix the lock file. 
# poetry.lock 파일이 pyproject.toml 파일보다 최신 버전이 아니면 아래 명령어를 실행
python -m poetry lock

```

### 💡 라이브러리 버전 연산자 가이드 (Version Operators)

| 연산자 | 위치 | 의미 | 예시 |
| :--- | :--- | :--- | :--- |
| **`@`** | **터미널** | 특정 버전을 지칭하여 설치할 때 사용 | `python -m poetry add django@5.1.0` |
| **`==`** | **파일 내** | 정확히 해당 버전만 사용하도록 강제 | `python -m poetry add django==5.1.0` |
| **`>=`** | **파일/터미널** | 최소 버전 이상이라면 어떤 것이든 허용 | `python -m poetry add django>=5.1.0` |
| **`>`** | **파일/터미널** | 해당 버전보다 더 높은 버전만 허용 | `python -m poetry add django>5.1.0` |

> **팁:** 터미널에서 `>` 또는 `>=` 기호를 사용할 때는 명령어 오류 방지를 위해 반드시 따옴표(`" "`)로 감싸주어야 합니다.

