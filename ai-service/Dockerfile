FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY main.py .

ENV PORT=8001
ENV MCP_SERVER_URL=http://mcp-server:8002
ENV LLM_MODEL=gemini-3.7-flash

EXPOSE 8001

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
