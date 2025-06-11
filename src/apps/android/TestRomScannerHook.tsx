import React from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useRomScanner } from '../../shared/scanner/useRomScanner';

export const TestRomScannerHook: React.FC = () => {
  const {
    games,
    isLoading,
    error,
    lastScanDate,
    totalGames,
    scanForGames,
    exportToYamlFile,
    clearResults,
    clearError,
    config
  } = useRomScanner({
    scanPaths: [
      `${FileSystem.documentDirectory}test-roms`,
      `${FileSystem.documentDirectory}roms`
    ]
  });

  const handleScan = async () => {
    try {
      await scanForGames();
    } catch (err) {
      Alert.alert('Scan Error', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportToYamlFile();
      if (result) {
        Alert.alert('Export Success', `YAML exported to: ${result}`);
      }
    } catch (err) {
      Alert.alert('Export Error', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const createTestRoms = async () => {
    try {
      const testDir = `${FileSystem.documentDirectory}test-roms`;
      
      // Create test directory
      await FileSystem.makeDirectoryAsync(testDir, { intermediates: true });
      
      // Create test ROM files
      const testRoms = [
        'Super Mario Bros.nes',
        'Zelda - A Link to the Past.sfc',
        'Pokemon Red.gb',
        'Sonic the Hedgehog.gen',
        'Super Mario 64.n64'
      ];

      for (const romName of testRoms) {
        const romPath = `${testDir}/${romName}`;
        await FileSystem.writeAsStringAsync(romPath, `Test ROM content for ${romName}`);
      }

      Alert.alert('Success', `Created ${testRoms.length} test ROM files in ${testDir}`);
    } catch (err) {
      Alert.alert('Error', `Failed to create test ROMs: ${err}`);
    }
  };

  const removeTestRoms = async () => {
    try {
      const testDir = `${FileSystem.documentDirectory}test-roms`;
      const info = await FileSystem.getInfoAsync(testDir);
      
      if (info.exists) {
        await FileSystem.deleteAsync(testDir, { idempotent: true });
        Alert.alert('Success', 'Test ROM directory removed');
        clearResults();
      } else {
        Alert.alert('Info', 'Test ROM directory does not exist');
      }
    } catch (err) {
      Alert.alert('Error', `Failed to remove test ROMs: ${err}`);
    }
  };

  const readYamlFile = async () => {
    try {
      const yamlPath = `${FileSystem.documentDirectory}scan-results.yaml`;
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(yamlPath);
      if (!fileInfo.exists) {
        Alert.alert('No YAML File', 'No YAML file found. Export to YAML first to create one.');
        return;
      }

      const yamlContent = await FileSystem.readAsStringAsync(yamlPath);
      
      Alert.alert(
        'YAML File Contents', 
        `File size: ${fileInfo.size} bytes\n\nContent:\n${yamlContent.substring(0, 500)}${yamlContent.length > 500 ? '...\n\n[Content truncated]' : ''}`
      );
      
    } catch (err) {
      Alert.alert('Read Error', `Failed to read YAML file: ${err}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phase 8: ROM Scanner Hook Test</Text>

      {/* Scanner Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isLoading ? 'Scanning...' : 'Ready'}
        </Text>
        <Text style={styles.statusText}>
          Total Games: {totalGames}
        </Text>
        {lastScanDate && (
          <Text style={styles.statusText}>
            Last Scan: {lastScanDate.toLocaleString()}
          </Text>
        )}
      </View>

      {/* Configuration Info */}
      <View style={styles.configContainer}>
        <Text style={styles.sectionTitle}>Configuration:</Text>
        <Text style={styles.configText}>Scan Paths:</Text>
        {config.scanPaths.map((path, index) => (
          <Text key={index} style={styles.pathText}>• {path}</Text>
        ))}
        <Text style={styles.configText}>
          Extensions: {config.supportedExtensions.join(', ')}
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button title="Clear Error" onPress={clearError} />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Create Test ROMs"
          onPress={createTestRoms}
          disabled={isLoading}
        />
        <Button
          title={isLoading ? "Scanning..." : "Scan for ROMs"}
          onPress={handleScan}
          disabled={isLoading}
        />
        <Button
          title="Export to YAML"
          onPress={handleExport}
          disabled={isLoading || totalGames === 0}
        />
        <Button
          title="READ YAML FILE"
          onPress={readYamlFile}
          disabled={isLoading}
        />
        <Button
          title="Clear Results"
          onPress={clearResults}
          disabled={isLoading}
        />
        <Button
          title="Remove Test ROMs"
          onPress={removeTestRoms}
          disabled={isLoading}
        />
      </View>

      {/* Games List */}
      {games.length > 0 && (
        <View style={styles.gamesContainer}>
          <Text style={styles.sectionTitle}>Found Games:</Text>
          <ScrollView style={styles.gamesList}>
            {games.map((game, index) => (
              <View key={game.id} style={styles.gameItem}>
                <Text style={styles.gameTitle}>{game.release.title}</Text>
                <Text style={styles.gameDetails}>
                  Platform: {game.platform} | ID: {game.id}
                </Text>
                <Text style={styles.gameDetails}>
                  Files: {game.files.length} | Size: {game.files[0]?.size || 0} bytes
                </Text>
                <Text style={styles.gameDetails}>
                  Path: {game.files[0]?.path || 'N/A'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  statusContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4
  },
  configContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  configText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4
  },
  pathText: {
    fontSize: 11,
    marginLeft: 8,
    fontFamily: 'monospace'
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f44336'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 16
  },
  gamesContainer: {
    flex: 1
  },
  gamesList: {
    maxHeight: 400
  },
  gameItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  gameDetails: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace'
  }
});

export default TestRomScannerHook;