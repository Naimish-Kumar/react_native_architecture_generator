import fs from 'fs-extra';
import path from 'path';
import type { GeneratorConfig } from '../models/config.js';
import { ConfigHelper } from './config-helper.js';
import { BaseTemplates } from '../templates/base-templates.js';
import { PackageJsonHelper } from './packagejson-helper.js';

export class FileHelper {
    static async generateBaseStructure(config: GeneratorConfig): Promise<void> {
        const root = process.cwd();

        // 1. Create Directories
        const dirs = [
            'src/core/api',
            'src/core/errors',
            'src/core/theme',
            'src/core/utils',
            'src/core/components',
            'src/features',
            'src/navigation',
            'src/state',
            'assets/images',
            'assets/fonts',
        ];

        if (config.localization) {
            dirs.push('src/i18n/locales');
        }

        if (config.tests) {
            dirs.push('__tests__/unit', '__tests__/integration');
        }

        for (const dir of dirs) {
            await fs.ensureDir(path.join(root, dir));
        }

        // 2. Create Base Files
        const files: Record<string, string> = {
            'src/App.tsx': BaseTemplates.appEntryContent(config),
            'src/core/api/apiClient.ts': BaseTemplates.apiClientContent(),
            'src/core/errors/failures.ts': BaseTemplates.failuresContent(),
            'src/core/theme/AppTheme.ts': BaseTemplates.themeContent(),
            'src/core/theme/ThemeContext.tsx': BaseTemplates.themeContextContent(),
            'src/core/constants/AppConstants.ts': BaseTemplates.constantsContent(),
            'src/navigation/AppNavigator.tsx': BaseTemplates.navigationContent(config),
            'src/state/store.ts': BaseTemplates.storeContent(config),
            '.env.development': 'API_BASE_URL=https://dev.api.example.com\n',
            '.env.production': 'API_BASE_URL=https://api.example.com\n',
            '.gitignore': BaseTemplates.gitignoreContent(),
        };

        if (config.localization) {
            files['src/i18n/i18n.ts'] = BaseTemplates.i18nConfigContent();
            files['src/i18n/locales/en.json'] = BaseTemplates.localeEnContent();
        }

        if (config.tests) {
            files['__tests__/unit/sample.test.ts'] = BaseTemplates.sampleTestContent();
        }

        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = path.join(root, filePath);
            await fs.ensureDir(path.dirname(fullPath));
            await fs.writeFile(fullPath, content);
        }

        // 3. Update package.json with dependencies
        await PackageJsonHelper.addDependencies(config);

        // 4. Save config
        await ConfigHelper.saveConfig(config);
    }
}
