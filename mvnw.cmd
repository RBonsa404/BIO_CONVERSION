@REM Maven Wrapper Script for Windows
@REM Usage : mvnw.cmd clean install

@echo off
setlocal

set MAVEN_WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties
for /f "tokens=2 delims==" %%i in ('findstr "distributionUrl" "%MAVEN_WRAPPER_PROPERTIES%"') do set DISTRIBUTION_URL=%%i

set MAVEN_USER_HOME=%USERPROFILE%\.m2\wrapper\dists
set MAVEN_ZIP=%TEMP%\maven-wrapper.zip

for %%F in ("%DISTRIBUTION_URL%") do set MAVEN_DIR_NAME=%%~nF
set MAVEN_HOME=%MAVEN_USER_HOME%\%MAVEN_DIR_NAME%

if not exist "%MAVEN_HOME%" (
    echo Downloading Maven from %DISTRIBUTION_URL%
    powershell -Command "Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%MAVEN_ZIP%'"
    powershell -Command "Expand-Archive -LiteralPath '%MAVEN_ZIP%' -DestinationPath '%MAVEN_USER_HOME%'"
    del "%MAVEN_ZIP%"
)

for /r "%MAVEN_HOME%" %%f in (mvn.cmd) do set MAVEN_BIN=%%f

"%MAVEN_BIN%" %*
endlocal
