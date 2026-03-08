# Android Studio Setup Guide for Agrinext Mobile App

## System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: 8 GB minimum (SSD recommended)
- **Screen Resolution**: 1280 x 800 minimum

## Step 1: Download Android Studio

1. Go to the official Android Studio website:
   ```
   https://developer.android.com/studio
   ```

2. Click the **"Download Android Studio"** button

3. Accept the terms and conditions

4. The download will start automatically (approximately 1 GB)
   - File name: `android-studio-2024.x.x.x-windows.exe`

## Step 2: Install Android Studio

1. **Run the installer**:
   - Locate the downloaded `.exe` file
   - Right-click and select "Run as administrator"

2. **Installation wizard**:
   - Click "Next" on the welcome screen
   - **Choose components**: Keep all defaults checked
     - ✅ Android Studio
     - ✅ Android Virtual Device
   - Click "Next"

3. **Choose install location**:
   - Default: `C:\Program Files\Android\Android Studio`
   - Click "Next"

4. **Choose Start Menu folder**:
   - Keep default: "Android Studio"
   - Click "Install"

5. **Wait for installation** (5-10 minutes)

6. **Complete installation**:
   - ✅ Check "Start Android Studio"
   - Click "Finish"

## Step 3: Android Studio First Launch Setup

1. **Import settings**:
   - Select "Do not import settings"
   - Click "OK"

2. **Data sharing**:
   - Choose your preference (either option works)
   - Click "Next"

3. **Welcome screen**:
   - Click "Next"

4. **Install Type**:
   - Select **"Standard"** (recommended)
   - Click "Next"

5. **Select UI Theme**:
   - Choose "Light" or "Darcula" (dark theme)
   - Click "Next"

6. **Verify Settings**:
   - Review the components to be downloaded:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device
   - Note the SDK location: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk`
   - Click "Next"

7. **License Agreement**:
   - Click "Accept" for all licenses
   - Click "Finish"

8. **Downloading Components** (15-30 minutes):
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform (latest version)
   - Wait for all downloads to complete

9. **Setup Complete**:
   - Click "Finish"

## Step 4: Configure Android SDK

1. **Open SDK Manager**:
   - Click "More Actions" → "SDK Manager"
   - Or: `Tools` → `SDK Manager`

2. **SDK Platforms tab**:
   - ✅ Check **Android 13.0 (Tiramisu)** - API Level 33
   - ✅ Check **Android 12.0 (S)** - API Level 31
   - ✅ Check **Android 11.0 (R)** - API Level 30
   - Click "Apply" → "OK"

3. **SDK Tools tab**:
   - ✅ Check "Android SDK Build-Tools"
   - ✅ Check "Android Emulator"
   - ✅ Check "Android SDK Platform-Tools"
   - ✅ Check "Intel x86 Emulator Accelerator (HAXM installer)"
   - ✅ Check "Google Play services"
   - Click "Apply" → "OK"

4. **Wait for downloads** (10-20 minutes)

## Step 5: Set Up Environment Variables

1. **Open System Environment Variables**:
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Press Enter
   - Click "Advanced" tab
   - Click "Environment Variables"

2. **Add ANDROID_HOME**:
   - Under "User variables", click "New"
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk`
   - Click "OK"

3. **Update Path variable**:
   - Under "User variables", select "Path"
   - Click "Edit"
   - Click "New" and add:
     ```
     %ANDROID_HOME%\platform-tools
     ```
   - Click "New" and add:
     ```
     %ANDROID_HOME%\tools
     ```
   - Click "New" and add:
     ```
     %ANDROID_HOME%\tools\bin
     ```
   - Click "OK" on all windows

4. **Verify installation**:
   - Open a **NEW** PowerShell window
   - Run:
     ```powershell
     adb --version
     ```
   - You should see: `Android Debug Bridge version X.X.X`

## Step 6: Create Android Virtual Device (AVD)

1. **Open AVD Manager**:
   - In Android Studio, click "More Actions" → "Virtual Device Manager"
   - Or: `Tools` → `Device Manager`

2. **Create Virtual Device**:
   - Click "Create Device"

3. **Select Hardware**:
   - Category: "Phone"
   - Select: **"Pixel 5"** (recommended)
   - Click "Next"

4. **Select System Image**:
   - Release Name: **"Tiramisu"** (API Level 33)
   - ABI: **x86_64**
   - Click "Download" next to the system image
   - Wait for download (1-2 GB)
   - Click "Next"

5. **Verify Configuration**:
   - AVD Name: "Pixel_5_API_33"
   - Startup orientation: Portrait
   - Click "Show Advanced Settings" (optional):
     - RAM: 2048 MB (adjust based on your system)
     - Internal Storage: 2048 MB
   - Click "Finish"

6. **Test the emulator**:
   - Click the ▶️ (Play) button next to your AVD
   - Wait for emulator to boot (2-5 minutes first time)
   - You should see an Android home screen

## Step 7: Install Java Development Kit (JDK)

Android Studio includes a JDK, but let's verify:

1. **Check JDK**:
   - Open PowerShell
   - Run:
     ```powershell
     java -version
     ```

2. **If Java is not found**:
   - In Android Studio: `File` → `Project Structure` → `SDK Location`
   - Note the JDK location (usually bundled with Android Studio)
   - Add to Path if needed

## Step 8: Open Agrinext Mobile Project

1. **Open Android Studio**

2. **Open Project**:
   - Click "Open"
   - Navigate to: `J:\Aws_hackathon\mobile`
   - Click "OK"

3. **Trust Project**:
   - Click "Trust Project"

4. **Gradle Sync**:
   - Android Studio will automatically start syncing
   - Wait for "Gradle sync finished" (5-10 minutes first time)
   - Check the "Build" tab at the bottom for progress

5. **If Gradle sync fails**:
   - Check the error message
   - Common fixes:
     ```powershell
     cd J:\Aws_hackathon\mobile\android
     .\gradlew clean
     ```

## Step 9: Configure the Mobile App

1. **Verify .env file**:
   - Open `mobile/.env`
   - Should contain:
     ```
     API_BASE_URL=http://3.239.184.220:3000/api/v1
     ```

2. **Update API URL for emulator** (if testing on emulator):
   - Android emulator uses `10.0.2.2` to access host machine's localhost
   - If backend is on localhost, use:
     ```
     API_BASE_URL=http://10.0.2.2:3000/api/v1
     ```
   - If backend is on EC2 (your case), keep:
     ```
     API_BASE_URL=http://3.239.184.220:3000/api/v1
     ```

## Step 10: Run the App

1. **Start the emulator**:
   - Click the device dropdown (top toolbar)
   - Select your AVD: "Pixel_5_API_33"
   - Wait for emulator to boot

2. **Run the app**:
   - Click the green ▶️ (Run) button
   - Or press `Shift + F10`

3. **Wait for build** (5-10 minutes first time):
   - Watch the "Build" tab for progress
   - The app will automatically install on the emulator

4. **App launches**:
   - You should see the Agrinext splash screen
   - Then the login screen

## Troubleshooting

### Issue: "SDK location not found"
**Solution**:
- `File` → `Project Structure` → `SDK Location`
- Set Android SDK location: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk`

### Issue: "Gradle sync failed"
**Solution**:
```powershell
cd J:\Aws_hackathon\mobile\android
.\gradlew clean
.\gradlew build
```

### Issue: "Emulator won't start"
**Solution**:
- Enable virtualization in BIOS (Intel VT-x or AMD-V)
- Install Intel HAXM:
  - Go to: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk\extras\intel\Hardware_Accelerated_Execution_Manager`
  - Run `intelhaxm-android.exe`

### Issue: "App crashes on launch"
**Solution**:
- Check the Logcat tab in Android Studio
- Verify API_BASE_URL in `.env` file
- Check backend is running: `http://3.239.184.220:3000/health`

### Issue: "Build failed - React Native version mismatch"
**Solution**:
```powershell
cd J:\Aws_hackathon\mobile
rm -rf node_modules
npm install --legacy-peer-deps
cd android
.\gradlew clean
```

## Quick Reference Commands

```powershell
# Check ADB
adb --version

# List connected devices
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Clear app data
adb shell pm clear com.agrinext

# View app logs
adb logcat | Select-String "ReactNative"

# Rebuild app
cd J:\Aws_hackathon\mobile\android
.\gradlew clean
.\gradlew assembleDebug
```

## Next Steps After Installation

1. ✅ Android Studio installed
2. ✅ SDK configured
3. ✅ Emulator created
4. ✅ Project opened
5. ✅ Environment variables set
6. 🔄 Run the app
7. 🔄 Test authentication flow
8. 🔄 Test disease detection
9. 🔄 Test AI advisory

## Estimated Time

- **Download**: 30-45 minutes
- **Installation**: 15-20 minutes
- **Configuration**: 10-15 minutes
- **First build**: 10-15 minutes
- **Total**: ~1.5-2 hours

## System Performance Tips

1. **Close unnecessary applications** during first build
2. **Use SSD** for Android SDK location if possible
3. **Allocate enough RAM** to emulator (2-4 GB)
4. **Enable hardware acceleration** (HAXM for Intel, Hyper-V for AMD)
5. **Disable antivirus** temporarily during first build (can slow down Gradle)

---

**Ready to start?** Follow the steps above in order. If you encounter any issues, check the Troubleshooting section or let me know!
