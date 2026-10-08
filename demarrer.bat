@echo off
rem Lance BioConversion sur ce poste sans PostgreSQL ni Docker (profil "local", base H2).
rem Prerequis : Java 17 ou plus, Node.js 22 ou plus.
setlocal
cd /d "%~dp0"

where java >nul 2>nul || (echo Java 17 ou plus est requis : https://adoptium.net & exit /b 1)
where npm >nul 2>nul || (echo Node.js 22 ou plus est requis : https://nodejs.org & exit /b 1)

echo [1/2] Construction du frontend...
pushd frontend
if not exist node_modules call npm ci --no-audit --no-fund || (popd & exit /b 1)
call npm run build || (popd & exit /b 1)
popd

echo [2/2] Demarrage de l'application sur http://localhost:8080 (Ctrl+C pour arreter)
call mvnw.cmd -q spring-boot:run -Dspring-boot.run.profiles=local
endlocal
