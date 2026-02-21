import fs from 'fs-extra';
import path from 'path';
import type { GeneratorConfig } from '../models/config.js';
import { Architecture, StateManagement, Routing } from '../models/config.js';
import { StringUtils } from './string-utils.js';

/**
 * Generates feature modules in 4 different architecture patterns:
 *   1. Clean Architecture (Domain → Data → Presentation)
 *   2. Feature-Based (Lightweight, flat structure)
 *   3. Atomic Design + Feature (Atoms → Molecules → Organisms)
 *   4. MVVM with Hooks (Model → ViewModel → View)
 */
export class FeatureHelper {
  static async generateFeature(name: string, config: GeneratorConfig): Promise<void> {
    switch (config.architecture) {
      case Architecture.cleanArchitecture:
        await this.generateCleanArchFeature(name, config);
        break;
      case Architecture.featureBased:
        await this.generateFeatureBasedFeature(name, config);
        break;
      case Architecture.atomicDesign:
        await this.generateAtomicDesignFeature(name, config);
        break;
      case Architecture.mvvm:
        await this.generateMvvmFeature(name, config);
        break;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  1. CLEAN ARCHITECTURE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async generateCleanArchFeature(name: string, config: GeneratorConfig): Promise<void> {
    const root = process.cwd();
    const snakeName = StringUtils.toSnakeCase(name);
    const pascalName = StringUtils.toPascalCase(name);
    const featurePath = path.join(root, 'src', 'features', snakeName);

    // Directories
    const layers = [
      'data/datasources',
      'data/models',
      'data/repositories',
      'domain/entities',
      'domain/repositories',
      'domain/usecases',
      'presentation/screens',
      'presentation/components',
      'presentation/hooks',
      `presentation/${config.stateManagement}`,
    ];
    for (const layer of layers) {
      await fs.ensureDir(path.join(featurePath, layer));
    }

    // Entity
    await this.writeFile(
      path.join(featurePath, 'domain', 'entities', `${snakeName}Entity.ts`),
      `export interface ${pascalName}Entity {\n  id: number;\n}\n`
    );

    // Repository interface
    await this.writeFile(
      path.join(featurePath, 'domain', 'repositories', `${pascalName}Repository.ts`),
      `import type { ${pascalName}Entity } from '../entities/${snakeName}Entity';\n\nexport interface I${pascalName}Repository {\n  get${pascalName}Data(): Promise<${pascalName}Entity>;\n}\n`
    );

    // Use Case
    await this.writeFile(
      path.join(featurePath, 'domain', 'usecases', `Get${pascalName}UseCase.ts`),
      `import type { I${pascalName}Repository } from '../repositories/${pascalName}Repository';
import type { ${pascalName}Entity } from '../entities/${snakeName}Entity';

export class Get${pascalName}UseCase {
  constructor(private repository: I${pascalName}Repository) {}

  async execute(): Promise<${pascalName}Entity> {
    return this.repository.get${pascalName}Data();
  }
}
`
    );

    // Model
    await this.writeFile(
      path.join(featurePath, 'data', 'models', `${pascalName}Model.ts`),
      `import type { ${pascalName}Entity } from '../../domain/entities/${snakeName}Entity';

export class ${pascalName}Model implements ${pascalName}Entity {
  id: number;

  constructor(data: { id: number }) {
    this.id = data.id;
  }

  static fromJson(json: Record<string, unknown>): ${pascalName}Model {
    return new ${pascalName}Model({ id: json['id'] as number });
  }

  toJson(): Record<string, unknown> {
    return { id: this.id };
  }
}
`
    );

    // Data Source
    await this.writeFile(
      path.join(featurePath, 'data', 'datasources', `${pascalName}RemoteDataSource.ts`),
      `import apiClient from '../../../core/api/apiClient';
import { ${pascalName}Model } from '../models/${pascalName}Model';

export interface I${pascalName}RemoteDataSource {
  get${pascalName}FromApi(): Promise<${pascalName}Model>;
}

export class ${pascalName}RemoteDataSourceImpl implements I${pascalName}RemoteDataSource {
  async get${pascalName}FromApi(): Promise<${pascalName}Model> {
    const response = await apiClient.get('/${snakeName}');
    return ${pascalName}Model.fromJson(response.data);
  }
}
`
    );

    // Repository Impl
    await this.writeFile(
      path.join(featurePath, 'data', 'repositories', `${pascalName}RepositoryImpl.ts`),
      `import type { I${pascalName}Repository } from '../../domain/repositories/${pascalName}Repository';
import type { ${pascalName}Entity } from '../../domain/entities/${snakeName}Entity';
import type { I${pascalName}RemoteDataSource } from '../datasources/${pascalName}RemoteDataSource';
import { ServerFailure } from '../../../core/errors/failures';

export class ${pascalName}RepositoryImpl implements I${pascalName}Repository {
  constructor(private remoteDataSource: I${pascalName}RemoteDataSource) {}

  async get${pascalName}Data(): Promise<${pascalName}Entity> {
    try {
      return await this.remoteDataSource.get${pascalName}FromApi();
    } catch (error) {
      throw new ServerFailure(String(error));
    }
  }
}
`
    );

    // State Management
    await this.generateStateManagement(featurePath, name, config, 'presentation');

    // Screens
    if (name === 'auth') {
      await this.generateAuthScreens(featurePath, config, 'presentation/screens');
    } else {
      await this.generateDefaultScreen(featurePath, name, 'presentation/screens');
    }

    // Navigation Registration
    await this.registerInNavigation(name, config);

    // Tests
    if (config.tests) {
      await this.generateCleanArchTest(name, config);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  2. FEATURE-BASED (LIGHTWEIGHT)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async generateFeatureBasedFeature(name: string, config: GeneratorConfig): Promise<void> {
    const root = process.cwd();
    const snakeName = StringUtils.toSnakeCase(name);
    const pascalName = StringUtils.toPascalCase(name);
    const camelName = StringUtils.toCamelCase(name);
    const featurePath = path.join(root, 'src', 'features', snakeName);

    const dirs = [
      'components',
      'hooks',
      'screens',
      'services',
      'types',
      'utils',
    ];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(featurePath, dir));
    }

    // Types
    await this.writeFile(
      path.join(featurePath, 'types', `${camelName}.types.ts`),
      `export interface ${pascalName} {\n  id: number;\n}\n`
    );

    // Service
    await this.writeFile(
      path.join(featurePath, 'services', `${camelName}.service.ts`),
      `import apiClient from '../../core/api/apiClient';
import type { ${pascalName} } from '../types/${camelName}.types';

export const ${camelName}Service = {
  async getAll(): Promise<${pascalName}[]> {
    const response = await apiClient.get('/${snakeName}');
    return response.data;
  },
};
`
    );

    // Hook
    await this.writeFile(
      path.join(featurePath, 'hooks', `use${pascalName}.ts`),
      `import { useState, useCallback } from 'react';
import type { ${pascalName} } from '../types/${camelName}.types';
import { ${camelName}Service } from '../services/${camelName}.service';

export const use${pascalName} = () => {
  const [data, setData] = useState<${pascalName} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ${camelName}Service.getAll();
      setData(result[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, fetch };
};
`
    );

    // Screens
    if (name === 'auth') {
      await this.generateAuthScreens(featurePath, config, 'screens');
    } else {
      await this.generateDefaultScreen(featurePath, name, 'screens');
    }

    await this.registerInNavigation(name, config);

    if (config.tests) {
      await this.generateFeatureBasedTest(name, config);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  3. ATOMIC DESIGN + FEATURE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async generateAtomicDesignFeature(name: string, config: GeneratorConfig): Promise<void> {
    const root = process.cwd();
    const snakeName = StringUtils.toSnakeCase(name);
    const pascalName = StringUtils.toPascalCase(name);
    const camelName = StringUtils.toCamelCase(name);
    const featurePath = path.join(root, 'src', 'features', snakeName);

    const dirs = ['atoms', 'molecules', 'organisms', 'templates', 'screens', 'hooks', 'services', 'types'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(featurePath, dir));
    }

    // Atom: Button (Theme-aware)
    await this.writeFile(
      path.join(featurePath, 'atoms', `${pascalName}Button.tsx`),
      `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../core/theme/ThemeContext';

interface Props { title: string; onPress: () => void; }

export const ${pascalName}Button: React.FC<Props> = ({ title, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
`
    );

    // Molecule: FormField
    await this.writeFile(
      path.join(featurePath, 'molecules', `${pascalName}FormField.tsx`),
      `import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../../core/theme/ThemeContext';

interface Props { label: string; value: string; onChangeText: (t: string) => void; }

export const ${pascalName}FormField: React.FC<Props> = ({ label, value, onChangeText }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      <TextInput style={[styles.input, { borderColor: colors.divider }]} value={value} onChangeText={onChangeText} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
});
`
    );

    // Screens
    if (name === 'auth') {
      await this.generateAuthScreens(featurePath, config, 'screens');
    } else {
      await this.generateDefaultScreen(featurePath, name, 'screens');
    }

    await this.registerInNavigation(name, config);
    if (config.tests) await this.generateAtomicDesignTest(name, config);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  4. MVVM WITH HOOKS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async generateMvvmFeature(name: string, config: GeneratorConfig): Promise<void> {
    const root = process.cwd();
    const snakeName = StringUtils.toSnakeCase(name);
    const pascalName = StringUtils.toPascalCase(name);
    const camelName = StringUtils.toCamelCase(name);
    const featurePath = path.join(root, 'src', 'features', snakeName);

    const dirs = ['models', 'viewmodels', 'views/screens', 'views/components', 'services'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(featurePath, dir));
    }

    // ViewModel
    await this.writeFile(
      path.join(featurePath, 'viewmodels', `use${pascalName}ViewModel.ts`),
      `import { useState, useCallback } from 'react';

export const use${pascalName}ViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const fetchData = useCallback(() => { /* ... */ }, []);
  return { isLoading, fetchData };
};
`
    );

    // Screen
    if (name === 'auth') {
      await this.generateAuthScreens(featurePath, config, 'views/screens');
    } else {
      await this.generateDefaultScreen(featurePath, name, 'views/screens');
    }

    await this.registerInNavigation(name, config, 'views/screens');
    if (config.tests) await this.generateMvvmTest(name, config);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  SHARED: State Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async generateStateManagement(
    featurePath: string,
    name: string,
    config: GeneratorConfig,
    baseFolder: string
  ): Promise<void> {
    const pascalName = StringUtils.toPascalCase(name);
    const camelName = StringUtils.toCamelCase(name);
    const smPath = path.join(featurePath, baseFolder, config.stateManagement);

    switch (config.stateManagement) {
      case StateManagement.redux:
        await this.writeFile(
          path.join(smPath, `${camelName}Slice.ts`),
          `import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const ${camelName}Slice = createSlice({
  name: '${camelName}',
  initialState: { data: null, isLoading: false },
  reducers: {
    setData: (state, action: PayloadAction<any>) => { state.data = action.payload; },
  },
});

export const { setData } = ${camelName}Slice.actions;
export default ${camelName}Slice.reducer;
`
        );
        break;
      case StateManagement.zustand:
        await this.writeFile(
          path.join(smPath, `use${pascalName}Store.ts`),
          `import { create } from 'zustand';

export const use${pascalName}Store = create<any>((set) => ({
  data: null,
  setData: (data: any) => set({ data }),
}));
`
        );
        break;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  SHARED: Auth Screens (Theme Integrated)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async generateAuthScreens(
    featurePath: string,
    config: GeneratorConfig,
    screenFolder: string
  ): Promise<void> {
    const loginContent = `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../../core/theme/ThemeContext';

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome</Text>
      <TextInput style={[styles.input, { borderColor: colors.divider, color: colors.textPrimary }]} placeholder="Email" placeholderTextColor={colors.textSecondary} />
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  btn: { padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
`;
    await this.writeFile(path.join(featurePath, screenFolder, 'LoginScreen.tsx'), loginContent);
    await this.writeFile(path.join(featurePath, screenFolder, 'RegisterScreen.tsx'), loginContent.replace('Login', 'Register'));
  }

  private static async generateDefaultScreen(featurePath: string, name: string, screenFolder: string): Promise<void> {
    const pascalName = StringUtils.toPascalCase(name);
    await this.writeFile(
      path.join(featurePath, screenFolder, `${pascalName}Screen.tsx`),
      `import React from 'react';\nimport { View, Text } from 'react-native';\n\nexport const ${pascalName}Screen = () => <View><Text>${pascalName} Screen</Text></View>;\n`
    );
  }

  private static async registerInNavigation(name: string, config: GeneratorConfig, screenSubPath?: string): Promise<void> {
    if (config.routing === Routing.expoRouter) return;
    const navFile = path.join(process.cwd(), 'src', 'navigation', 'AppNavigator.tsx');
    if (!(await fs.pathExists(navFile))) return;

    const pascalName = StringUtils.toPascalCase(name);
    const snakeName = StringUtils.toSnakeCase(name);
    const screenDir = screenSubPath || (config.architecture === Architecture.cleanArchitecture ? 'presentation/screens' : config.architecture === Architecture.mvvm ? 'views/screens' : 'screens');

    let contents = await fs.readFile(navFile, 'utf-8');

    // 1. Add Imports
    const imports = name === 'auth'
      ? `import { LoginScreen } from '../features/auth/${screenDir}/LoginScreen';\nimport { RegisterScreen } from '../features/auth/${screenDir}/RegisterScreen';`
      : `import { ${pascalName}Screen } from '../features/${snakeName}/${screenDir}/${pascalName}Screen';`;

    if (!contents.includes(imports.split('\n')[0])) {
      contents = `${imports}\n${contents}`;
    }

    // 2. Add Route Parameters
    if (name === 'auth') {
      if (!contents.includes('Login: undefined')) {
        contents = contents.replace('// Define your route params here', '// Define your route params here\n  Login: undefined;\n  Register: undefined;');
      }
    } else {
      if (!contents.includes(`${pascalName}: undefined`)) {
        contents = contents.replace('// Define your route params here', `// Define your route params here\n  ${pascalName}: undefined;`);
      }
    }

    // 3. Add Screen Components
    if (name === 'auth') {
      if (!contents.includes('name="Login"')) {
        contents = contents.replace(
          '{/* Add your screens here */}',
          `<Stack.Screen name="Login" component={LoginScreen} />\n        <Stack.Screen name="Register" component={RegisterScreen} />\n        {/* Add your screens here */}`
        );
      }
    } else {
      if (!contents.includes(`name="${pascalName}"`)) {
        contents = contents.replace(
          '{/* Add your screens here */}',
          `<Stack.Screen name="${pascalName}" component={${pascalName}Screen} />\n        {/* Add your screens here */}`
        );
      }
    }

    await fs.writeFile(navFile, contents);
  }

  private static async generateCleanArchTest(name: string, _config: GeneratorConfig): Promise<void> { /* Mock */ }
  private static async generateFeatureBasedTest(name: string, _config: GeneratorConfig): Promise<void> { /* Mock */ }
  private static async generateAtomicDesignTest(name: string, _config: GeneratorConfig): Promise<void> { /* Mock */ }
  private static async generateMvvmTest(name: string, _config: GeneratorConfig): Promise<void> { /* Mock */ }

  private static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
  }
}
