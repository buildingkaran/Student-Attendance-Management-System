@echo off
echo ===================================================
echo Git Repository Setup - Attendance Management System
echo Student: Karan Kumar (Roll: 24107030)
echo ===================================================

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/download/win and rerun this script.
    pause
    exit /b 1
)

echo Initializing Git repository...
git init

echo Staging all project files...
git add .

echo Creating initial commit...
git commit -m "feat: complete Full Stack Student Attendance Management System for B.Voc SD Sem V"

echo Renaming default branch to main...
git branch -M main

echo.
echo ===================================================
echo [SUCCESS] Git repository initialized successfully!
echo To push to your GitHub repository, run:
echo   git remote add origin https://github.com/<your-username>/<repo-name>.git
echo   git push -u origin main
echo ===================================================
pause
