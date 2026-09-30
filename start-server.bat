@echo off
title DonationCare - Local Server
echo =======================================================
echo    DonationCare - Donation Management System
echo    Connected to Firebase Cloud Firestore
echo =======================================================
echo.
echo Starting local web server on http://localhost:8000...
start http://localhost:8000/index.html
python -m http.server 8000
pause
