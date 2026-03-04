from fastapi import FastAPI
from langserve import add_routes
import os
from dotenv import load_dotenv

# Import custom chains
from chain_customer import momo_chain
from chain_scheduleAI import calendar_chain, search_chain

load_dotenv()

app = FastAPI(
    title="MOMO AI Customer Center",
    version="1.0",
    description="MOMO 서비스 가이드를 제공하는 AI 챗봇 API 서버"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Routes
# Add Routes
# Add Routes
add_routes(
    app,
    momo_chain,
    path="/customer-center",
)

# User requested path
add_routes(
    app,
    momo_chain,
    path="/momo-chat",
)

add_routes(
    app,
    calendar_chain,
    path="/calendar",
)

add_routes(
    app,
    search_chain,
    path="/search",
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
