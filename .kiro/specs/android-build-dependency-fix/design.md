# Android Build Dependency Fix - Bugfix Design

## Overview

The React Native 0.73.2 mobile app fails to build on Android due to a cascade of incompatible tooling versions. The root issue stems from using Java 21 with Android Gradle Plugin (AGP) 8.1.1, which requires AGP 8.6.0+ for Java 21 support. This incompatibility triggers dependency resolution failures, which then cascade into SDK version conflicts (compileSdk 34 vs required 35) and React Native package compilation errors.

The fix strategy is to upgrade the Android build toolchain to versions compatible with Java 21 while maintaining React Native 0.73.2 compatibility. This involves updating AGP to 8.6.0+, upgrading compileSdk/targetSdk to 35, and ensuring all React Native packages can resolve their dependencies correctly. The fix is surgical - only Android build configuration files are modified, leaving all application code, iOS configuration, and JavaScript unchanged.

## Glossary

- **Bug_Condition (C)**: The condition that triggers build failures - when Android Gradle Plugin 8.1.1 attempts to sync/build with Java 21, or when compileSdk 34 is used with dependencies requiring SDK 35
- **Property (P)**: The desired behavior - successful Gradle sync, dependency resolution, compilation, and APK generation with Java 21 and updated SDK versions
- **Preservation**: All existing functionality must remain unchanged - React Native 0.73.2 compatibility, native module APIs, release configuration, iOS build, and runtime behavior
- **Android Gradle Plugin (AGP)**: The Gradle plugin that enables Android app builds, currently at version 8.1.1 in the project
- **compileSdk**: The Android SDK version used for compilation, currently 34, needs to be 35 for newer dependencies
- **BaseReactPackage**: A React Native class that some packages (gesture-handler, screens) depend on for registration
- **Gradle Sync**: The process where Gradle resolves all dependencies and configures the build, currently failing with "Connection reset by peer"

## Bug Details

### Fault Condition

The bug manifests when the Android build system attempts to sync or compile the project with incompatible version combinations. The Android Gradle Plugin 8.1.1 is not compatible with Java 21, causing Gradle to fail during dependency resolution. Additionally, the project uses compileSdk 34, but newer androidx dependencies (like androidx.core:core-ktx:1.16.0) require compileSdk 35, creating a secondary conflict. These conflicts prevent React Native packages from compiling correctly.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type BuildConfiguration
  OUTPUT: boolean
  
  RETURN (input.javaVersion == 21 AND input.agpVersion < "8.6.0")
         OR (input.compileSdk == 34 AND input.hasAndroidXDependencyRequiring35())
         OR (input.gradleSyncStatus == "FAILED")
         OR (input.compilationStatus == "FAILED" AND input.hasUnresolvedReferences())
END FUNCTION
```

### Examples

- **Defect 1.1**: Running `./gradlew build` with Java 21 and AGP 8.1.1 results in "Connection reset by peer" during dependency resolution, preventing Gradle sync from completing
- **Defect 1.2**: Building with compileSdk 34 when androidx.core:core-ktx:1.16.0 is present causes error: "Dependency 'androidx.core:core-ktx:1.16.0' requires 'compileSdk' to be set to 35 or higher"
- **Defect 1.3**: Compiling react-native-gesture-handler fails with "Unresolved reference: BaseReactPackage" because dependency resolution failed in earlier stages
- **Defect 1.4**: Compiling react-native-screens fails with "Unresolved reference: BaseReactPackage" for the same reason
- **Defect 1.5**: The build process terminates before APK generation, preventing installation on emulator with error: "FAILURE: Build failed with an exception"

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- React Native 0.73.2 runtime behavior must remain identical - all JavaScript code, UI components, and navigation must work exactly as before
- Native module APIs (camera, image picker, SQLite, async-storage, keychain, NetInfo) must maintain the same interfaces and behavior
- Release build configuration must continue to apply the same signing configuration and ProGuard settings
- The `npm run android` command must continue to build and launch the app on connected devices/emulators
- iOS build process must remain completely unaffected by Android-specific changes
- Metro bundler configuration and JavaScript bundling must work identically

**Scope:**
All inputs that do NOT involve the Android build process should be completely unaffected by this fix. This includes:
- JavaScript/TypeScript application code execution
- iOS builds and iOS-specific native code
- React Native JavaScript API calls
- Metro bundler operation
- npm scripts other than `npm run android`
- Development server and hot reload functionality

## Hypothesized Root Cause

Based on the bug description and error analysis, the root causes are:

1. **Java 21 Incompatibility with AGP 8.1.1**: Android Gradle Plugin 8.1.1 was released before Java 21 and does not support it. Java 21 introduced changes that cause AGP 8.1.1's dependency resolution to fail with "Connection reset by peer" errors. AGP 8.6.0+ added Java 21 support.

2. **SDK Version Cascade Failure**: The React Native 0.73.2 template uses compileSdk 34, but newer versions of androidx libraries (particularly androidx.core:core-ktx:1.16.0) require compileSdk 35. When Gradle attempts to resolve dependencies, it pulls in these newer androidx versions transitively, creating a conflict.

3. **Gradle Dependency Resolution Failure**: When Gradle sync fails due to Java/AGP incompatibility, the dependency graph is not fully resolved. This leaves React Native packages unable to find their dependencies (like BaseReactPackage), causing compilation errors downstream.

4. **React Native Package Compilation Errors**: The "Unresolved reference: BaseReactPackage" errors in react-native-gesture-handler and react-native-screens are symptoms, not root causes. These packages compile fine when Gradle sync succeeds and dependencies are properly resolved.

5. **Version Lock-in from Template**: The React Native 0.73.2 template generated the android folder with specific versions that were current at the time (AGP 8.1.1, compileSdk 34), but the development environment has evolved (Java 21 installed), creating a mismatch.

## Correctness Properties

Property 1: Fault Condition - Build Success with Java 21 and Updated SDK

_For any_ build configuration where Java 21 is installed and the Android project uses updated AGP (8.6.0+) and compileSdk (35), the build system SHALL complete Gradle sync successfully, resolve all dependencies without conflicts, compile all React Native packages without unresolved references, and generate a valid APK that can be installed on Android devices/emulators.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Runtime and Cross-Platform Behavior

_For any_ runtime execution, native module API call, iOS build, or non-Android build operation, the fixed configuration SHALL produce exactly the same behavior as the original configuration, preserving all React Native 0.73.2 functionality, native module interfaces, release build settings, and iOS build process.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `mobile/android/build.gradle`

**Function**: Root project build configuration

**Specific Changes**:
1. **Update Android Gradle Plugin Version**: Change AGP from 8.1.1 to 8.6.0 or higher
   - Modify the `dependencies` block in `buildscript` to specify `classpath("com.android.tools.build:gradle:8.6.0")`
   - This enables Java 21 compatibility and resolves the "Connection reset by peer" errors

2. **Update compileSdk Version**: Change from 34 to 35
   - Modify `ext.compileSdkVersion = 35` in the `buildscript.ext` block
   - This satisfies androidx dependency requirements

3. **Update targetSdk Version**: Change from 34 to 35
   - Modify `ext.targetSdkVersion = 35` in the `buildscript.ext` block
   - Keeps target SDK aligned with compile SDK for consistency

4. **Update Kotlin Version**: Upgrade from 1.8.0 to 1.9.0+
   - Modify `ext.kotlinVersion = "1.9.0"` in the `buildscript.ext` block
   - Ensures Kotlin compatibility with AGP 8.6.0

5. **Verify Gradle Wrapper Version**: Ensure Gradle 8.5+ is used
   - Check `mobile/android/gradle/wrapper/gradle-wrapper.properties`
   - AGP 8.6.0 requires Gradle 8.5 minimum (already satisfied based on status document)

**File**: `mobile/android/gradle/wrapper/gradle-wrapper.properties`

**Verification Only**: Confirm Gradle version is 8.5 or higher (no change needed if already 8.5)

**File**: `mobile/android/app/build.gradle`

**Verification Only**: No changes required - this file uses variables from root build.gradle

### Risk Assessment

**Low Risk Changes**:
- AGP and SDK version updates are backward compatible with React Native 0.73.2
- These versions are within the supported range for RN 0.73.2 (released Dec 2023, AGP 8.6.0 released Aug 2024)
- Only build configuration changes, no code changes

**Medium Risk Areas**:
- Potential for new androidx dependency versions to be pulled in transitively
- Mitigation: Test all native modules after build succeeds

**No Risk Areas**:
- iOS build (completely separate configuration)
- JavaScript code (no changes)
- Release signing configuration (no changes)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (exploratory testing), then verify the fix works correctly and preserves existing behavior (fix checking and preservation checking).

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Attempt to build the Android app with the current configuration (AGP 8.1.1, compileSdk 34, Java 21) and document all failure points. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Gradle Sync Test**: Run `cd mobile/android && ./gradlew --version && ./gradlew tasks` (will fail on unfixed code with "Connection reset by peer")
2. **Dependency Resolution Test**: Run `cd mobile/android && ./gradlew app:dependencies` (will fail on unfixed code during dependency graph resolution)
3. **Compilation Test**: Run `cd mobile/android && ./gradlew assembleDebug` (will fail on unfixed code with unresolved reference errors)
4. **APK Generation Test**: Check if `mobile/android/app/build/outputs/apk/debug/app-debug.apk` exists after build (will not exist on unfixed code)

**Expected Counterexamples**:
- Gradle sync fails with network errors or dependency resolution errors
- Compilation fails with "Unresolved reference: BaseReactPackage" in react-native-gesture-handler and react-native-screens
- Build terminates before APK generation
- Possible causes: Java 21 incompatibility with AGP 8.1.1, compileSdk 34 incompatibility with androidx dependencies

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL buildConfig WHERE isBugCondition(buildConfig) DO
  result := runAndroidBuild_fixed(buildConfig)
  ASSERT result.gradleSyncSuccess == true
  ASSERT result.dependencyResolutionSuccess == true
  ASSERT result.compilationSuccess == true
  ASSERT result.apkGenerated == true
  ASSERT result.apkInstallable == true
END FOR
```

**Test Plan**: After applying the fix (AGP 8.6.0, compileSdk 35), run the same build commands and verify all stages complete successfully.

**Test Cases**:
1. **Gradle Sync Success**: Run `cd mobile/android && ./gradlew tasks` - should complete without errors
2. **Dependency Resolution Success**: Run `cd mobile/android && ./gradlew app:dependencies` - should display full dependency tree
3. **Clean Build Success**: Run `cd mobile/android && ./gradlew clean assembleDebug` - should complete and generate APK
4. **APK Installation Success**: Run `npm run android` - should install and launch app on emulator
5. **Release Build Success**: Run `cd mobile/android && ./gradlew assembleRelease` - should generate signed release APK

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL operation WHERE NOT isBugCondition(operation) DO
  ASSERT behavior_original(operation) = behavior_fixed(operation)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-build operations (if possible via web UI or previous working builds), then write tests capturing that behavior and verify it continues after fix.

**Test Cases**:
1. **React Native Runtime Preservation**: Launch app and verify all screens, navigation, and UI components work identically
2. **Native Module API Preservation**: Test camera, image picker, SQLite, async-storage, keychain, NetInfo - verify same APIs and behavior
3. **Release Configuration Preservation**: Verify `mobile/android/app/build.gradle` signing config and ProGuard settings unchanged
4. **iOS Build Preservation**: Run `cd mobile/ios && xcodebuild -workspace AgrinextTemp.xcworkspace -scheme AgrinextTemp -configuration Debug` (or equivalent) - should build successfully without any changes
5. **Metro Bundler Preservation**: Run `npm start` - should bundle JavaScript identically
6. **JavaScript Execution Preservation**: Run app and execute all major user flows - should behave identically

### Unit Tests

- Test Gradle sync completes without errors
- Test dependency resolution finds all required packages
- Test compilation of react-native-gesture-handler succeeds
- Test compilation of react-native-screens succeeds
- Test APK generation creates valid output file
- Test APK installation on emulator succeeds

### Property-Based Tests

- Generate random build configurations with different Java versions and verify AGP 8.6.0 works with Java 17, 18, 19, 20, 21
- Generate random dependency trees and verify compileSdk 35 satisfies all androidx requirements
- Test that all React Native 0.73.x versions work with the updated configuration
- Verify that different Gradle versions (8.5, 8.6, 8.7, 8.8) all work with AGP 8.6.0

### Integration Tests

- Test full build flow: clean → sync → compile → assemble → install → launch
- Test switching between debug and release builds
- Test building with different build variants (if any exist)
- Test that hot reload and fast refresh continue to work after build
- Test that native module calls from JavaScript work correctly in the built app
- Test that app can be built, installed, and run on both emulator and physical device

### Manual Verification Checklist

After applying the fix, manually verify:

1. ✅ Gradle sync completes without errors
2. ✅ `./gradlew assembleDebug` succeeds
3. ✅ APK file exists at `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
4. ✅ `npm run android` installs and launches app on emulator
5. ✅ App displays home screen correctly
6. ✅ Navigation between screens works
7. ✅ Camera permission request works (if applicable)
8. ✅ Image picker works (if applicable)
9. ✅ SQLite database operations work (if applicable)
10. ✅ Network requests to backend API work
11. ✅ iOS build still succeeds (run on macOS if available)
12. ✅ Release build succeeds: `./gradlew assembleRelease`

### Rollback Plan

If the fix introduces regressions:

1. **Immediate Rollback**: Revert changes to `mobile/android/build.gradle`
2. **Alternative Fix**: Downgrade Java from 21 to 17 (as suggested in status document)
3. **Escalation**: If both approaches fail, consider converting to Expo or consulting React Native expert

### Success Criteria

The fix is considered successful when:
- All 5 defect conditions (1.1-1.5) are resolved
- All 5 expected behaviors (2.1-2.5) are achieved
- All 5 preservation requirements (3.1-3.5) are maintained
- Manual verification checklist is 100% complete
- No new errors or warnings are introduced
