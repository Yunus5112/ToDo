import '@testing-library/jest-native/extend-expect';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children, ...props }) => children,
  Stack: {
    Screen: ({ children }) => children,
  },
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(),
  SQLiteProvider: ({ children }) => children,
}));

// Mock drizzle
jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(),
}));

// Mock expo-network
jest.mock('expo-network', () => ({
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
}));
