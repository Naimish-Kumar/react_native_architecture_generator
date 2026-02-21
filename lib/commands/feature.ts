import chalk from 'chalk';
import ora from 'ora';
import { ConfigHelper } from '../utils/config-helper.js';
import { FeatureHelper } from '../utils/feature-helper.js';
import { Architecture, ArchitectureLabels } from '../models/config.js';

export class FeatureCommand {
    static async run(name: string): Promise<void> {
        const config = await ConfigHelper.getConfig();

        if (!config) {
            console.error(chalk.red('Error: Architecture not initialized. Run "rn-arch-gen init" first.'));
            return;
        }

        const spinner = ora(`🏗 Generating feature: ${name}...`).start();

        try {
            await FeatureHelper.generateFeature(name, config);
            spinner.succeed(`Feature "${name}" generated with ${ArchitectureLabels[config.architecture]}! ✅`);

            console.log('');
            console.log(chalk.green('Generated:'));

            switch (config.architecture) {
                case Architecture.cleanArchitecture:
                    console.log(`  ✅ Entity, Repository, UseCase (Domain layer)`);
                    console.log(`  ✅ Model, DataSource, RepoImpl (Data layer)`);
                    console.log(`  ✅ Screen, State Management (Presentation layer)`);
                    break;
                case Architecture.featureBased:
                    console.log(`  ✅ Service (API layer)`);
                    console.log(`  ✅ Custom Hook`);
                    console.log(`  ✅ Screen, Types, Barrel export`);
                    break;
                case Architecture.atomicDesign:
                    console.log(`  ✅ Atoms (Button, Input)`);
                    console.log(`  ✅ Molecules (FormField)`);
                    console.log(`  ✅ Organisms (Card) + Template (Layout)`);
                    console.log(`  ✅ Screen, Hook, Service`);
                    break;
                case Architecture.mvvm:
                    console.log(`  ✅ Model (data structures)`);
                    console.log(`  ✅ ViewModel (custom hook)`);
                    console.log(`  ✅ View (Screen + ListItem component)`);
                    console.log(`  ✅ Service (API layer)`);
                    break;
            }

            console.log(`  ✅ Navigation auto-registered`);
            if (config.tests) {
                console.log(`  ✅ Tests generated`);
            }
        } catch (error) {
            spinner.fail(`Failed to generate feature: ${error}`);
        }
    }
}
