import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { StringUtils } from '../utils/string-utils.js';
import { ConfigHelper } from '../utils/config-helper.js';
import { Architecture, Routing } from '../models/config.js';

export class ScreenCommand {
  static async run(name: string, feature?: string): Promise<void> {
    const config = await ConfigHelper.getConfig();
    const spinner = ora(`📄 Generating screen: ${name}...`).start();

    try {
      const pascalName = StringUtils.toPascalCase(name);
      const snakeName = StringUtils.toSnakeCase(name);

      const content = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ${pascalName}Screen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${pascalName}</Text>
      <Text style={styles.subtitle}>${pascalName} Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#757575' },
});
`;

      // Determine screen path based on architecture
      const arch = config?.architecture ?? Architecture.cleanArchitecture;
      let screenDir: string;

      switch (arch) {
        case Architecture.mvvm:
          screenDir = 'views/screens';
          break;
        case Architecture.cleanArchitecture:
          screenDir = 'presentation/screens';
          break;
        default: // featureBased, atomicDesign
          screenDir = 'screens';
          break;
      }

      const targetDir = feature
        ? path.join(process.cwd(), 'src', 'features', StringUtils.toSnakeCase(feature), screenDir)
        : path.join(process.cwd(), 'src', arch === Architecture.mvvm ? 'views/screens' : arch === Architecture.cleanArchitecture ? 'presentation/screens' : 'screens');

      const filePath = path.join(targetDir, `${pascalName}Screen.tsx`);
      await fs.ensureDir(targetDir);
      await fs.writeFile(filePath, content);

      // Auto-register in navigator
      if (config && config.routing === Routing.reactNavigation) {
        await this.registerInNavigator(pascalName, snakeName, feature, screenDir);
      }

      spinner.succeed(`Screen ${pascalName}Screen generated in ${path.relative(process.cwd(), targetDir)}! ✅`);
    } catch (error) {
      spinner.fail(`Failed to generate screen: ${error}`);
    }
  }

  private static async registerInNavigator(
    pascalName: string,
    snakeName: string,
    feature?: string,
    screenDir = 'presentation/screens'
  ): Promise<void> {
    const navFile = path.join(process.cwd(), 'src', 'navigation', 'AppNavigator.tsx');
    if (!(await fs.pathExists(navFile))) return;

    let contents = await fs.readFile(navFile, 'utf-8');

    const importPath = feature
      ? `../features/${StringUtils.toSnakeCase(feature)}/${screenDir}/${pascalName}Screen`
      : `../presentation/screens/${pascalName}Screen`;

    const screenImport = `import { ${pascalName}Screen } from '${importPath}';`;

    if (!contents.includes(screenImport)) {
      contents = `${screenImport}\n${contents}`;
    }

    if (!contents.includes(`${pascalName}: undefined`)) {
      contents = contents.replace(
        '// Define your route params here',
        `// Define your route params here\n  ${pascalName}: undefined;`
      );
    }

    if (!contents.includes(`name="${pascalName}"`)) {
      contents = contents.replace(
        '{/* Add your screens here */}',
        `<Stack.Screen name="${pascalName}" component={${pascalName}Screen} />\n        {/* Add your screens here */}`
      );
    }

    await fs.writeFile(navFile, contents);
  }
}
