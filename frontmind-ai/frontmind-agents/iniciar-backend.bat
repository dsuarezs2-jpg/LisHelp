@echo off

cd /d "C:\Users\Home\Desktop\New Tesis\frontmind-ai\frontmind-ai\frontmind-agents"

call venv\Scripts\activate

python -m uvicorn main:app --reload

pause