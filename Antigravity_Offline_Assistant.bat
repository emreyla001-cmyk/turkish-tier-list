@echo off
title Antigravity Offline Assistant & Security Arbiter
color 0A
cls

:MENU
echo =======================================================================
echo          ANTIGRAVITY OFFLINE ASSISTANT & MULTI-BRAIN ARBITER
echo =======================================================================
echo.
echo   [1] Yerel Çevrimdışı AI İncelemesi Yap (Ollama Llama 3.2 - Plan A)
echo   [2] Statik Güvenlik & İş Mantığı Taraması (Plan E)
echo   [3] Pre-Commit & ReDoS Güvenlik Denetimi (Plan E)
echo   [4] Özel Soru / Kod İncelemesi Gönder
echo   [5] Çıkış
echo.
echo =======================================================================
set /p choice=Lütfen bir seçenek girin (1-5): 

if "%choice%"=="1" goto OLLAMA_REVIEW
if "%choice%"=="2" goto STATIC_AUDIT
if "%choice%"=="3" goto DUAL_BRAIN
if "%choice%"=="4" goto CUSTOM_QUERY
if "%choice%"=="5" exit

echo.
echo Geçersiz seçenek! Tekrar deneyin.
timeout /t 2 >nul
goto MENU

:OLLAMA_REVIEW
cls
echo =======================================================================
echo   YEREL ÇEVRİMDİŞİ AI İNCELEMESİ ÇALIŞTIRILIYOR (Ollama Plan A)...
echo =======================================================================
echo.
cd /d C:\Users\EMRE\Desktop\turkish-tier-list-TAM
python scripts\ollama_arbiter.py "Son yapılan kod değişikliklerini güvenlik, sınır değerler ve VERIFICATION_RULES.md açısından incele."
echo.
echo =======================================================================
echo İnceleme Tamamlandı.
pause
goto MENU

:STATIC_AUDIT
cls
echo =======================================================================
echo   STATİK GÜVENLİK & İŞ MANTIĞI TARAMASI ÇALIŞTIRILIYOR...
echo =======================================================================
echo.
cd /d C:\Users\EMRE\Desktop\turkish-tier-list-TAM
python scripts\business_logic_audit.py
echo.
echo =======================================================================
echo Tarama Tamamlandı.
pause
goto MENU

:DUAL_BRAIN
cls
echo =======================================================================
echo   PRE-COMMIT & REDOS GÜVENLİK DENETİMİ ÇALIŞTIRILIYOR...
echo =======================================================================
echo.
cd /d C:\Users\EMRE\Desktop\turkish-tier-list-TAM
python scripts\dual_brain_arbiter.py
echo.
echo =======================================================================
echo Denetim Tamamlandı.
pause
goto MENU

:CUSTOM_QUERY
cls
echo =======================================================================
echo   ÖZEL SORU / KOD İNCELEMESİ
echo =======================================================================
echo.
set /p custom_prompt=Sorunuzu veya inceleme talebinizi yazın: 
echo.
cd /d C:\Users\EMRE\Desktop\turkish-tier-list-TAM
python scripts\ollama_arbiter.py "%custom_prompt%"
echo.
echo =======================================================================
echo Yanıt Tamamlandı.
pause
goto MENU
