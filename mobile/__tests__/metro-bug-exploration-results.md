# Metro Bundler Bug Condition Exploration - Test Results

**Date**: 2025-01-27
**Test File**: `__tests__/metro-bug-exploration.test.ts`
**Status**: ✅ Bug Confirmed (Test Failed as Expected)

## Executive Summary

The bug condition exploration test **successfully confirmed** the Metro bundler configuration mismatch bug. The test failed as expected on unfixed code, proving that the bug exists.

## Bug Condition Verification

### ✅ Confirmed Configuration Mismatch

1. **Android Build Configuration** (`android/app/build.gradle`):
   - Uses: `expo/scripts/resolveAppEntry`
   - Uses: `@expo/cli`
   - Bundle command: `export:embed`
   - **Expects**: `.expo/virtual-metro-entry.bundle`

2. **Metro Bundler Configuration** (`metro.config.js`):
   - Uses: `@react-native/metro-config` (React Native CLI preset)
   - Does NOT use: `expo/metro-config`
   - **Serves**: `index.js`

3. **Bug Condition Analysis**:
   - Android build.gradle uses Expo entry point: **true**
   - metro.config.js uses @react-native/metro-config: **true**
   - metro.config.js uses expo/metro-config: **false**
   - **Bug condition exists: true**

## Test Results

### Test Suite: Metro Bundler Bug Condition Exploration

| Test Case | Status | Description |
|-----------|--------|-------------|
| should verify Android build.gradle uses expo/scripts/resolveAppEntry | ✅ PASS | Confirmed Expo entry point resolver in build config |
| should verify metro.config.js uses @react-native/metro-config | ✅ PASS | Confirmed React Native CLI preset in Metro config |
| should verify the configuration mismatch exists | ✅ PASS | Confirmed bug condition exists |
| **Metro bundler should serve correct entry point for Expo configuration** | ❌ **FAIL** | **Expected failure - confirms bug exists** |
| should document the configuration mismatch counterexample | ✅ PASS | Documented counterexample |

### Critical Test Failure (Expected)

**Test**: Metro bundler should serve correct entry point for Expo configuration

**Assertion**: `expect(usesExpoMetroConfig).toBe(true)`

**Result**:
- Expected: `true`
- Received: `false`

**Interpretation**: This failure is **CORRECT and EXPECTED** on unfixed code. It proves that:
1. The Metro bundler is NOT configured to use Expo's metro config
2. The Android build expects Expo virtual entry points
3. There is a mismatch that will cause 404 errors at runtime

## Counterexample Documentation

### Bug Description
Metro bundler configuration mismatch causing runtime crashes

### Counterexample Flow

1. **Build Time**:
   - Android build.gradle uses `expo/scripts/resolveAppEntry`
   - Resolves entry point to: `.expo/virtual-metro-entry`
   - Expects Metro to serve: `.expo/virtual-metro-entry.bundle`

2. **Runtime**:
   - Metro bundler uses `@react-native/metro-config`
   - Configured to serve: `index.js`
   - Does NOT generate: `.expo/virtual-metro-entry` files

3. **Result**:
   - App requests: `.expo/virtual-metro-entry.bundle`
   - Metro serves: `index.js` (404 for requested file)
   - HTTP Status: **404 Not Found**
   - App State: **Crashes with "Unable to load script" error**

### Root Cause

The root cause is a **configuration mismatch** between:
- **Build configuration**: Expects Expo virtual entry points
- **Metro configuration**: Serves React Native CLI entry points

This mismatch occurs because:
1. The project uses Expo SDK 50 (`expo: ~50.0.0`)
2. The Android build.gradle is configured for Expo
3. The metro.config.js uses React Native CLI defaults
4. These two configurations are incompatible

## Expected Fix

To resolve this bug, the Metro bundler configuration must be aligned with the Expo build configuration:

1. **Change**: `metro.config.js` to use `expo/metro-config`
2. **From**: `const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config')`
3. **To**: `const {getDefaultConfig, mergeConfig} = require('expo/metro-config')`

This will:
- Make Metro serve `.expo/virtual-metro-entry.bundle`
- Align Metro config with Android build expectations
- Allow app to load successfully without 404 errors
- Eliminate "Unable to load script" crashes

## Validation

After implementing the fix:
1. Re-run this same test
2. The "Metro bundler should serve correct entry point" test should **PASS**
3. This will confirm the bug is fixed

## Conclusion

✅ **Bug Condition Exploration: SUCCESSFUL**

The test successfully:
- Verified the bug condition exists
- Documented the configuration mismatch
- Provided counterexamples demonstrating the bug
- Failed as expected on unfixed code (proving the bug exists)

The next step is to implement the fix by updating `metro.config.js` to use `expo/metro-config`.
