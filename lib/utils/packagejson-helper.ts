import fs from 'fs-extra';
import path from 'path';
import type { GeneratorConfig } from '../models/config.js';
import { StateManagement, Routing } from '../models/config.js';

export class PackageJsonHelper {
    static async addDependencies(config: GeneratorConfig): Promise<void> {
        const pkgPath = path.join(process.cwd(), 'package.json');
        if (!(await fs.pathExists(pkgPath))) return;

        const pkg = await fs.readJson(pkgPath);

        if (!pkg.dependencies) pkg.dependencies = {};
        if (!pkg.devDependencies) pkg.devDependencies = {};

        // ── Common Dependencies ──
        const deps: Record<string, string> = {
            'axios': '^1.13.5',
            'react-native-config': '^1.6.1',
        };

        // ── State Management ──
        switch (config.stateManagement) {
            case StateManagement.redux:
                deps['@reduxjs/toolkit'] = '^2.11.2';
                deps['react-redux'] = '^9.2.0';
                break;
            case StateManagement.zustand:
                deps['zustand'] = '^5.0.11';
                break;
            case StateManagement.context:
                // React Context is built-in, no dep needed
                break;
        }

        // ── Routing ──
        switch (config.routing) {
            case Routing.reactNavigation:
                deps['@react-navigation/native'] = '^7.1.28';
                deps['@react-navigation/native-stack'] = '^7.13.0';
                deps['react-native-screens'] = '^4.23.0';
                deps['react-native-safe-area-context'] = '^5.6.2';
                break;
            case Routing.expoRouter:
                deps['expo-router'] = '^6.0.23';
                break;
        }

        // ── Firebase ──
        if (config.firebase) {
            deps['@react-native-firebase/app'] = '^23.8.6';
        }

        // ── Localization ──
        if (config.localization) {
            deps['i18next'] = '^25.8.13';
            deps['react-i18next'] = '^16.5.4';
        }

        // ── Dev Dependencies ──
        const devDeps: Record<string, string> = {
            '@types/react': '^19.2.14',
            'typescript': '^5.9.3',
        };

        if (config.tests) {
            devDeps['jest'] = '^30.2.0';
            devDeps['@testing-library/react-native'] = '^13.3.3';
        }

        // react-redux v9+ has built-in types, no need for @types/react-redux

        // Merge without overwriting existing
        for (const [name, version] of Object.entries(deps)) {
            if (!pkg.dependencies[name]) {
                pkg.dependencies[name] = version;
            }
        }

        for (const [name, version] of Object.entries(devDeps)) {
            if (!pkg.devDependencies[name]) {
                pkg.devDependencies[name] = version;
            }
        }

        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }
}
