// Test setup file for vitest
// This file is executed before all tests run
import { beforeEach, vi } from 'vitest';

// Define global variables that Expo/React Native expects
global.__DEV__ = true;

// Mock any other React Native modules if needed
export {};