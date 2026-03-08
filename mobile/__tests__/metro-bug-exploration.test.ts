/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.4, 2.1, 2.2, 2.4**
 * 
 * Property 1: Fault Condition - Metro Entry Point Mismatch
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * GOAL: Surface counterexamples that demonstrate the Metro bundler configuration mismatch
 * 
 * Bug Condition:
 * - input.platform == 'android'
 * - input.buildConfig.entryFile.contains('expo/scripts/resolveAppEntry')
 * - input.metroConfig.preset == '@react-native/metro-config'
 * - bundleRequest.path.contains('.expo/virtual-metro-entry')
 * - metroServer.servingPath == 'index.js'
 * 
 * Expected Behavior (after fix):
 * - result.bundleLoaded == true
 * - result.metroBundlerResponse.statusCode == 200
 * - result.appState == 'running'
 * - NOT result.error.contains('Unable to load script')
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Metro Bundler Bug Condition Exploration', () => {
  const projectRoot = path.resolve(__dirname, '..');
  const metroConfigPath = path.join(projectRoot, 'metro.config.js');
  const buildGradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');

  describe('Bug Condition Verification', () => {
    test('should verify Android build.gradle uses expo/scripts/resolveAppEntry', () => {
      // Read build.gradle
      const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf-8');
      
      // Verify the bug condition: build.gradle uses Expo's entry point resolver
      expect(buildGradleContent).toContain('expo/scripts/resolveAppEntry');
      expect(buildGradleContent).toContain('@expo/cli');
      expect(buildGradleContent).toContain('bundleCommand = "export:embed"');
      
      console.log('✓ Confirmed: Android build.gradle uses Expo entry point resolver');
    });

    test('should verify metro.config.js uses @react-native/metro-config (bug condition)', () => {
      // Read metro.config.js
      const metroConfigContent = fs.readFileSync(metroConfigPath, 'utf-8');
      
      // Verify the bug condition: metro.config uses React Native CLI preset
      expect(metroConfigContent).toContain('@react-native/metro-config');
      expect(metroConfigContent).not.toContain('expo/metro-config');
      
      console.log('✓ Confirmed: metro.config.js uses @react-native/metro-config (React Native CLI preset)');
      console.log('✗ Bug Condition Detected: Configuration mismatch between build.gradle and metro.config.js');
    });

    test('should verify the configuration mismatch exists', () => {
      const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf-8');
      const metroConfigContent = fs.readFileSync(metroConfigPath, 'utf-8');
      
      const usesExpoEntryPoint = buildGradleContent.includes('expo/scripts/resolveAppEntry');
      const usesReactNativeMetroConfig = metroConfigContent.includes('@react-native/metro-config');
      const usesExpoMetroConfig = metroConfigContent.includes('expo/metro-config');
      
      // This is the bug condition: Expo entry point in build.gradle but React Native Metro config
      const bugConditionExists = usesExpoEntryPoint && usesReactNativeMetroConfig && !usesExpoMetroConfig;
      
      expect(bugConditionExists).toBe(true);
      
      console.log('\n=== BUG CONDITION ANALYSIS ===');
      console.log(`Android build.gradle uses Expo entry point: ${usesExpoEntryPoint}`);
      console.log(`metro.config.js uses @react-native/metro-config: ${usesReactNativeMetroConfig}`);
      console.log(`metro.config.js uses expo/metro-config: ${usesExpoMetroConfig}`);
      console.log(`Bug condition exists: ${bugConditionExists}`);
      console.log('==============================\n');
    });
  });

  describe('Expected Behavior Test (will FAIL on unfixed code)', () => {
    test('Metro bundler should serve correct entry point for Expo configuration', async () => {
      // This test encodes the EXPECTED behavior after the fix
      // It WILL FAIL on unfixed code, which confirms the bug exists
      
      const metroConfigContent = fs.readFileSync(metroConfigPath, 'utf-8');
      const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf-8');
      
      // Check if build.gradle expects Expo entry points
      const expectsExpoEntry = buildGradleContent.includes('expo/scripts/resolveAppEntry');
      
      if (expectsExpoEntry) {
        // If build expects Expo entry, Metro config SHOULD use expo/metro-config
        const usesExpoMetroConfig = metroConfigContent.includes('expo/metro-config');
        
        // EXPECTED: Metro config should use expo/metro-config when build uses Expo entry resolver
        // ACTUAL (unfixed): Metro config uses @react-native/metro-config
        expect(usesExpoMetroConfig).toBe(true);
        
        console.log('✓ Metro config correctly uses expo/metro-config to match Expo build configuration');
      }
    }, 10000);
  });

  describe('Counterexample Documentation', () => {
    test('should document the configuration mismatch counterexample', () => {
      const metroConfigContent = fs.readFileSync(metroConfigPath, 'utf-8');
      const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf-8');
      
      console.log('\n=== COUNTEREXAMPLE DOCUMENTATION ===');
      console.log('Bug: Metro bundler configuration mismatch causing runtime crashes');
      console.log('');
      console.log('Counterexample:');
      console.log('1. Android build.gradle is configured to use Expo entry point resolver:');
      console.log('   - Uses: expo/scripts/resolveAppEntry');
      console.log('   - Expects: .expo/virtual-metro-entry.bundle');
      console.log('');
      console.log('2. metro.config.js is configured with React Native CLI preset:');
      console.log('   - Uses: @react-native/metro-config');
      console.log('   - Serves: index.js');
      console.log('');
      console.log('3. Result:');
      console.log('   - App requests: .expo/virtual-metro-entry.bundle');
      console.log('   - Metro serves: index.js');
      console.log('   - HTTP Status: 404 Not Found');
      console.log('   - App State: Crashes with "Unable to load script" error');
      console.log('');
      console.log('Expected Fix:');
      console.log('   - Change metro.config.js to use expo/metro-config');
      console.log('   - This will make Metro serve .expo/virtual-metro-entry.bundle');
      console.log('   - App will load successfully without 404 errors');
      console.log('=====================================\n');
      
      // This assertion will always pass - it's just for documentation
      expect(true).toBe(true);
    });
  });
});
