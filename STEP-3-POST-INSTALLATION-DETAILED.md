# Step 3: Post-Installation Configuration (DETAILED)

## ✅ What You've Completed
- ✅ Step 1: Downloaded Android Studio Panda
- ✅ Step 2: Installed Android Studio and completed first launch setup
- ✅ SDK components downloaded

## 🎯 What We'll Do Now (Step 3)

You need to configure:
1. Environment Variables (so Windows can find Android tools)
2. Additional SDK components
3. Create an Android Emulator
4. Open your Agrinext project

---

## PART A: Set Up Environment Variables (5 minutes)

### Why do we need this?
Environment variables tell Windows where to find Android SDK tools like `adb` (Android Debug Bridge). Without this, you can't run commands or connect to devices.

### Step-by-Step Instructions:

#### Option 1: Using PowerShell (RECOMMENDED - Fastest)

1. **Open PowerShell as Administrator**:
   - Press `Win + X`
   - Click "Windows PowerShell (Admin)" or "Terminal (Admin)"
   - Click "Yes" on the UAC prompt

2. **Copy and paste these commands ONE BY ONE**:

```powershell
# First, let's find your username
$username = $env:USERNAME
Write-Host "Your username is: $username"

# Set ANDROID_HOME environment variable
$androidHome = "C:\Users\$username\AppData\Local\Android\Sdk"
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidHome, 'User')
Write-Host "✅ ANDROID_HOME set to: $androidHome"

# Get current PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')

# Add Android tools to PATH (only if not already there)
$platformTools = "$androidHome\platform-tools"
$tools = "$androidHome\tools"
$toolsBin = "$androidHome\tools\bin"

if ($currentPath -notlike "*$platformTools*") {
    $newPath = "$currentPath;$platformTools;$tools;$toolsBin"
    [System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
    Write-Host "✅ Added Android tools to PATH"
} else {
    Write-Host "✅ Android tools already in PATH"
}

Write-Host "`n✅ Environment variables configured!"
Write-Host "⚠️  IMPORTANT: Close this PowerShell window and open a NEW one to test"
```

3. **Close PowerShell and open a NEW PowerShell window** (not as admin, regular is fine)

4. **Verify it worked**:
```powershell
# Test 1: Check ANDROID_HOME
echo $env:ANDROID_HOME
# Should show: C:\Users\[YourUsername]\AppData\Local\Android\Sdk

# Test 2: Check ADB
adb --version
# Should show: Android Debug Bridge version X.X.X

# Test 3: List available commands
adb
# Should show ADB help text
```

5. **If you see the version numbers, SUCCESS! ✅ Move to Part B**

#### Option 2: Using GUI (If PowerShell method didn't work)

1. **Open System Properties**:
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Press Enter

2. **Open Environment Variables**:
   - Click "Advanced" tab
   - Click "Environment Variables" button at bottom

3. **Add ANDROID_HOME**:
   - Under "User variables for [YourName]" section (top half)
   - Click "New..."
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk`
     - Replace `[YourUsername]` with your actual Windows username
   - Click "OK"

4. **Edit PATH variable**:
   - Still in "User variables" section
   - Find and select "Path"
   - Click "Edit..."
   - Click "New" and add: `%ANDROID_HOME%\platform-tools`
   - Click "New" and add: `%ANDROID_HOME%\tools`
   - Click "New" and add: `%ANDROID_HOME%\tools\bin`
   - Click "OK" on all windows

5. **Verify** (open NEW PowerShell):
```powershell
adb --version
```

---

## PART B: Configure Additional SDK Components (15 minutes)

### Why do we need this?
You need specific Android versions and tools to build and test your app.

### Step-by-Step Instructions:

1. **Open Android Studio**:
   - Double-click the Android Studio icon on your desktop
   - Or search "Android Studio" in Start menu

2. **Open SDK Manager**:
   - You should see the welcome screen
   - Click "More Actions" (three dots) → "SDK Manager"
   - A new window opens: "Settings for New Projects"

3. **Install SDK Platforms**:
   - You're on the "SDK Platforms" tab
   - Look at the list of Android versions
   - **Check these boxes** (if not already checked):
     - ✅ **Android 13.0 ("Tiramisu")** - API Level 33
     - ✅ **Android 12.0 ("S")** - API Level 31
     - ✅ **Android 11.0 ("R")** - API Level 30
   
   - At the bottom right, you'll see "X SDK Platforms will be installed"
   - Click "Apply" button
   - A new dialog appears: "Confirm Change"
   - Review the list
   - Click "OK"
   - Accept licenses if prompted
   - Wait for download (5-10 minutes)
   - Click "Finish" when done

4. **Install SDK Tools**:
   - Click the "SDK Tools" tab (next to SDK Platforms)
   - **Check these boxes** (if not already checked):
     - ✅ Android SDK Build-Tools (should show latest version like 34.x.x)
     - ✅ Android Emulator
     - ✅ Android SDK Platform-Tools
     - ✅ Google Play services
     - ✅ Intel x86 Emulator Accelerator (HAXM installer) - if you have Intel CPU
   
   - Click "Apply" button
   - Click "OK" on confirmation dialog
   - Wait for download (5-10 minutes)
   - Click "Finish" when done

5. **Install HAXM (Intel CPUs only)**:
   - If you have an Intel processor, you need to install HAXM manually
   - Navigate to: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk\extras\intel\Hardware_Accelerated_Execution_Manager`
   - Double-click `intelhaxm-android.exe`
   - Follow the installer (keep defaults)
   - Click "Finish"
   
   - **If you have AMD processor**: Skip HAXM, you'll use Hyper-V instead

6. **Close SDK Manager**:
   - Click "OK" to close the Settings window

---

## PART C: Create Android Virtual Device (Emulator) (10 minutes)

### Why do we need this?
The emulator is a virtual Android phone on your computer. You'll use it to test your Agrinext app without needing a physical device.

### Step-by-Step Instructions:

1. **Open Device Manager**:
   - In Android Studio welcome screen
   - Click "More Actions" → "Virtual Device Manager"
   - A new panel opens on the right side: "Device Manager"

2. **Create New Device**:
   - Click "Create Device" button (big plus icon or button)
   - "Virtual Device Configuration" wizard opens

3. **Select Hardware** (Screen 1):
   - Category: "Phone" (should be selected by default)
   - Look at the list of devices
   - **Select: "Pixel 5"** (recommended - good balance of features and performance)
     - Screen: 6.0"
     - Resolution: 1080 x 2340
     - Density: 440 dpi
   - Click "Next" button

4. **Select System Image** (Screen 2):
   - You'll see tabs: "Recommended", "x86 Images", "ARM Images"
   - Stay on "Recommended" tab
   - Look for **"Tiramisu"** (API Level 33)
     - Release Name: Tiramisu
     - API Level: 33
     - ABI: x86_64
     - Target: Android 13.0 (Google APIs)
   
   - **If you see a "Download" link next to it**:
     - Click "Download"
     - Accept license
     - Wait for download (1-2 GB, takes 10-15 minutes)
     - Click "Finish" when done
   
   - **Select the Tiramisu image** (click on the row)
   - Click "Next" button

5. **Verify Configuration** (Screen 3):
   - AVD Name: `Pixel_5_API_33` (you can keep this or change it)
   - Startup orientation: Portrait
   - **Click "Show Advanced Settings"** (at bottom)
   
   - Scroll down to find these settings:
     - **RAM**: 2048 MB (2 GB) - adjust based on your system
       - If you have 8 GB RAM total: use 2048 MB
       - If you have 16 GB RAM total: use 4096 MB
     - **Internal Storage**: 2048 MB (keep default)
     - **SD card**: 512 MB (optional)
   
   - Scroll back up
   - Click "Finish" button

6. **Test the Emulator**:
   - You should now see your device in the Device Manager list
   - Find "Pixel_5_API_33" in the list
   - Click the ▶️ (Play/Run) button next to it
   - **Wait 2-5 minutes** for first boot (it's slow the first time)
   - You should see an Android phone screen appear
   - You'll see the Android home screen with app icons
   - **SUCCESS! ✅**
   - You can close the emulator for now (X button)

---

## PART D: Open Agrinext Mobile Project (10 minutes)

### Step-by-Step Instructions:

1. **Close any open projects**:
   - If you have any project open, close it: `File` → `Close Project`
   - You should be back at the welcome screen

2. **Open Project**:
   - Click "Open" button (big button on welcome screen)
   - A file browser opens

3. **Navigate to your project**:
   - Go to: `J:\Aws_hackathon\mobile`
   - You should see folders like: `src`, `android`, `ios`, `node_modules`
   - Click on the `mobile` folder (to select it)
   - Click "OK" button

4. **Trust Project**:
   - A dialog appears: "Trust and Open Project 'mobile'?"
   - Click "Trust Project" button

5. **Wait for Gradle Sync**:
   - Android Studio will start loading the project
   - At the bottom, you'll see: "Gradle sync in progress..."
   - **This takes 5-10 minutes the first time**
   - Watch the progress bar at the bottom
   - You'll see messages like:
     - "Resolving dependencies..."
     - "Downloading dependencies..."
     - "Building..."
   
   - **When it's done**, you'll see:
     - ✅ "Gradle sync finished in X s"
     - Or ✅ "BUILD SUCCESSFUL"

6. **If Gradle Sync Fails**:
   - Look at the "Build" tab at the bottom
   - Read the error message
   - Common issue: "SDK location not found"
   
   **Fix**:
   - Click `File` → `Project Structure`
   - Click "SDK Location" in left sidebar
   - Set "Android SDK location" to: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk`
   - Click "Apply" → "OK"
   - Try sync again: `File` → `Sync Project with Gradle Files`

7. **Verify Project Structure**:
   - On the left side, you should see the project tree
   - Expand folders to see:
     - `android/` - Android native code
     - `src/` - React Native code
     - `package.json` - Dependencies
   - **SUCCESS! ✅**

---

## PART E: Configure Project for Your Backend (5 minutes)

### Step-by-Step Instructions:

1. **Open .env file**:
   - In Android Studio, look at the left sidebar (Project view)
   - Find and click on `.env` file (at root of mobile folder)
   - It should open in the editor

2. **Verify API URL**:
   - You should see:
     ```
     API_BASE_URL=http://3.239.184.220:3000/api/v1
     ```
   
   - **This is correct for your deployed backend on EC2**
   - If it's different, change it to the above

3. **Save the file**:
   - Press `Ctrl + S` to save

---

## PART F: Run the App (15 minutes)

### Step-by-Step Instructions:

1. **Start the Emulator**:
   - Look at the top toolbar in Android Studio
   - Find the device dropdown (looks like a phone icon)
   - Click it and select: "Pixel_5_API_33"
   - Wait for emulator to boot (1-2 minutes)

2. **Run the App**:
   - Click the green ▶️ (Run) button in the toolbar
   - Or press `Shift + F10`
   - Android Studio will start building the app

3. **Wait for Build** (First time: 10-15 minutes):
   - Watch the "Build" tab at the bottom
   - You'll see:
     - "Gradle build running..."
     - "Building APK..."
     - "Installing APK..."
   - Progress bar shows percentage

4. **App Launches**:
   - The app will automatically install on the emulator
   - You should see:
     - Agrinext splash screen (logo)
     - Then the login screen
   - **SUCCESS! ✅**

5. **If Build Fails**:
   - Check the "Build" tab for errors
   - Common issues:
     - "SDK not found" → Set SDK location in Project Structure
     - "Gradle sync failed" → Run `.\gradlew clean` in android folder
     - "Out of memory" → Increase Gradle memory in `gradle.properties`

---

## ✅ Success Checklist

After completing Step 3, you should have:

- ✅ Environment variables set (`adb --version` works)
- ✅ SDK platforms installed (Android 13, 12, 11)
- ✅ SDK tools installed (Build-Tools, Emulator, Platform-Tools)
- ✅ Emulator created and tested (Pixel_5_API_33)
- ✅ Agrinext project opened in Android Studio
- ✅ Gradle sync completed successfully
- ✅ .env file configured with correct API URL
- ✅ App builds and runs on emulator
- ✅ You can see the Agrinext login screen

---

## 🐛 Troubleshooting

### Issue: "adb: command not found"
**Cause**: Environment variables not set correctly
**Fix**: 
- Close ALL PowerShell/Terminal windows
- Open a NEW PowerShell window
- Try `adb --version` again
- If still fails, repeat Part A (Environment Variables)

### Issue: "Gradle sync failed: SDK location not found"
**Fix**:
```
File → Project Structure → SDK Location
Set: C:\Users\[YourUsername]\AppData\Local\Android\Sdk
Apply → OK
```

### Issue: "Emulator won't start" or "HAXM not installed"
**Fix for Intel CPUs**:
1. Enable virtualization in BIOS (Intel VT-x)
2. Install HAXM manually (see Part B, step 5)

**Fix for AMD CPUs**:
1. Enable Hyper-V in Windows Features
2. Use ARM-based emulator images instead

### Issue: "Build failed: Out of memory"
**Fix**:
1. Open `android/gradle.properties`
2. Add or modify:
   ```
   org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
   ```
3. Save and rebuild

### Issue: "App crashes immediately on launch"
**Fix**:
1. Check Logcat tab in Android Studio (bottom)
2. Look for red error messages
3. Common causes:
   - Backend not running → Check http://3.239.184.220:3000/health
   - Wrong API URL in .env
   - Missing permissions in AndroidManifest.xml

---

## 📞 Need Help?

If you're stuck on any step:
1. Note which PART and step number you're on
2. Copy the exact error message (if any)
3. Take a screenshot if helpful
4. Let me know and I'll help you troubleshoot!

---

## ⏭️ What's Next?

After completing Step 3, you can:
1. Test the login flow with OTP
2. Test disease detection with sample images
3. Test AI advisory features
4. Debug any issues
5. Make changes to the app code

**Current Status**: 🎯 Ready to configure Android Studio!

**Start with**: PART A - Environment Variables
