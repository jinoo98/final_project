import os
from langchain_ollama import ChatOllama
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from dotenv import load_dotenv

load_dotenv()

# 1. 모델 설정 (Ollama - 로컬 실행)
ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://ollama:11434")
ollama_model = os.environ.get("OLLAMA_MODEL", "llama3.2")

print(f"Connecting to Ollama at {ollama_base_url} with model {ollama_model}")

model = ChatOllama(
    model=ollama_model,
    base_url=ollama_base_url,
    temperature=0.7,
)

# 2. Tavily 검색 도구 설정
search_tool = TavilySearchResults(k=3)

# 3. 검색 결과를 문자열로 합쳐주는 헬퍼 함수
def combine_search_results(results):
    if isinstance(results, list):
        return "\n".join([f"- {res.get('content', '')}" for res in results])
    return str(results)

# --- [1] 일정 도우미 체인 (Calendar Chain) ---
calendar_template = """
당신은 'MOMO(모모)' 모임 관리 서비스의 전문 AI 일정 비서입니다.
사용자의 요청을 분석하고, 제공된 [실시간 검색 결과]를 바탕으로 정중하고 전문적인 일정을 제안해 주세요.

당신의 목표는 단순한 정보 요약을 넘어, 실제 서비스의 프리미엄 컨시어지처럼 제안하는 것입니다.
- 장소 추천 시 구체적인 특징이나 장점을 언급하세요.
- 말투는 '~해 드릴게요', '~입니다'와 같이 친절하고 전문적인 어조를 유지하세요.
- 검색 결과가 있다면 적극적으로 활용하여 사용자에게 '왜 이 장소를 추천하는지'를 명확히 설명해 주세요.

결과는 반드시 아래의 JSON 형식을 따르며, **마크다운 코드 블록(```json) 없이 순수 JSON 문자열**만 출력하세요.

[응답 형식]
{{
  "title": "일정의 핵심을 담은 제목 (예: 정겨운 강남역 삼겹살 모임)",
  "date": "YYYY-MM-DD (추정 불가능할 경우 오늘 날짜로 설정)",
  "time": "HH:MM (추정 불가능할 경우 18:00로 설정)",
  "location": "추천하는 장소의 정확한 명칭",
  "description": "일정에 대한 구체적인 구성과 장소 특징 요약",
  "type": "meeting",
  "display_message": "사용자에게 보여줄 정중하고 친절한 서비스 메시지. 제안 내용에 대한 전체적인 설명과 인사를 포함하세요."
}}

[실시간 검색 결과]
{context}

[주의 사항]
- JSON 내부 문열에 따옴표가 들어갈 경우 역슬래시(\")로 반드시 이스케이프 하세요. (예: \"강남 맛집\")
- 다른 텍스트는 절대 포함하지 마세요.
- **모든 답변은 반드시 한국어로 작성해 주세요.**

사용자 입력: {input}
"""

calendar_prompt = ChatPromptTemplate.from_template(calendar_template)

from pydantic import BaseModel, Field

# 4. 입력 스키마 정의 (LangServe의 422 오류 방지 및 타입 명시)
class CalendarInput(BaseModel):
    input: str = Field(..., description="사용자의 일정 관련 요청")
    current_date: str = Field(default="오늘", description="현재 선택된 날짜 (YYYY-MM-DD)")

class SearchInput(BaseModel):
    input: str = Field(..., description="사용자의 검색 질문")

# --- [1] 일정 도우미 체인 (Calendar Chain) ---
calendar_template = """
당신은 'MOMO(모모)' 모임 관리 서비스의 전문 AI 일정 비서입니다.
사용자의 요청을 분석하고, 제공된 [실시간 검색 결과]를 바탕으로 정중하고 전문적인 일정을 제안해 주세요.

당신의 목표는 단순한 정보 요약을 넘어, 실제 서비스의 프리미엄 컨시어지처럼 제안하는 것입니다.
- 장소 추천 시 구체적인 특징이나 장점을 언급하세요.
- 말투는 '~해 드릴게요', '~입니다'와 같이 친절하고 전문적인 어조를 유지하세요.
- 검색 결과가 있다면 적극적으로 활용하여 사용자에게 '왜 이 장소를 추천하는지'를 명확히 설명해 주세요.

결과는 반드시 아래의 JSON 형식을 따르며, **마크다운 코드 블록(```json) 없이 순수 JSON 문자열**만 출력하세요.

[응답 형식]
{{
  "title": "일정의 핵심을 담은 제목 (예: 정겨운 강남역 삼겹살 모임)",
  "date": "YYYY-MM-DD (따로 언급이 없다면 반드시 제공된 [기준 날짜]인 {current_date}를 사용하세요)",
  "time": "HH:MM (추정 불가능할 경우 18:00로 설정)",
  "location": "추천하는 장소의 정확한 명칭",
  "description": "일정에 대한 구체적인 구성과 장소 특징 요약",
  "type": "meeting",
  "display_message": "사용자에게 보여줄 정중하고 친절한 서비스 메시지. 제안 내용에 대한 전체적인 설명과 인사를 포함하세요."
}}

[실시간 검색 결과]
{context}

[기준 날짜]
{current_date}

[주의 사항]
- JSON 내부 문열에 따옴표가 들어갈 경우 역슬래시(\")로 반드시 이스케이프 하세요.
- 다른 텍스트는 절대 포함하지 마세요.
- **모든 답변은 반드시 한국어로 작성해 주세요.**

사용자 입력: {input}
"""

calendar_prompt = ChatPromptTemplate.from_template(calendar_template)

def get_context(x):
    query = x.get("input", "")
    if not query:
        return "검색 결과가 없습니다."
    results = search_tool.invoke(query)
    return combine_search_results(results)

calendar_chain = (
    RunnablePassthrough.assign(
        context=get_context
    )
    | calendar_prompt 
    | model 
    | StrOutputParser()
).with_types(input_type=CalendarInput)

# --- [2] 실시간 정보 검색 체인 (Search Chain) ---
search_template = """
당신은 모임 관리 서비스 'MOMO(모모)'의 실시간 정보 도우미입니다. 
제공된 [검색 결과]를 바탕으로 사용자의 질문에 친절하게 답변하세요. 

[지침]
- 검색 결과가 있다면 이를 기반으로 답변을 구성하세요.
- 만약 검색 결과에 직접적인 답이 없다면, 당신이 아는 상식과 검색 결과를 조합해 최선의 답변을 하세요.
- 모임 관리 서비스의 성격에 맞게 정보를 가공해주면 더 좋습니다. (예: 맛집 추천 시 모임 장소로 적합한지도 언급)
- **모든 답변은 반드시 한국어로 작성해 주세요.** (Please answer in Korean only.)

[검색 결과]
{context}

사용자 질문: {input}
"""

search_prompt = ChatPromptTemplate.from_template(search_template)

search_chain = (
    RunnablePassthrough.assign(
        context=get_context
    )
    | search_prompt
    | model
    | StrOutputParser()
).with_types(input_type=SearchInput)
