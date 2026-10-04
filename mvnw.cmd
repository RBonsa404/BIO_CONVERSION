@REM Maven Wrapper Script for Windows
@REM Usage : mvnw.cmd clean install

@echo off
setlocal

set MAVEN_WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties
for /f "tokens=2 delims==" %%i in ('findstr "distributionUrl" "%MAVEN_WRAPPER_PROPERTIES%"') do set DISTRIBUTION_URL=%%i

set MAVEN_USER_HOME=%USERPROFILE%\.m2\wrapper\dists
set MAVEN_ZIP=%TEMP%\maven-wrapper.zip

set MAVEN_HOME=%MAVEN_USER_HOME%\apache-maven-3.9.9

if not exist "%MAVEN_HOME%" (
    echo Downloading Maven from %DISTRIBUTION_URL%
    powershell -Command "Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%MAVEN_ZIP%'"
    powershell -Command "Expand-Archive -Force -LiteralPath '%MAVEN_ZIP%' -DestinationPath '%MAVEN_USER_HOME%'"
    del "%MAVEN_ZIP%"
)
for /r "%MAVEN_USER_HOME%" %%f in (mvn.cmd) do (
    if exist "%%~dpfbin\mvn.cmd" set MAVEN_BIN=%%~dpfbin\mvn.cmd
)
if "%MAVEN_BIN%"=="" (
    for /r "%MAVEN_USER_HOME%" %%f in (mvn.cmd) do (
        if "%%~nxf"=="mvn.cmd" if exist "%%f" set MAVEN_BIN=%%f
    )
)

"%MAVEN_BIN%" %*
endlocal
