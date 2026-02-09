# 🐳 Docker 실행 가이드 (Docker Setup Guide)

이 문서는 프로젝트를 **Docker 환경**에서 쉽고 빠르게 실행하기 위한 가이드입니다. 
복잡한 파이썬/DB 설치 과정 없이 Docker만 있으면 바로 실행할 수 있습니다.

## 📋 1. 사전 준비 (Prerequisites)

컴퓨터에 Docker가 설치되어 있어야 합니다.
- **Windows/Mac**: [Docker Desktop 설치](https://www.docker.com/products/docker-desktop/)
- **Linux**: Docker Engine & Docker Compose 설치

설치 후 터미널에서 다음 명령어로 확인합니다:
```bash
docker -v
docker-compose -v
```

---

## 🚀 2. 실행 방법 (Run)

### 2.1 서버 실행
터미널을 열고 프로젝트 폴더(`final_project`)에서 아래 명령어를 입력합니다.

```bash
# 이미지를 빌드하고 컨테이너를 실행합니다 (백그라운드 실행 시 -d 옵션 추가)
docker-compose up --build
```
- 처음 실행 시 이미지를 다운로드 받고 빌드하느라 시간이 조금 걸릴 수 있습니다.
- "Successfully built" 메시지가 나오고 서버 로그가 보이면 성공입니다.
- 브라우저에서 `http://localhost:8000` 으로 접속해보세요.

### 2.2관리자 계정 생성 (Superuser)
서버가 켜져 있는 상태에서 **새로운 터미널 창**을 열고 아래 명령어를 입력합니다.

```bash
# 실행 중인 'web' 컨테이너 안에서 manage.py createsuperuser 명령어 실행
docker-compose exec web python manage.py createsuperuser
```
안내에 따라 아이디와 비밀번호를 입력하면 생성됩니다.

### 2.3 서버 종료
서버가 실행 중인 터미널에서 `Ctrl + C`를 누르면 종료됩니다.
또는 다른 터미널에서:
```bash
docker-compose down
```

---

## 🛠️ 3. 자주 쓰는 명령어 (Commands)

### 데이터베이스 마이그레이션 (DB Update)
모델(`models.py`)을 수정한 경우:
```bash
# 1. 마이그레이션 파일 생성
docker-compose exec web python manage.py makemigrations

# 2. DB에 적용
docker-compose exec web python manage.py migrate
```

### 새로운 라이브러리 추가
`pyproject.toml`에 라이브러리를 추가한 경우, 이미지를 다시 빌드해야 적용됩니다.
```bash
docker-compose up --build
```
또는 실행 중인 컨테이너 안에서 추가할 수도 있습니다 (임시):
```bash
docker-compose exec web poetry add 패키지명
```
*주의: 컨테이너 안에서 `poetry add`를 했다면, 호스트의 `pyproject.toml`과 `poetry.lock` 파일도 동기화되었는지 확인해 주세요. Docker volume 설정에 의해 동기화됩니다.*

---

## ⚠️ 4. 문제 해결 (Troubleshooting)

**Q. 코드 수정이 바로 반영되나요?**
A. 네, `docker-compose.yml`에 볼륨(`volumes`) 설정이 되어 있어서, 로컬에서 파일을 저장하면 컨테이너에도 즉시 반영되고 서버가 재시작됩니다.

**Q. "Port already in use" 에러가 나요.**
A. 8000번 포트를 다른 프로그램이 사용 중일 수 있습니다. 해당 프로그램을 끄거나, `docker-compose.yml` 파일에서 포트를 변경하세요 (예: `"8001:8000"`).

**Q. 실행이 안 되고 에러가 나요.**
A. `docker-compose logs` 명령어로 전체 로그를 확인해 보세요.
