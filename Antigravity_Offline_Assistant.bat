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
echo   [1] Yerel AI Kod Ve Guvenlik Incelemesi Yap (Ollama Plan A)
echo   [2] Statik Guvenlik Ve Is Mantigi Taramasi (Plan E)
echo   [3] Pre-Commit Ve ReDoS Guvenlik Denetimi (Plan E)
echo   [4] Yapay Zekayla Kesintisiz Sohbet Et (Sohbet Modu)
echo   [5] Cikis
echo.
echo =======================================================================
set choice=
set /p choice=Lutfen bir secenek girin (1-5): 

if "%choice%"=="1" goto OLLAMA_REVIEW
if "%choice%"=="2" goto STATIC_AUDIT
if "%choice%"=="3" goto DUAL_BRAIN
if "%choice%"=="4" goto INTERACTIVE_CHAT
if "%choice%"=="5" goto END

echo.
echo Gecersiz secenek! Tekrar deneyin.
timeout /t 2 >nul
goto MENU

:OLLAMA_REVIEW
cls
cd /d "C:\Users\EMRE\Desktop\turkish-tier-list-TAM"
py -3 "scripts\ollama_arbiter.py" --audit "Son yapilan kod degisikliklerini guvenlik ve sinir degerler acisindan Turkce incele."
echo.
pause
goto MENU

:STATIC_AUDIT
cls
cd /d "C:\Users\EMRE\Desktop\turkish-tier-list-TAM"
py -3 "scripts\business_logic_audit.py"
echo.
pause
goto MENU

:DUAL_BRAIN
cls
cd /d "C:\Users\EMRE\Desktop\turkish-tier-list-TAM"
py -3 "scripts\dual_brain_arbiter.py"
echo.
pause
goto MENU

:INTERACTIVE_CHAT
cls
cd /d "C:\Users\EMRE\Desktop\turkish-tier-list-TAM"
py -3 "scripts\ollama_arbiter.py" --interactive
goto MENU

:END
exit
