# 🚀 final_project

이 프로젝트는 Django와 Poetry를 기반으로 한 최종 프로젝트입니다.

## 🛠️ 개발 환경 (Prerequisites)
- **Python**: 3.12 버전 이상 (3.13 권장)
- **Poetry**: 의존성 관리 도구

## 📥 설치 및 실행 방법 (Setup & Installation)

### 1. 저장소 복제 (Git Clone)
먼저 프로젝트 코드를 로컬 컴퓨터로 가져옵니다.
```bash
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