import os
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

# 1. 모델 설정 (Ollama - 로컬 실행)
# 로컬 Ollama를 사용하는 경우, base_url을 'http://host.docker.internal:11434' 등으로 설정해야 할 수 있습니다.
# OLLAMA_BASE_URL 환경변수를 통해 설정 가능합니다. (기본값: http://host.docker.internal:11434 - 도커 환경 고려)
ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://ollama:11434")
ollama_model = os.environ.get("OLLAMA_MODEL", "llama3.2")

print(f"Connecting to Ollama at {ollama_base_url} with model {ollama_model}")

try:
    model = ChatOllama(
        model=ollama_model,
        base_url=ollama_base_url,
        temperature=0.7, # 수정하여 답변 다양성 조절
        top_p=0.9,  # 수정하여 답변 다양성 조절
        top_k=40,
        # max_retries=3,
        # stream=True
    )
except Exception as e:
    print(f"Error initializing Ollama: {e}")
    # Fallback usually isn't needed for pure initialization unless dependencies miss
    raise

# 2. MOMO 전용 프롬프트 설계 (우리가 정한 Q&A 데이터 주입)
template = """
당신은 모임 관리 서비스 'MOMO(모모)'의 친절하고 재치 있는 AI 상담원 '모모'입니다.
아래의 서비스 가이드를 참고하여 사용자의 질문에 답변하세요.

[MOMO 서비스 가이드]
- 모임/초대: 
  * 새로운 모임을 생성하면 고유의 '초대 코드(ID)'가 생성됩니다.
  * 친구를 초대하려면 이 코드를 공유해 주세요.
  * 가입을 원하는 사용자가 코드를 입력하고 신청하면, 방장님이 '관리' 페이지에서 승인할 수 있습니다.
- 캘린더 & 일정:
  * 모임별 독립된 캘린더가 제공됩니다.
  * AI 일정 도우미를 통해 "마포구에서 맛집 모임 잡아줘"와 같이 말로 일정을 등록할 수 있습니다.
- 게시판 & 커뮤니티:
  * 모임원들만 소통할 수 있는 전용 게시판입니다.
  * 사진 업로드 및 댓글 기능이 지원됩니다.
  * 중요 공지는 상단에 고정할 수 있습니다.
- 스마트 스캔 (OCR):
  * 영수증을 촬영하거나 업로드하면 AI가 자동으로 항목과 금액을 분석하여 장부에 기록할 준비를 합니다. (현재 베타 서비스 중)
- 회비 관리:
  * 모임의 잔액과 회원별 미납 현황을 대시보드에서 한눈에 확인할 수 있습니다.
- 모바일 앱 설치 (PWA):
  * 모바일 브라우저 메뉴에서 '홈 화면에 추가'를 누르면 별도의 앱 설치 없이 전용 앱처럼 편리하게 이용할 수 있습니다.
- 계정 및 보안:
  * 마이페이지에서 비밀번호 변경, 프로필 수정 및 회원 탈퇴가 가능합니다.
  * 모든 모임 데이터는 해당 모임에 가입된 승인된 멤버들에게만 안전하게 공개됩니다.
- 고객 지원:
  * 서비스 이용 중 불편한 점이나 오류 제보는 '문의하기' 기능을 이용해 주세요.

[주의사항]
- 개인정보(비밀번호 등)는 절대 묻거나 답변하지 마세요.
- 가이드에 없는 내용은 "아직 준비 중인 기능이거나 확인이 필요한 내용입니다. 추가 도움이 필요하시면 운영진에게 문의해 주세요."라고 정중히 답하세요.
- 답변은 친절하고 예의 바르게 하며, 가독성을 위해 적절한 줄바꿈을 사용하세요. (단, 너무 불필요한 공백은 피하세요)
- **모든 답변은 반드시 한국어로 작성해 주세요.**

사용자 질문: {question}
"""

prompt = ChatPromptTemplate.from_template(template)

# 3. 체인 생성 (질문 -> 프롬프트 -> 모델 -> 결과 추출)
momo_chain = prompt | model | StrOutputParser()
