# Metro Bundler Runtime Fix - Bugfix Design

## Overview

The Agrinext mobile app crashes at runtime due to a configuration conflict between Expo SDK 50 and React Native CLI. The Android build.gradle is configured to use Expo's virtual entry point resolver (`expo/scripts/resolveAppEntry`), which expects `.expo/virtual-metro-entry` files. However, the Metro bundler configuration uses React Native CLI defaults, which serve `index.js` as the entry point. This mismatch causes 404 errors when the app attempts to load JavaScript bundles, resulting in immediate crashes.

The fix will align the Metro bundler configuration with Expo's entry point expectations by configuring Metro to use Expo's preset, ensuring consistent entry point resolution across build and runtime environments.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when the Android app attempts to load JavaScript bundles at runtime with mismatched entry point configurations
- **Property (P)**: The desired behavior - Metro bundler serves the correct entry point that matches what the Android build expects
- **Preservation**: Existing build process, app functionality, and development workflow that must remain unchanged
- **Metro Bundler**: The JavaScript bundler used by React Native to package and serve JavaScript code
- **Entry Point**: The initial JavaScript file that bootstraps the React Native application
- **Virtual Entry**: Expo's dynamically generated entry point file (`.expo/virtual-metro-entry`) that handles Expo-specific initialization
- **resolveAppEntry**: Expo's script that determines the correct entry point based on project configuration

## Bug Details

### Fault Condition

The bug manifests when the Android app is launched and attempts to load JavaScript bundles from the Metro bundler. The Android build.gradle uses Expo's `resolveAppEntry` script to determine the entry point, which resolves to `.expo/virtual-metro-entry.bundle`. However, the Metro bundler is configured with React Native CLI defaults and attempts to serve `index.js`, resulting in 404 errors and runtime crashes.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type AppLaunchEvent
  OUTPUT: boolean
  
  RETURN input.platform == 'android'
         AND input.buildConfig.entryFile.contains('expo/scripts/resolveAppEntry')
         AND input.metroConfig.preset == '@react-native/metro-config'
         AND NOT input.metroConfig.preset == 'expo/metro-config'
         AND bundleRequest.path.contains('.expo/virtual-metro-entry')
         AND metroServer.servingPath == 'index.js'
END FUNCTION
```

### Examples

- **Example 1**: Launch app on Android emulator → Metro bundler receives request for `.expo/virtual-metro-entry.bundle` → Metro returns 404 (expects `index.js`) → App crashes with "Unable to load script"

- **Example 2**: Run `npm start` and observe Metro logs → 404 errors for `.expo/virtual-metro-entry.bundle` and related source maps → Indicates entry point mismatch

- **Example 3**: Attempt release build with `./gradlew assembleRelease` → Build fails with "ENOENT: no such file or directory, mkdir 'J:\Aws_hackathon\mobile\.expo\metro\externals\node:sea'" → Expo's bundler expects directories that don't exist

- **Edge Case**: If Metro bundler were configured with Expo preset, it would correctly generate and serve `.expo/virtual-metro-entry` files, and the app would launch successfully

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Debug APK builds with `./gradlew assembleDebug` must continue to succeed
- APK installation on emulator must continue to work without errors
- All existing app functionality (navigation, UI components, API calls, local storage) must continue to work exactly as before
- Development workflow with hot reload and fast refresh must continue to function
- TypeScript compilation and linting must continue to work

**Scope:**
All inputs that do NOT involve the Metro bundler entry point configuration should be completely unaffected by this fix. This includes:
- Source code in `src/` directory
- React components and screens
- Navigation configuration
- API service calls
- Local database operations
- Asset loading (images, fonts)
- Third-party library functionality

## Hypothesized Root Cause

Based on the bug description and configuration analysis, the root cause is:

**Configuration Mismatch Between Build and Runtime**

1. **Android Build Configuration**: The `mobile/android/app/build.gradle` file explicitly uses Expo's entry point resolver:
   ```groovy
   entryFile = file(["node", "-e", "require('expo/scripts/resolveAppEntry')", ...].execute(...).text.trim())
   cliFile = new File(["node", "--print", "require.resolve('@expo/cli', ...)"].execute(...).text.trim())
   bundleCommand = "export:embed"
   ```
   This configuration tells the Android build system to expect Expo's virtual entry files.

2. **Metro Bundler Configuration**: The `mobile/metro.config.js` file uses React Native CLI defaults:
   ```javascript
   const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
   const config = {};
   module.exports = mergeConfig(getDefaultConfig(__dirname), config);
   ```
   This configuration serves `index.js` as the entry point, not Expo's virtual entry.

3. **Package Dependencies**: The `package.json` includes both Expo SDK 50 (`expo: ~50.0.0`) and React Native CLI commands (`react-native start`, `react-native run-android`), creating ambiguity about which bundler should be used.

4. **Missing Expo Metro Config**: The project does not use `@expo/metro-config`, which is required to properly configure Metro for Expo projects.

**Why This Causes the Bug:**
- At build time: Gradle uses Expo's resolver, which expects `.expo/virtual-metro-entry`
- At runtime: Metro serves `index.js` because it's using React Native CLI config
- Result: 404 errors when the app requests the bundle, causing immediate crash

## Correctness Properties

Property 1: Fault Condition - Metro Serves Correct Entry Point

_For any_ app launch event where the Android build is configured to use Expo's entry point resolver, the Metro bundler SHALL serve the correct entry point file (`.expo/virtual-metro-entry.bundle`) that matches the build configuration, allowing the app to load JavaScript bundles successfully without 404 errors.

**Validates: Requirements 2.1, 2.2, 2.4**

Property 2: Preservation - Existing Functionality Unchanged

_For any_ app functionality that does NOT depend on the Metro bundler entry point configuration (source code, components, navigation, API calls, local storage), the fixed configuration SHALL produce exactly the same behavior as the original configuration, preserving all existing features and development workflow.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the fix involves aligning Metro bundler configuration with Expo's requirements:

**File**: `mobile/metro.config.js`

**Function**: Metro configuration export

**Specific Changes**:

1. **Replace React Native CLI Metro Config with Expo Metro Config**:
   - Change from: `const {getDefaultConfig} = require('@react-native/metro-config')`
   - Change to: `const {getDefaultConfig} = require('expo/metro-config')`
   - Rationale: Expo's Metro config includes the necessary transformers and resolvers for virtual entry points

2. **Update Config Initialization**:
   - Change from: `getDefaultConfig(__dirname)`
   - Change to: `getDefaultConfig(__dirname)`
   - Note: The function signature is the same, but Expo's version returns different defaults

3. **Verify Expo Metro Config Dependency**:
   - Check that `expo` package (which includes `expo/metro-config`) is installed
   - Current version: `~50.0.0` (already installed per package.json)

4. **Optional: Add Explicit Entry Point Configuration** (if needed):
   - May need to explicitly configure: `config.resolver.sourceExts` or `config.transformer.getTransformOptions`
   - This will be determined during exploratory testing

5. **Update Start Script** (if needed):
   - Current: `"start": "react-native start"`
   - May need: `"start": "expo start --dev-client"` or keep as-is if Expo CLI is used via build.gradle
   - This will be determined during exploratory testing

**Alternative Approach** (if Expo Metro config doesn't resolve the issue):
- Remove Expo-specific configuration from `build.gradle`
- Use pure React Native CLI approach with `index.js` entry point
- This would require removing Expo SDK dependencies and reverting to pure React Native

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code to confirm the root cause, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the Metro bundler configuration mismatch is the root cause. If we refute this hypothesis, we will need to re-hypothesize.

**Test Plan**: 
1. Launch the app with current configuration and capture Metro bundler logs
2. Observe 404 errors for `.expo/virtual-metro-entry.bundle`
3. Verify that `metro.config.js` is using `@react-native/metro-config`
4. Verify that `build.gradle` is using `expo/scripts/resolveAppEntry`
5. Attempt to manually request the bundle URL to confirm 404 response

Run these tests on the UNFIXED code to observe failures and confirm the root cause.

**Test Cases**:
1. **App Launch Test**: Launch app on Android emulator with `npm run android` (will fail with "Unable to load script" on unfixed code)
2. **Metro Log Analysis**: Start Metro with `npm start` and observe 404 errors in logs (will show 404 for `.expo/virtual-metro-entry.bundle` on unfixed code)
3. **Bundle Request Test**: Manually request `http://localhost:8081/.expo/virtual-metro-entry.bundle` (will return 404 on unfixed code)
4. **Release Build Test**: Attempt `cd android && ./gradlew assembleRelease` (may fail with ENOENT errors on unfixed code)

**Expected Counterexamples**:
- Metro bundler returns 404 for `.expo/virtual-metro-entry.bundle` requests
- App crashes immediately after launch with "Unable to load script" error
- Metro logs show requests for Expo virtual entry files that cannot be served
- Possible causes: Metro config using wrong preset, missing Expo Metro transformers, incorrect entry point resolution

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (Android app launch with Expo build config), the fixed Metro configuration produces the expected behavior (successful bundle loading).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := launchApp_fixed(input)
  ASSERT result.bundleLoaded == true
  ASSERT result.metroBundlerResponse.statusCode == 200
  ASSERT result.appState == 'running'
  ASSERT NOT result.error.contains('Unable to load script')
END FOR
```

**Test Cases**:
1. **Successful App Launch**: Launch app on Android emulator → App loads successfully and displays home screen
2. **Metro Serves Correct Bundle**: Verify Metro logs show 200 responses for `.expo/virtual-metro-entry.bundle`
3. **Release Build Success**: Run `./gradlew assembleRelease` → Build completes and generates APK
4. **Bundle URL Accessibility**: Request `http://localhost:8081/.expo/virtual-metro-entry.bundle` → Returns 200 with valid JavaScript

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (existing app functionality, development workflow), the fixed configuration produces the same result as the original configuration.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT appFunctionality_original(input) = appFunctionality_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-bundler-config inputs

**Test Plan**: Observe behavior on UNFIXED code first for app functionality, then write tests capturing that behavior to verify it continues after the fix.

**Test Cases**:
1. **Navigation Preservation**: Observe that navigation between screens works correctly on unfixed code (when app can be manually loaded), then verify this continues after fix
2. **Component Rendering Preservation**: Observe that all UI components render correctly on unfixed code, then verify this continues after fix
3. **API Call Preservation**: Observe that API service calls work correctly on unfixed code, then verify this continues after fix
4. **Hot Reload Preservation**: Observe that hot reload works correctly on unfixed code, then verify this continues after fix
5. **Build Process Preservation**: Observe that `./gradlew assembleDebug` works on unfixed code, then verify this continues after fix

### Unit Tests

- Test Metro config exports the correct configuration object
- Test that Metro config includes Expo-specific transformers
- Test that entry point resolution returns `.expo/virtual-metro-entry`
- Test that bundle requests return 200 status codes
- Test that app launches without "Unable to load script" errors

### Property-Based Tests

- Generate random app launch scenarios (different emulator states, network conditions) and verify app loads successfully
- Generate random navigation paths through the app and verify all screens render correctly
- Generate random API request patterns and verify responses are unchanged
- Test that Metro bundler serves bundles correctly across many different request patterns

### Integration Tests

- Test full app launch flow: build → install → launch → verify home screen displays
- Test development workflow: make code change → hot reload → verify change appears
- Test release build flow: `./gradlew assembleRelease` → install APK → launch → verify app works
- Test Metro bundler restart: stop Metro → start Metro → launch app → verify app loads
