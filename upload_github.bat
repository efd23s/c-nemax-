@echo off
title GitHub'a Yayinla - CineStream Pro
cd /d "%~dp0"
echo ========================================================
echo        CineStream+ Pro GitHub Yayinlayici
echo ========================================================
echo.
set /p GITHUB_TOKEN="Lutfen GitHub Personal Access Token (PAT) girin: "
if "%GITHUB_TOKEN%"=="" (
    echo Token girilmedi. Cikis yapiliyor...
    pause
    exit /b
)
python deploy_to_github.py %GITHUB_TOKEN%
pause
