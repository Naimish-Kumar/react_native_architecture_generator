import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { Architecture, ArchitectureLabels, StateManagement, Routing } from '../models/config.js';
import type { GeneratorConfig } from '../models/config.js';
import { FileHelper } from '../utils/file-helper.js';
import { FeatureHelper } from '../utils/feature-helper.js';

export class InitCommand {
    static async run(): Promise<void> {
        console.log(chalk.blue('🚀 Initializing React Native Architecture...'));
        console.log('');

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'architecture',
                message: 'Select architecture pattern:',
                choices: Object.values(Architecture).map((arch) => ({
                    name: ArchitectureLabels[arch],
                    value: arch,
                })),
                default: Architecture.cleanArchitecture,
            },
            {
                type: 'list',
                name: 'stateManagement',
                message: 'Select state management:',
                choices: Object.values(StateManagement),
                default: StateManagement.redux,
            },
            {
                type: 'list',
                name: 'routing',
                message: 'Select routing:',
                choices: Object.values(Routing),
                default: Routing.reactNavigation,
            },
            {
                type: 'confirm',
                name: 'localization',
                message: 'Enable localization (i18next)?',
                default: true,
            },
            {
                type: 'confirm',
                name: 'firebase',
                message: 'Enable Firebase?',
                default: false,
            },
            {
                type: 'confirm',
                name: 'tests',
                message: 'Enable tests?',
                default: true,
            },
        ]);

        const config: GeneratorConfig = answers as GeneratorConfig;

        const spinner = ora('Generating structure...').start();

        try {
            await FileHelper.generateBaseStructure(config);

            spinner.text = 'Generating example feature: auth...';
            await FeatureHelper.generateFeature('auth', config);

            spinner.succeed('Architecture and example feature generated! ✅');

            console.log('');
            console.log(chalk.green('Architecture: ') + chalk.cyan(ArchitectureLabels[config.architecture]));
            console.log('');
            console.log(chalk.green('Next steps:'));
            console.log('1. Run ' + chalk.yellow('npm install') + ' or ' + chalk.yellow('yarn'));
            console.log('2. Configure your environments in .env files');
            console.log('3. Run ' + chalk.yellow('npx react-native run-android') + ' or ' + chalk.yellow('npx react-native run-ios'));
            console.log('4. Happy coding! 🚀');
        } catch (error) {
            spinner.fail('Failed to generate architecture: ' + error);
        }
    }
}
