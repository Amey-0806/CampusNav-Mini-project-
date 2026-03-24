@echo off
echo =========================================
echo Setting up the Campus Chatbot
echo =========================================
echo.

echo 1. Installing required Python packages...
python -m pip install -r backend\requirements.txt

echo.
echo 2. Opening the Chat Interface in your browser...
start frontend\index.html

echo.
echo 3. Starting the Backend AI Server...
echo Keep this window open! You can minimize it.
python backend\main.py

pause
