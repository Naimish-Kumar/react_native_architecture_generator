import fs from 'fs-extra';
import path from 'path';
import type { GeneratorConfig } from '../models/config.js';

const CONFIG_FILE = '.rn_arch_gen.json';

export class ConfigHelper {
    static async saveConfig(config: GeneratorConfig): Promise<void> {
        await fs.writeJson(path.join(process.cwd(), CONFIG_FILE), config, { spaces: 2 });
    }

    static async getConfig(): Promise<GeneratorConfig | null> {
        const configPath = path.join(process.cwd(), CONFIG_FILE);
        if (!(await fs.pathExists(configPath))) {
            return null;
        }
        return await fs.readJson(configPath);
    }

    static getProjectName(): string {
        const pkgPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(pkgPath)) return 'react_native_project';
        try {
            const pkg = fs.readJsonSync(pkgPath);
            return pkg.name || 'react_native_project';
        } catch {
            return 'react_native_project';
        }
    }
}
