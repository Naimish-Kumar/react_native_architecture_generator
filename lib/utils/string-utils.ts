/**
 * String utility functions for naming convention conversions.
 */
export class StringUtils {
    static toSnakeCase(name: string): string {
        return name
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/^_/, '')
            .replace(/_+/g, '_');
    }

    static toPascalCase(name: string): string {
        const snake = StringUtils.toSnakeCase(name);
        return snake
            .split('_')
            .map((s) => (s.length === 0 ? '' : s[0].toUpperCase() + s.slice(1)))
            .join('');
    }

    static toCamelCase(name: string): string {
        const pascal = StringUtils.toPascalCase(name);
        if (pascal.length === 0) return '';
        return pascal[0].toLowerCase() + pascal.slice(1);
    }

    static toKebabCase(name: string): string {
        return StringUtils.toSnakeCase(name).replace(/_/g, '-');
    }
}
