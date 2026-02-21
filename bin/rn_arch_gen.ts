#!/usr/bin/env node
import { Command } from 'commander';
import { InitCommand } from '../lib/commands/init.js';
import { FeatureCommand } from '../lib/commands/feature.js';
import { ModelCommand } from '../lib/commands/model.js';
import { ScreenCommand } from '../lib/commands/screen.js';

const program = new Command();

program
    .name('rn-arch-gen')
    .description('A powerful CLI tool to instantly generate a production-ready React Native project architecture.')
    .version('1.1.0');

program
    .command('init')
    .description('Initialize React Native project architecture.')
    .action(async () => {
        await InitCommand.run();
    });

program
    .command('feature <name>')
    .description('Generate a complete feature module using the selected architecture.')
    .action(async (name: string) => {
        await FeatureCommand.run(name);
    });

program
    .command('model <name>')
    .description('Generate a TypeScript model/interface with validation.')
    .option('-f, --feature <feature>', 'Target feature module')
    .action(async (name: string, options: { feature?: string }) => {
        await ModelCommand.run(name, options.feature);
    });

program
    .command('screen <name>')
    .description('Generate a new screen with optional navigation registration.')
    .option('-f, --feature <feature>', 'Target feature module')
    .action(async (name: string, options: { feature?: string }) => {
        await ScreenCommand.run(name, options.feature);
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
