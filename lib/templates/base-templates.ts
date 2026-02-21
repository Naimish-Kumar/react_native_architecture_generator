import type { GeneratorConfig } from '../models/config.js';
import { Routing, StateManagement } from '../models/config.js';

/**
 * Template generators for all base files in the React Native Clean Architecture project.
 */
export class BaseTemplates {

  // ──────────── App Entry Point ────────────
  static appEntryContent(config: GeneratorConfig): string {
    const firebaseImport = config.firebase
      ? `import { initializeApp } from '@react-native-firebase/app';\n`
      : '';
    const firebaseInit = config.firebase
      ? `  // Initialize Firebase\n  initializeApp();\n`
      : '';

    return `import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
${firebaseImport}import { AppNavigator } from './navigation/AppNavigator';
import { ThemeProvider } from './core/theme/ThemeContext';
${config.stateManagement === StateManagement.redux ? `import { Provider } from 'react-redux';\nimport { store } from './state/store';\n` : ''}${config.stateManagement === StateManagement.zustand ? `// Zustand stores are used directly via hooks\n` : ''}${config.stateManagement === StateManagement.context ? `import { AppProvider } from './state/AppContext';\n` : ''}
const App: React.FC = () => {
  useEffect(() => {
${firebaseInit}    // App initialization logic
  }, []);

  return (
${config.stateManagement === StateManagement.redux ? `    <Provider store={store}>
      <ThemeProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </ThemeProvider>
    </Provider>` : config.stateManagement === StateManagement.context ? `    <AppProvider>
      <ThemeProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </ThemeProvider>
    </AppProvider>` : `    <ThemeProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </ThemeProvider>`}
  );
};

export default App;
`;
  }

  // ──────────── API Client ────────────
  static apiClientContent(): string {
    return `import axios from 'axios';
import Config from 'react-native-config';

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    // const token = await AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = \`Bearer \${token}\`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (401, 403, 500, etc.)
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
`;
  }

  // ──────────── Error / Failures ────────────
  static failuresContent(): string {
    return `export abstract class Failure {
  readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class ServerFailure extends Failure {
  constructor(message = 'Server Error') {
    super(message);
  }
}

export class CacheFailure extends Failure {
  constructor(message = 'Cache Error') {
    super(message);
  }
}

export class NetworkFailure extends Failure {
  constructor(message = 'Network Error') {
    super(message);
  }
}

export class GeneralFailure extends Failure {
  constructor(message = 'Unexpected Error') {
    super(message);
  }
}
`;
  }

  // ──────────── Theme ────────────
  static themeContent(): string {
    return `import { StyleSheet } from 'react-native';

export const Colors = {
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  accent: '#FF4081',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#F44336',
  textPrimary: '#212121',
  textSecondary: '#757575',
  divider: '#BDBDBD',
  // Dark mode
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#B3B3B3',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 20,
  headline: 24,
  display: 32,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenPadding: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
`;
  }

  // ──────────── Theme Context (light/dark mode) ────────────
  static themeContextContent(): string {
    return `import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './AppTheme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof Colors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';

  const colors = useMemo(() => ({
    ...Colors,
    background: isDark ? Colors.darkBackground : Colors.background,
    surface: isDark ? Colors.darkSurface : Colors.surface,
    textPrimary: isDark ? Colors.darkTextPrimary : Colors.textPrimary,
    textSecondary: isDark ? Colors.darkTextSecondary : Colors.textSecondary,
  }), [isDark]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
`;
  }

  // ──────────── Navigation / Routing ────────────
  static navigationContent(config: GeneratorConfig): string {
    if (config.routing === Routing.expoRouter) {
      return `// Expo Router uses file-based routing.
// Create your routes in the app/ directory.
// See: https://docs.expo.dev/router/introduction/

export {};
`;
    }

    // React Navigation
    return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens here
// import { LoginScreen } from '../features/auth/presentation/screens/LoginScreen';
// import { RegisterScreen } from '../features/auth/presentation/screens/RegisterScreen';

export type RootStackParamList = {
  // Define your route params here
  // Login: undefined;
  // Register: undefined;
  // Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* Add your screens here */}
        {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
        {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
`;
  }

  // ──────────── State Management (Store) ────────────
  static storeContent(config: GeneratorConfig): string {
    switch (config.stateManagement) {
      case StateManagement.redux:
        return `import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    // Add feature reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`;

      case StateManagement.zustand:
        return `// Zustand stores are defined per-feature.
// Each feature creates its own store using zustand's create().
//
// Example:
// import { create } from 'zustand';
//
// interface AuthState {
//   isLoggedIn: boolean;
//   login: () => void;
//   logout: () => void;
// }
//
// export const useAuthStore = create<AuthState>((set) => ({
//   isLoggedIn: false,
//   login: () => set({ isLoggedIn: true }),
//   logout: () => set({ isLoggedIn: false }),
// }));

export {};
`;

      case StateManagement.context:
        return `import React, { createContext, useContext, useReducer } from 'react';

// Define your global app state here
interface AppState {
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  isLoading: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
`;
    }
  }

  // ──────────── Constants ────────────
  static constantsContent(): string {
    return `export const AppConstants = {
  appName: 'React Native App',
  apiVersion: 'v1',
  cacheTimeout: 60 * 60 * 1000, // 1 hour in ms
} as const;
`;
  }

  // ──────────── .gitignore ────────────
  static gitignoreContent(): string {
    return `# Environment files
.env*
!.env.example

# Generator config
.rn_arch_gen.json

# Dependencies
node_modules/

# React Native
android/app/build/
ios/Pods/
ios/build/
*.hprof

# Metro
.metro-health-check*

# IDE
.idea/
.vscode/
*.iml
*.xcworkspace
*.xcuserdata

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
`;
  }

  // ──────────── Test file ────────────
  static sampleTestContent(): string {
    return `describe('Sample Test', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
`;
  }

  // ──────────── Localization (i18n) ────────────
  static i18nConfigContent(): string {
    return `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
`;
  }

  static localeEnContent(): string {
    return `{
  "appTitle": "React Native App",
  "welcome": "Welcome",
  "login": "Login",
  "register": "Register",
  "email": "Email",
  "password": "Password"
}
`;
  }
}
