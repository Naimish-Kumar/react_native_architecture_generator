import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { StringUtils } from '../utils/string-utils.js';
import { ConfigHelper } from '../utils/config-helper.js';
import { Architecture } from '../models/config.js';

export class ModelCommand {
  static async run(name: string, feature?: string): Promise<void> {
    const config = await ConfigHelper.getConfig();
    const spinner = ora(`📦 Generating model: ${name}...`).start();

    try {
      const pascalName = StringUtils.toPascalCase(name);
      const snakeName = StringUtils.toSnakeCase(name);
      const camelName = StringUtils.toCamelCase(name);

      // Determine model path based on architecture
      const arch = config?.architecture ?? Architecture.cleanArchitecture;
      let modelDir: string;
      let modelContent: string;

      switch (arch) {
        case Architecture.cleanArchitecture:
          modelDir = 'data/models';
          modelContent = `export interface ${pascalName} {
  id: number;
}

export class ${pascalName}Model implements ${pascalName} {
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
`;
          break;

        case Architecture.mvvm:
          modelDir = 'models';
          modelContent = `export interface ${pascalName}Model {
  id: number;
}

export const create${pascalName} = (data: Partial<${pascalName}Model>): ${pascalName}Model => ({
  id: data.id ?? 0,
});

export const ${camelName}FromJson = (json: Record<string, unknown>): ${pascalName}Model => ({
  id: json['id'] as number,
});

export const ${camelName}ToJson = (model: ${pascalName}Model): Record<string, unknown> => ({
  id: model.id,
});
`;
          break;

        case Architecture.featureBased:
        case Architecture.atomicDesign:
          modelDir = 'types';
          modelContent = `export interface ${pascalName} {
  id: number;
}

export interface ${pascalName}CreateInput {
  id?: number;
}

export interface ${pascalName}UpdateInput {
  id?: number;
}
`;
          break;
      }

      const targetDir = feature
        ? path.join(process.cwd(), 'src', 'features', StringUtils.toSnakeCase(feature), modelDir)
        : path.join(process.cwd(), 'src', 'core', 'models');

      const fileName = arch === Architecture.featureBased || arch === Architecture.atomicDesign
        ? `${camelName}.types.ts`
        : `${pascalName}Model.ts`;

      const filePath = path.join(targetDir, fileName);
      await fs.ensureDir(targetDir);
      await fs.writeFile(filePath, modelContent);

      spinner.succeed(`Model ${fileName} generated in ${path.relative(process.cwd(), targetDir)}! ✅`);
    } catch (error) {
      spinner.fail(`Failed to generate model: ${error}`);
    }
  }
}
