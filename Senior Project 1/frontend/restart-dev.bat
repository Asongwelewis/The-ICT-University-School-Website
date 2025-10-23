@echo off
echo 🔄 Restarting Next.js Development Server...
echo ==========================================

REM Kill any existing Next.js processes
taskkill /f /im node.exe 2>nul

REM Clear Next.js cache
if exist ".next" (
    echo 🗑️ Clearing Next.js cache...
    rmdir /s /q .next
)

REM Clear node_modules cache (optional)
REM if exist "node_modules\.cache" (
REM     echo 🗑️ Clearing node_modules cache...
REM     rmdir /s /q "node_modules\.cache"
REM )

echo 🚀 Starting development server...
npm run dev