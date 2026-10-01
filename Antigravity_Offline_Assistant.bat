@echo off
title Antigravity Offline Assistant
color 0A
cls

:MENU
cls
echo =======================================================================
echo          ANTIGRAVITY CEVRIMDISI ASISTAN VE HAKEM SISTEMI
echo =======================================================================
echo.
echo   [1] Yerel Cevrimdisi AI Incelemesi Yap (Ollama Llama 3.2 - Plan A)
echo   [2] Statik Guvenlik Ve Is Mantigi Taramasi (Plan E)
echo   [3] Pre-Commit Ve ReDoS Guvenlik Denetimi (Plan E)
echo   [4] Ozel Soru / Kod Incelemesi Gonder
echo   [5] Cikis
echo.
echo =======================================================================
set choice=
set /p choice=Lutfen bir secenek girin (1-5): 

if "%choice%"=="1" goto OLLAMA_REVIEW
if "%choice%"=="2" goto STATIC_AUDIT
if "%choice%"=="3" goto DUAL_BRAIN
if "%choice%"=="4" goto CUSTOM_QUERY
if "%choice%"=="5" goto END

echo.
echo Gecersiz secenek! Tekrar deneyin.
timeout /t 2 >nul
goto MENU

:OLLAMA_REVIEW
cls
echo =======================================================================
echo   YEREL CEVRIMDISI AI INCELEMESI CALISTIRILIYOR (Ollama Plan A)...
echo =======================================================================
echo.
cd /d "C:\Users\EMRE\Desktop\turkish-tier-list-TAM"
py -3 "scripts\ollama_arbiter.py" "Son yapilan kod degisikliklerini guvenlik, sinir degerler ve VERIFICATION_RULES.md acisindan Turkce olarak incele."
echo.
echo =======================================================================
echo Inceleme Tamamlandi.
pause
goto MENU

:STATIC_AUDIT
cls
echo =======================================================================
echo   STATIK GUVENLIK VE IS MANTIGI TARAMASI CALISTIRILIYOR...
echo =======================================================================
echo.
cd /d "C:\Users\EMRE\Desktop\turkish-tier-list-TAM"
py -3 "scripts\business_logic_audit.py"
echo.
echo =======================================================================
echo Tarama Tamamlandi.
pause
goto MENU

:DUAL_BRAIN
cls
echo =======================================================================
echo   PRE-COMMIT VE REDOS GUVENLIK DENETIMI CALISTIRILIYOR...
echo =======================================================================
echo.
cd /d "C:\Users\EMRE\Desktop\turkish-tier-list-TAM"
py -3 "scripts\dual_brain_arbiter.py"
echo.
echo =======================================================================
echo Denetim Tamamlandi.
pause
goto MENU

:CUSTOM_QUERY
cls
echo =======================================================================
echo   OZEL SORU / KOD INCELEMESI
echo =======================================================================
echo.
set custom_prompt=
set /p custom_prompt=Sorunuzu veya inceleme talebinizi yazin: 
echo.
cd /d "C:\Users\EMRE\Desktop\turkish-tier-list-TAM"
py -3 "scripts\ollama_arbiter.py" "%custom_prompt%"
echo.
echo =======================================================================
echo Yanit Tamamlandi.
pause
goto MENU

:END
exit
