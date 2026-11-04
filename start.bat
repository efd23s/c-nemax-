@echo off
title CineStream+ Web Platformu
cd /d "%~dp0"
echo ===================================================
echo     CineStream+ Gelismis Dizi ve Film Izleme Web Sitesi
echo ===================================================
echo Sunucu baslatiliyor...
start http://localhost:5000
python server.py
pause
