# Android Studio Panda Installation Checklist

## ✅ Pre-Installation (Do This Now While Downloading)

### 1. Check System Requirements
- [ ] Windows 10/11 64-bit
- [ ] At least 8 GB RAM (16 GB recommended)
- [ ] At least 8 GB free disk space
- [ ] Administrator access

### 2. Prepare Installation Location
- [ ] Decide where to install (default: `C:\Program Files\Android\Android Studio`)
- [ ] Ensure you have enough space on C: drive

### 3. Close Unnecessary Programs
- [ ] Close browsers (except the download tab)
- [ ] Close heavy applications
- [ ] This will speed up installation

## 📥 Download Status

**File**: `android-studio-2024.1.1.12-windows.exe` (Panda)
**Size**: ~1.1 GB
**Status**: ⏳ Downloading...

## 🚀 Installation Steps (After Download Completes)

### Step 1: Run Installer
```
1. Locate the downloaded file (usually in Downloads folder)
2. Right-click → "Run as administrator"
3. Click "Yes" on UAC prompt
```

### Step 2: Installation Wizard
```
1. Welcome screen → Click "Next"
2. Choose components → Keep all checked → Click "Next"
   ✅ Android Studio
   ✅ Android Virtual Device
3. Install location → Keep default → Click "Next"
4. Start Menu folder → Keep default → Click "Install"
5. Wait 5-10 minutes for installation
6. ✅ Check "Start Android Studio" → Click "Finish"
```

### Step 3: First Launch Setup
```
1. Import settings → "Do not import settings" → Click "OK"
2. Data sharing → Choose preference → Click "Next"
3. Welcome → Click "Next"
4. Install Type → Select "Standard" → Click "Next"
5. UI Theme → Choose Light or Darcula → Click "Next"
6. Verify Settings → Review → Click "Next"
7. License Agreement → Accept all → Click "Finish"
8. ⏳ Wait 15-30 minutes for SDK downloads
9. Click "Finish" when done
```

## ⚙️ Post-Installation Configuration

### Step 4: Set Environment Variables
```powershell
# Open PowerShell as Administrator and run:

# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', "$env:LOCALAPPDATA\Android\Sdk", 'User')

# Add to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = "$currentPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\tools;$env:LOCALAPPDATA\Android\Sdk\tools\bin"
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')

# Verify (open NEW PowerShell window)
adb --version
```

### Step 5: Configure SDK (In Android Studio)
```
1. Click "More Actions" → "SDK Manager"
2. SDK Platforms tab:
   ✅ Android 13.0 (Tiramisu) - API 33
   ✅ Android 12.0 (S) - API 31
   Click "Apply" → "OK"
3. SDK Tools tab:
   ✅ Android SDK Build-Tools
   ✅ Android Emulator
   ✅ Android SDK Platform-Tools
   ✅ Google Play services
   Click "Apply" → "OK"
4. Wait for downloads (10-20 minutes)
```

### Step 6: Create Emulator
```
1. Click "More Actions" → "Virtual Device Manager"
2. Click "Create Device"
3. Select "Pixel 5" → Click "Next"
4. Select "Tiramisu" (API 33) → Click "Download"
5. Wait for download → Click "Next"
6. AVD Name: "Pixel_5_API_33" → Click "Finish"
7. Click ▶️ to test emulator
```

## 📱 Open Agrinext Project

### Step 7: Open Project
```
1. In Android Studio, click "Open"
2. Navigate to: J:\Aws_hackathon\mobile
3. Click "OK"
4. Click "Trust Project"
5. Wait for Gradle sync (5-10 minutes)
```

### Step 8: Configure Project
```
1. Verify mobile/.env file exists:
   API_BASE_URL=http://3.239.184.220:3000/api/v1

2. If Gradle sync fails, run:
   cd J:\Aws_hackathon\mobile
   npm install --legacy-peer-deps
```

### Step 9: Run the App
```
1. Select emulator from device dropdown
2. Click green ▶️ Run button
3. Wait for build (5-10 minutes first time)
4. App should launch on emulator
```

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Download Android Studio | 10-30 min (depends on internet) |
| Install Android Studio | 10 min |
| First launch SDK download | 15-30 min |
| Configure SDK & tools | 15-20 min |
| Create emulator | 10-15 min |
| Open project & Gradle sync | 10 min |
| First app build | 10-15 min |
| **TOTAL** | **1.5-2.5 hours** |

## 🐛 Common Issues & Quick Fixes

### Issue: "SDK location not found"
```
File → Project Structure → SDK Location
Set: C:\Users\[YourUsername]\AppData\Local\Android\Sdk
```

### Issue: "Gradle sync failed"
```powershell
cd J:\Aws_hackathon\mobile\android
.\gradlew clean
```

### Issue: "Emulator won't start"
```
1. Enable virtualization in BIOS (Intel VT-x or AMD-V)
2. Install Intel HAXM from SDK Manager
```

### Issue: "ADB not found"
```powershell
# Restart ADB
adb kill-server
adb start-server
```

## 📋 What to Do While Waiting

During the long download/install times, you can:

1. ✅ Read the full setup guide: `ANDROID-STUDIO-SETUP.md`
2. ✅ Check your mobile app code: `mobile/src/`
3. ✅ Verify backend is running: http://3.239.184.220:3000/health
4. ✅ Test API with web UI: http://localhost:8080/test-ui.html
5. ✅ Review mobile app features in `MOBILE-APP-SETUP-GUIDE.md`

## 🎯 Success Criteria

You'll know everything is working when:
- ✅ Android Studio opens without errors
- ✅ `adb --version` works in PowerShell
- ✅ Emulator boots and shows Android home screen
- ✅ Agrinext project opens without Gradle errors
- ✅ App builds and runs on emulator
- ✅ You can see the Agrinext login screen

## 📞 Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Look in the Troubleshooting section of `ANDROID-STUDIO-SETUP.md`
3. Share the error message with me
4. Check Android Studio's "Event Log" (bottom right)

---

**Current Status**: ⏳ Downloading Android Studio Panda...

**Next Step**: Once download completes, run the installer as administrator!
