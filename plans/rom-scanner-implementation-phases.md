# ROM Scanner Implementation - Phased Plan

## Overview

This document breaks down the ROM scanner implementation into small, manageable phases. Each phase should be completed and manually validated before proceeding to the next.

---

## Phase 1: Dependencies and Basic Setup (30 minutes)

### Goals
- Install required dependencies
- Create basic file structure
- Verify dependencies work correctly

### Tasks
1. **Install Core Dependencies**
   ```bash
   npm install effect zod yaml
   expo install expo-file-system expo-crypto expo-device
   ```

2. **Create Directory Structure**
   ```
   src/shared/scanner/
   ├── schemas.ts        # Zod schemas
   ├── types.ts          # TypeScript types
   └── index.ts          # Export barrel
   ```

3. **Create Basic Schema File**
   - Create `src/shared/scanner/schemas.ts` with Platform enum only
   - Create `src/shared/scanner/types.ts` with type exports
   - Create `src/shared/scanner/index.ts` with re-exports

### Validation Criteria
- [ ] All dependencies installed without errors
- [ ] Files created in correct locations
- [ ] Basic schema compiles and can be imported
- [ ] No TypeScript errors in new files

### Files to Create
- `src/shared/scanner/schemas.ts` (Platform schema only)
- `src/shared/scanner/types.ts`
- `src/shared/scanner/index.ts`

---

## Phase 2: Core Schemas Definition (20 minutes)

### Goals
- Define all Zod schemas
- Set up type inference
- Validate schema compilation

### Tasks
1. **Complete Schema Definitions**
   - Add `RomFileSchema` to schemas.ts
   - Add `LocalRomMetadataSchema` to schemas.ts
   - Add `GameEntrySchema` to schemas.ts
   - Add `ScannerConfigSchema` to schemas.ts

2. **Type Exports**
   - Export all inferred types in types.ts
   - Verify type inference works correctly

### Validation Criteria
- [ ] All schemas compile without errors
- [ ] Type inference works (intellisense shows correct types)
- [ ] Can create test objects that pass schema validation
- [ ] No circular dependencies

### Test Validation
Create a simple test in the file to verify schemas work:
```typescript
// Add this test at the bottom of schemas.ts
const testPlatform = PlatformSchema.parse('nes');
const testRomFile = RomFileSchema.parse({
  filename: 'test.nes',
  path: '/test/path',
  extension: '.nes',
  fileSize: 12345,
  lastModified: new Date()
});
```

---

## Phase 3: Utility Functions (30 minutes)

### Goals
- Create React Native compatible path utilities
- Implement data transformation functions
- Test pure functions work correctly

### Tasks
1. **Create Utility File**
   - Create `src/shared/scanner/utils.ts`
   - Implement React Native path utilities (join, basename, dirname, extname)

2. **Data Transformation Functions**
   - Implement `cleanTitle` function
   - Implement `inferPlatformFromExtension` function
   - Add platform-to-extension mapping

3. **Test Utilities**
   - Test path functions with various inputs
   - Test title cleaning with real ROM names
   - Test platform inference with different extensions

### Validation Criteria
- [ ] Path utilities work correctly (test with various path formats)
- [ ] `cleanTitle` removes unwanted characters properly
- [ ] `inferPlatformFromExtension` returns correct platforms
- [ ] All functions are pure (no side effects)

### React Native Test Page
Create `src/apps/android/TestUtilities.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { cleanTitle, inferPlatformFromExtension, path } from '../../../scanner/utils';

const TestUtilities = () => {
  const [results, setResults] = useState<string[]>([]);

  const runTests = () => {
    const testResults = [
      `cleanTitle test: "${cleanTitle('Super Mario Bros (USA).nes')}"`,
      `inferPlatform(.nes): ${JSON.stringify(inferPlatformFromExtension('.nes'))}`,
      `inferPlatform(.gba): ${JSON.stringify(inferPlatformFromExtension('.gba'))}`,
      `path.join('a','b','c'): "${path.join('a', 'b', 'c')}"`,
      `path.basename('/path/to/file.nes'): "${path.basename('/path/to/file.nes')}"`,
      `path.dirname('/path/to/file.nes'): "${path.dirname('/path/to/file.nes')}"`,
      `path.extname('file.nes'): "${path.extname('file.nes')}"`
    ];
    setResults(testResults);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phase 3: Utility Functions Test</Text>
      <Button title="Run Tests" onPress={runTests} />
      {results.map((result, index) => (
        <Text key={index} style={styles.result}>{result}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  result: { fontSize: 14, marginVertical: 4, fontFamily: 'monospace' }
});

export default TestUtilities;
```

### Test Cases to Validate
- All utility functions return expected results
- Path operations work correctly on React Native
- Platform inference covers all supported extensions
- Title cleaning removes unwanted patterns

---

## Phase 4: File System Operations (45 minutes)

### Goals
- Implement React Native file system functions using Effect
- Test basic file operations
- Verify error handling works

### Tasks
1. **Create File Operations File**
   - Create `src/shared/scanner/file-operations.ts`
   - Implement `readDirectory` function
   - Implement `getFileInfo` function
   - Implement `calculateChecksum` function

2. **Test File Operations**
   - Test reading a known directory
   - Test getting info for a known file
   - Test checksum calculation

3. **Error Handling**
   - Test operations with invalid paths
   - Verify error messages are helpful

### Validation Criteria
- [ ] Can read directories successfully
- [ ] Can get file information
- [ ] Checksum calculation works (test with a small file)
- [ ] Error handling works for invalid paths
- [ ] Functions return Effect types correctly

### React Native Test Page
Create `src/apps/android/TestFileOperations.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { runPromise } from 'effect/Effect';
import * as FileSystem from 'expo-file-system';
import { readDirectory, getFileInfo, calculateChecksum } from '../../../scanner/file-operations';

const TestFileOperations = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test reading directory
      addResult('Testing readDirectory...');
      const documentsDir = FileSystem.documentDirectory;
      if (documentsDir) {
        const dirResult = await runPromise(readDirectory(documentsDir));
        addResult(`Found ${dirResult.length} items in documents directory`);
      }

      // Test file info
      addResult('Testing getFileInfo...');
      if (documentsDir) {
        const infoResult = await runPromise(getFileInfo(documentsDir));
        addResult(`Directory info: ${JSON.stringify(infoResult, null, 2)}`);
      }

      // Test creating a file and getting its checksum
      addResult('Testing calculateChecksum...');
      const testFile = `${documentsDir}test-file.txt`;
      await FileSystem.writeAsStringAsync(testFile, 'Hello, ROM Scanner!');
      const checksum = await runPromise(calculateChecksum(testFile));
      addResult(`Test file checksum: ${checksum}`);

      // Test error handling
      addResult('Testing error handling...');
      try {
        await runPromise(readDirectory('/invalid/path'));
      } catch (error) {
        addResult(`Error handling works: ${error}`);
      }

    } catch (error) {
      addResult(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phase 4: File Operations Test</Text>
      <Button
        title={loading ? "Running Tests..." : "Run Tests"}
        onPress={runTests}
        disabled={loading}
      />
      {results.map((result, index) => (
        <Text key={index} style={styles.result}>{result}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  result: { fontSize: 12, marginVertical: 2, fontFamily: 'monospace' }
});

export default TestFileOperations;
```

### Manual Testing
- Test directory reading with real device paths
- Verify file information extraction works
- Test checksum calculation with actual files
- Confirm error handling for invalid paths

---

## Phase 5: Basic Directory Scanning (45 minutes)

### Goals
- Implement recursive directory scanning
- Filter ROM files by extension
- Return structured ROM file data

### Tasks
1. **Create Scanner Core**
   - Create `src/shared/scanner/scanner.ts`
   - Implement `scanDirectoryRecursive` function
   - Add file filtering logic

2. **ROM File Processing**
   - Implement `parseRomFile` function
   - Connect file scanning with metadata extraction

3. **Test Scanning**
   - Test with a directory containing ROM files
   - Verify recursive scanning works
   - Check file filtering works correctly

### Validation Criteria
- [ ] Recursive scanning finds all ROM files
- [ ] Non-ROM files are filtered out
- [ ] Subdirectories are scanned correctly
- [ ] ROM file metadata is extracted properly
- [ ] Platform detection works from file extensions

### React Native Test Page
Create `src/apps/android/TestDirectoryScanning.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { runPromise } from 'effect/Effect';
import * as FileSystem from 'expo-file-system';
import { scanDirectoryRecursive, parseRomFile } from '../../../scanner/scanner';

const TestDirectoryScanning = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const setupTestFiles = async () => {
    const testDir = `${FileSystem.documentDirectory}test-roms/`;

    // Create test directory structure
    await FileSystem.makeDirectoryAsync(testDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(`${testDir}nes/`, { intermediates: true });
    await FileSystem.makeDirectoryAsync(`${testDir}gameboy/`, { intermediates: true });

    // Create fake ROM files
    await FileSystem.writeAsStringAsync(`${testDir}nes/Super Mario Bros.nes`, 'fake nes rom data');
    await FileSystem.writeAsStringAsync(`${testDir}nes/Zelda (USA).nes`, 'fake nes rom data 2');
    await FileSystem.writeAsStringAsync(`${testDir}gameboy/Pokemon Red.gb`, 'fake gb rom data');

    // Create non-ROM files (should be ignored)
    await FileSystem.writeAsStringAsync(`${testDir}readme.txt`, 'not a rom file');
    await FileSystem.writeAsStringAsync(`${testDir}nes/save.sav`, 'save file');

    addResult(`Created test files in: ${testDir}`);
    return testDir;
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Setup test files
      const testDir = await setupTestFiles();

      // Test directory scanning
      addResult('Testing recursive directory scanning...');
      const supportedExtensions = ['.nes', '.gb', '.gbc', '.gba', '.snes'];
      const romFiles = await runPromise(scanDirectoryRecursive(testDir, supportedExtensions));

      addResult(`Found ${romFiles.length} ROM files:`);
      romFiles.forEach((rom, index) => {
        addResult(`  ${index + 1}. ${rom.filename} (${rom.extension}) - ${rom.fileSize} bytes`);
      });

      // Test ROM file parsing
      if (romFiles.length > 0) {
        addResult('Testing ROM file parsing...');
        const firstRom = romFiles[0];
        const metadata = await runPromise(parseRomFile(firstRom));
        addResult(`Parsed metadata: ${JSON.stringify(metadata, null, 2)}`);
      }

    } catch (error) {
      addResult(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phase 5: Directory Scanning Test</Text>
      <Button
        title={loading ? "Running Tests..." : "Run Tests"}
        onPress={runTests}
        disabled={loading}
      />
      {results.map((result, index) => (
        <Text key={index} style={styles.result}>{result}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  result: { fontSize: 11, marginVertical: 1, fontFamily: 'monospace' }
});

export default TestDirectoryScanning;
```

### Test Setup
- Creates test directory structure with ROM and non-ROM files
- Tests recursive scanning finds only ROM files
- Verifies ROM file parsing extracts correct metadata
- Tests platform detection from file extensions

---

## Phase 6: Main Scanner Pipeline (30 minutes)

### Goals
- Implement main `scanRoms` function
- Connect all components together
- Process multiple scan paths

### Tasks
1. **Main Scanner Function**
   - Implement `scanRoms` function in scanner.ts
   - Process multiple directories
   - Transform ROM files to GameEntry format

2. **Game Entry Generation**
   - Generate unique game IDs
   - Set up hosts array
   - Create complete GameEntry objects

3. **Integration Testing**
   - Test scanning multiple directories
   - Verify game entries are generated correctly
   - Check duplicate handling

### Validation Criteria
- [ ] Can scan multiple directories
- [ ] Game entries have unique IDs
- [ ] All required fields are populated
- [ ] No duplicate games in results
- [ ] Error handling works for missing directories

### React Native Test Page
Create `src/apps/android/TestScannerPipeline.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { runPromise } from 'effect/Effect';
import * as FileSystem from 'expo-file-system';
import { scanRoms } from '../../../scanner/scanner';

const TestScannerPipeline = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const setupTestEnvironment = async () => {
    const testDir1 = `${FileSystem.documentDirectory}test-roms-1/`;
    const testDir2 = `${FileSystem.documentDirectory}test-roms-2/`;

    // Create multiple test directories
    await FileSystem.makeDirectoryAsync(testDir1, { intermediates: true });
    await FileSystem.makeDirectoryAsync(testDir2, { intermediates: true });

    // Create ROM files in different directories
    await FileSystem.writeAsStringAsync(`${testDir1}Super Mario Bros.nes`, 'mario rom data');
    await FileSystem.writeAsStringAsync(`${testDir1}Zelda.nes`, 'zelda rom data');
    await FileSystem.writeAsStringAsync(`${testDir2}Pokemon Red.gb`, 'pokemon rom data');
    await FileSystem.writeAsStringAsync(`${testDir2}Sonic.genesis`, 'sonic rom data');

    return [testDir1, testDir2];
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Setup test environment
      const scanPaths = await setupTestEnvironment();
      addResult(`Setup complete. Scanning paths: ${scanPaths.join(', ')}`);

      // Test main scanner pipeline
      addResult('Running main scanner pipeline...');
      const supportedExtensions = ['.nes', '.gb', '.gbc', '.gba', '.genesis', '.md'];
      const games = await runPromise(scanRoms(scanPaths, supportedExtensions));

      addResult(`Found ${games.length} games:`);
      games.forEach((game, index) => {
        addResult(`  ${index + 1}. ID: ${game.id}`);
        addResult(`     Title: ${game.release.title}`);
        addResult(`     Platform: ${game.platform}`);
        addResult(`     Files: ${game.files.length}`);
        addResult(`     Hosts: ${game.hosts.join(', ')}`);
        addResult(`     Last Modified: ${game.lastModified}`);
        addResult('');
      });

      // Test duplicate detection
      const gameIds = games.map(g => g.id);
      const uniqueIds = new Set(gameIds);
      if (gameIds.length === uniqueIds.size) {
        addResult('✅ All game IDs are unique');
      } else {
        addResult('❌ Found duplicate game IDs');
      }

    } catch (error) {
      addResult(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phase 6: Scanner Pipeline Test</Text>
      <Button
        title={loading ? "Running Tests..." : "Run Tests"}
        onPress={runTests}
        disabled={loading}
      />
      {results.map((result, index) => (
        <Text key={index} style={styles.result}>{result}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  result: { fontSize: 11, marginVertical: 1, fontFamily: 'monospace' }
});

export default TestScannerPipeline;
```

---

## Phase 7: YAML Export Functionality (20 minutes)

### Goals
- Implement YAML export
- Create proper output structure
- Test YAML generation

### Tasks
1. **YAML Export**
   - Implement `exportToYaml` function
   - Add metadata section with scan date
   - Format games array properly

2. **File Writing**
   - Implement YAML file writing to disk
   - Handle file write errors
   - Test output file format

### Validation Criteria
- [ ] YAML output is valid
- [ ] File structure matches expected format
- [ ] Can write to device storage
- [ ] YAML file can be read back and parsed
- [ ] Generated content is human-readable

### React Native Test Page
Create `src/apps/android/TestYamlExport.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { runPromise } from 'effect/Effect';
import * as FileSystem from 'expo-file-system';
import { scanRoms, exportToYaml } from '../../../scanner/scanner';

const TestYamlExport = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const setupTestGames = async () => {
    const testDir = `${FileSystem.documentDirectory}yaml-test/`;
    await FileSystem.makeDirectoryAsync(testDir, { intermediates: true });

    // Create test ROM files
    await FileSystem.writeAsStringAsync(`${testDir}Super Mario Bros (USA).nes`, 'mario rom data');
    await FileSystem.writeAsStringAsync(`${testDir}Pokemon Red (USA, Europe).gb`, 'pokemon rom data');
    await FileSystem.writeAsStringAsync(`${testDir}Sonic the Hedgehog.genesis`, 'sonic rom data');

    return testDir;
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Setup test games
      const testDir = await setupTestGames();
      addResult('Created test ROM files');

      // Scan for games
      addResult('Scanning for games...');
      const supportedExtensions = ['.nes', '.gb', '.gbc', '.gba', '.genesis', '.md'];
      const games = await runPromise(scanRoms([testDir], supportedExtensions));
      addResult(`Found ${games.length} games to export`);

      // Test YAML export
      addResult('Generating YAML...');
      const yamlContent = exportToYaml(games);
      addResult('YAML generated successfully');

      // Save YAML to file
      const yamlPath = `${FileSystem.documentDirectory}test-games.yaml`;
      await FileSystem.writeAsStringAsync(yamlPath, yamlContent);
      addResult(`YAML saved to: ${yamlPath}`);

      // Read back and display first few lines
      const savedContent = await FileSystem.readAsStringAsync(yamlPath);
      const previewLines = savedContent.split('\n').slice(0, 20);
      addResult('YAML file preview (first 20 lines):');
      previewLines.forEach((line, index) => {
        addResult(`${String(index + 1).padStart(2, '0')}: ${line}`);
      });

      // Validate YAML structure
      if (savedContent.includes('metadata:') && savedContent.includes('games:')) {
        addResult('✅ YAML structure is correct');
      } else {
        addResult('❌ YAML structure is missing required sections');
      }

      // Check file size
      const fileInfo = await FileSystem.getInfoAsync(yamlPath);
      addResult(`File size: ${fileInfo.size} bytes`);

    } catch (error) {
      addResult(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phase 7: YAML Export Test</Text>
      <Button
        title={loading ? "Running Tests..." : "Run Tests"}
        onPress={runTests}
        disabled={loading}
      />
      {results.map((result, index) => (
        <Text key={index} style={styles.result}>{result}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  result: { fontSize: 10, marginVertical: 1, fontFamily: 'monospace' }
});

export default TestYamlExport;
```

### Manual Validation
- Generate YAML file and inspect contents
- Verify YAML structure includes metadata and games sections
- Test file is saved to expected location and can be read back
- Validate YAML syntax is correct

---

## Phase 8: React Hook Integration (30 minutes)

### Goals
- Create React hook for scanner
- Integrate with React state
- Handle loading states

### Tasks
1. **Create React Hook**
   - Create `src/shared/scanner/useRomScanner.ts`
   - Implement `useRomScanner` hook
   - Add loading state management

2. **Integration**
   - Connect hook to scanner functions
   - Handle async operations properly
   - Add error state management

3. **Configuration**
   - Set up default scan paths
   - Configure supported extensions
   - Add scanner settings

### Validation Criteria
- [ ] Hook compiles without errors
- [ ] Loading states work correctly
- [ ] Can trigger scans from React component
- [ ] Results are returned properly
- [ ] Error handling works in React context

---

## Phase 9: Basic UI Component (45 minutes)

### Goals
- Create simple scanner UI
- Test integration with existing app
- Validate end-to-end functionality

### Tasks
1. **Create Scanner Component**
   - Create `src/shared/ui/src/components/RomScanner.tsx`
   - Implement basic UI with scan button
   - Display scan results

2. **Styling**
   - Add basic styles for ROM list
   - Style scan button and loading states
   - Make UI responsive

3. **Integration Test**
   - Add scanner to existing app
   - Test full workflow
   - Verify YAML file generation

### Validation Criteria
- [ ] UI component renders correctly
- [ ] Scan button triggers scanning
- [ ] Results are displayed properly
- [ ] Loading states are shown
- [ ] YAML file is generated and saved

---

## Phase 10: Integration with Existing App (30 minutes)

### Goals
- Add scanner to existing navigation
- Connect with game loading system
- Test full integration

### Tasks
1. **Add to Navigation**
   - Add scanner screen/tab to existing app
   - Update navigation structure

2. **Connect with Game System**
   - Integration point for generated YAML
   - Connect scanner results with game launcher

3. **Final Testing**
   - Test complete workflow
   - Verify compatibility with existing features
   - Performance testing with real ROM files

### Validation Criteria
- [ ] Scanner is accessible from main app
- [ ] Generated games can be launched
- [ ] No conflicts with existing functionality
- [ ] Performance is acceptable
- [ ] Memory usage is reasonable

---

## Validation Checklist Template

For each phase, use this checklist:

### Technical Validation
- [ ] Code compiles without errors
- [ ] TypeScript types are correct
- [ ] No console errors in development
- [ ] Functions work as expected

### Functional Validation
- [ ] Features work as described
- [ ] Error cases are handled
- [ ] Expected outputs are generated
- [ ] Integration points work correctly

### Manual Testing
- [ ] Test with real data
- [ ] Verify file operations work
- [ ] Check UI responsiveness (if applicable)
- [ ] Validate generated files

### Before Next Phase
- [ ] All tasks completed
- [ ] All validation criteria met
- [ ] No breaking changes to existing code
- [ ] Ready to proceed to next phase

---

## Dependencies Timeline

- **Phases 1-3**: No dependencies on existing code
- **Phases 4-7**: Independent scanner functionality
- **Phases 8-9**: Requires React integration
- **Phase 10**: Requires existing app integration

This structure allows for early validation of core functionality before integrating with the existing codebase.
