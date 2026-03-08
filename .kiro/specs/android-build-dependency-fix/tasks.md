# Implementation Plan

- [x] 1. Write bug condition exploration tests (BEFORE implementing fix)
  - **Property 1: Fault Condition** - Android Build Failure with Java 21 and Outdated Tooling
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped Approach**: Test the concrete failing cases with current configuration (AGP 8.1.1, compileSdk 34, Java 21)
  - Test 1.1: Run `cd mobile/android && ./gradlew --version && ./gradlew tasks` to verify Gradle sync fails with "Connection reset by peer" or dependency resolution errors
  - Test 1.2: Run `cd mobile/android && ./gradlew app:dependencies` to verify dependency resolution fails with SDK version conflicts
  - Test 1.3: Run `cd mobile/android && ./gradlew assembleDebug` to verify compilation fails with "Unresolved reference: BaseReactPackage" errors
  - Test 1.4: Check that `mobile/android/app/build/outputs/apk/debug/app-debug.apk` does NOT exist after build attempt
  - Run tests on UNFIXED code (current configuration)
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bug exists)
  - Document counterexamples found:
    - Exact error messages from Gradle sync failure
    - Dependency conflict details (which androidx packages require compileSdk 35)
    - Compilation error details (which packages have unresolved references)
    - Build termination point (sync, dependency resolution, or compilation)
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Build Operations and Cross-Platform Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - **NOTE**: Some preservation tests cannot run on unfixed code since the Android build is broken
  - **STRATEGY**: Document expected preservation behavior based on design specifications, then verify after fix
  - Preservation Test 2.1: Document React Native 0.73.2 runtime behavior expectations (screens, navigation, UI components)
  - Preservation Test 2.2: Document native module API interfaces (camera, image picker, SQLite, async-storage, keychain, NetInfo)
  - Preservation Test 2.3: Verify release build configuration in `mobile/android/app/build.gradle` (signing config, ProGuard settings) - can check on unfixed code
  - Preservation Test 2.4: Document `npm run android` command behavior expectations
  - Preservation Test 2.5: Verify iOS build still works - run `cd mobile/ios && xcodebuild -workspace AgrinextTemp.xcworkspace -scheme AgrinextTemp -configuration Debug` (if on macOS) - can test on unfixed code
  - Preservation Test 2.6: Verify Metro bundler works - run `npm start` - can test on unfixed code
  - **EXPECTED OUTCOME**: Tests that can run on unfixed code PASS (confirms baseline behavior to preserve)
  - Mark task complete when preservation expectations are documented and testable items are verified on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [-] 3. Fix for Android build dependency incompatibilities

  - [x] 3.1 Update Android Gradle Plugin to 8.6.0
    - Open `mobile/android/build.gradle`
    - Locate the `buildscript.dependencies` block
    - Change `classpath("com.android.tools.build:gradle:8.1.1")` to `classpath("com.android.tools.build:gradle:8.6.0")`
    - _Bug_Condition: isBugCondition(input) where input.javaVersion == 21 AND input.agpVersion < "8.6.0"_
    - _Expected_Behavior: AGP 8.6.0 enables Java 21 compatibility and resolves "Connection reset by peer" errors_
    - _Preservation: No changes to application code, iOS configuration, or JavaScript_
    - _Requirements: 1.1, 2.1_

  - [x] 3.2 Update compileSdk to 35
    - In `mobile/android/build.gradle`, locate the `buildscript.ext` block
    - Change `compileSdkVersion = 34` to `compileSdkVersion = 35`
    - _Bug_Condition: isBugCondition(input) where input.compileSdk == 34 AND input.hasAndroidXDependencyRequiring35()_
    - _Expected_Behavior: compileSdk 35 satisfies androidx dependency requirements_
    - _Preservation: Backward compatible with React Native 0.73.2_
    - _Requirements: 1.2, 2.2_

  - [x] 3.3 Update targetSdk to 35
    - In `mobile/android/build.gradle`, locate the `buildscript.ext` block
    - Change `targetSdkVersion = 34` to `targetSdkVersion = 35`
    - _Bug_Condition: Keeps target SDK aligned with compile SDK for consistency_
    - _Expected_Behavior: targetSdk 35 maintains alignment with compileSdk_
    - _Preservation: No runtime behavior changes_
    - _Requirements: 2.2_

  - [x] 3.4 Update Kotlin version to 1.9.0
    - In `mobile/android/build.gradle`, locate the `buildscript.ext` block
    - Change `kotlinVersion = "1.8.0"` to `kotlinVersion = "1.9.0"`
    - _Bug_Condition: Ensures Kotlin compatibility with AGP 8.6.0_
    - _Expected_Behavior: Kotlin 1.9.0 works with AGP 8.6.0_
    - _Preservation: Backward compatible with existing Kotlin code_
    - _Requirements: 2.3, 2.4_

  - [x] 3.5 Verify Gradle wrapper version
    - Check `mobile/android/gradle/wrapper/gradle-wrapper.properties`
    - Confirm `distributionUrl` points to Gradle 8.5 or higher
    - If version is lower than 8.5, update to Gradle 8.5 (AGP 8.6.0 minimum requirement)
    - _Bug_Condition: AGP 8.6.0 requires Gradle 8.5 minimum_
    - _Expected_Behavior: Gradle 8.5+ supports AGP 8.6.0_
    - _Preservation: No changes if already 8.5+_
    - _Requirements: 2.1_

  - [x] 3.6 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Android Build Success with Java 21 and Updated Tooling
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Test 1.1: Run `cd mobile/android && ./gradlew tasks` - should complete without errors
    - Test 1.2: Run `cd mobile/android && ./gradlew app:dependencies` - should display full dependency tree
    - Test 1.3: Run `cd mobile/android && ./gradlew clean assembleDebug` - should complete and generate APK
    - Test 1.4: Verify `mobile/android/app/build/outputs/apk/debug/app-debug.apk` exists
    - Test 1.5: Run `npm run android` - should install and launch app on emulator
    - **EXPECTED OUTCOME**: All tests PASS (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Build Operations and Cross-Platform Behavior
    - **IMPORTANT**: Verify the SAME preservation expectations from task 2 - do NOT write new tests
    - Preservation Test 2.1: Launch app and verify all screens, navigation, and UI components work identically to before
    - Preservation Test 2.2: Test native modules (camera, image picker, SQLite, async-storage, keychain, NetInfo) - verify same APIs and behavior
    - Preservation Test 2.3: Verify `mobile/android/app/build.gradle` signing config and ProGuard settings unchanged
    - Preservation Test 2.4: Verify `npm run android` command builds and launches app on connected devices/emulators
    - Preservation Test 2.5: Run iOS build (if on macOS) - should build successfully without any changes
    - Preservation Test 2.6: Run `npm start` - should bundle JavaScript identically
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Additional verification and testing

  - [ ] 4.1 Run release build test
    - Run `cd mobile/android && ./gradlew assembleRelease`
    - Verify release APK is generated at `mobile/android/app/build/outputs/apk/release/app-release.apk`
    - Verify signing configuration is applied correctly
    - _Requirements: 2.5, 3.3_

  - [ ] 4.2 Test hot reload and fast refresh
    - Launch app with `npm run android`
    - Make a small change to a JavaScript file
    - Verify hot reload updates the app without full rebuild
    - Verify fast refresh preserves component state
    - _Requirements: 3.1_

  - [ ] 4.3 Test native module integration
    - Launch app and navigate to screens that use native modules
    - Test camera permission request (if applicable)
    - Test image picker functionality (if applicable)
    - Test SQLite database operations (if applicable)
    - Test network requests to backend API
    - Verify all native modules work identically to before
    - _Requirements: 3.2_

- [ ] 5. Manual verification checklist
  - Complete the following manual verification steps:
  - [ ] 5.1 Gradle sync completes without errors
  - [ ] 5.2 `./gradlew assembleDebug` succeeds
  - [ ] 5.3 APK file exists at `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
  - [ ] 5.4 `npm run android` installs and launches app on emulator
  - [ ] 5.5 App displays home screen correctly
  - [ ] 5.6 Navigation between screens works
  - [ ] 5.7 Camera permission request works (if applicable)
  - [ ] 5.8 Image picker works (if applicable)
  - [ ] 5.9 SQLite database operations work (if applicable)
  - [ ] 5.10 Network requests to backend API work
  - [ ] 5.11 iOS build still succeeds (run on macOS if available)
  - [ ] 5.12 Release build succeeds: `./gradlew assembleRelease`

- [ ] 6. Checkpoint - Ensure all tests pass
  - Verify all exploration tests from task 1 now pass (bug is fixed)
  - Verify all preservation tests from task 2 still pass (no regressions)
  - Verify all additional tests from task 4 pass
  - Verify manual verification checklist is 100% complete
  - If any issues arise, document them and ask the user for guidance
  - _Success Criteria: All 5 defect conditions resolved, all 5 expected behaviors achieved, all 5 preservation requirements maintained_
