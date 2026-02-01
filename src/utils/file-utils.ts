import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';

export const fileUtils = {
  async writeTestFile(filePath: string, testCases: any, _runner: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, testCases);
  },
  async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf8');
  },
  async exists(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath);
  },
  async remove(filePath: string): Promise<void> {
    await fs.remove(filePath);
  },
  async directoryExists(dir: string): Promise<boolean> {
    return await fs.pathExists(dir) && (await fs.stat(dir)).isDirectory();
  },
  async fileExists(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath) && (await fs.stat(filePath)).isFile();
  },
  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
  },
  getComponentFiles(dir: string, framework: string): string[] {
    const patterns = {
      react: '**/*.{tsx,jsx}',
      vue: '**/*.vue',
      angular: '**/*.component.{ts,js}'
    };
    
    const pattern = patterns[framework as keyof typeof patterns] || '**/*.{ts,tsx,js,jsx,vue}';
    return glob.sync(path.join(dir, pattern));
  }
};
