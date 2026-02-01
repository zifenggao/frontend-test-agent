import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import { fileUtils } from '../utils/file-utils';
import { RunResult } from '../core/Agent';

const execPromise = promisify(exec);

export class TestExecutor {
  /**
   * Run tests using specified runner
   */
  async runTests(testDir: string, options: any): Promise<RunResult> {
    logger.info(`Running tests with ${options.runner}...`);

    switch (options.runner.toLowerCase()) {
      case 'jest':
        return await this.runJestTests(testDir, options);
      case 'cypress':
        return await this.runCypressTests(testDir, options);
      case 'playwright':
        return await this.runPlaywrightTests(testDir, options);
      default:
        throw new Error(`Unsupported test runner: ${options.runner}`);
    }
  }

  /**
   * Run tests with Jest
   */
  private async runJestTests(testDir: string, options: any): Promise<RunResult> {
    const startTime = Date.now();
    try {
      // Check if Jest is configured
      const hasJestConfig = await fileUtils.fileExists('jest.config.js') || 
                            await fileUtils.fileExists('jest.config.ts');
      
      if (!hasJestConfig) {
        logger.warn('Jest configuration not found. Creating default config...');
        await this.createDefaultJestConfig();
      }

      // Build Jest command
      const command = 'npx jest';
      const args = [
        testDir,
        ...(options.coverage ? ['--coverage'] : []),
        '--json',
        '--outputFile=test-results.json',
        '--no-color'
      ];

      const fullCommand = `${command} ${args.join(' ')}`;
      logger.debug(`Running: ${fullCommand}`);

      const { stderr } = await execPromise(fullCommand);
      
      if (stderr) {
        logger.warn(`Jest warnings: ${stderr}`);
      }

      // Parse results
      const results = await this.parseJestResults();
      const coverage = options.coverage ? await this.parseCoverageResults() : undefined;
      
      const timeTaken = Date.now() - startTime;

      return {
        totalTests: results.numTotalTests,
        passedTests: results.numPassedTests,
        failedTests: results.numFailedTests,
        skippedTests: results.numSkippedTests || 0,
        successRate: Math.round((results.numPassedTests / results.numTotalTests) * 100 * 100) / 100,
        timeTaken,
        coverage
      };
    } catch (error) {
      logger.error(`Jest test failed: ${(error as Error).message}`);
      return this.createFailedRunResult();
    }
  }

  /**
   * Run tests with Cypress
   */
  private async runCypressTests(testDir: string, _options: any): Promise<RunResult> {
    const startTime = Date.now();
    try {
      // Check if Cypress is configured
      const hasCypressConfig = await fileUtils.fileExists('cypress.config.js') || 
                               await fileUtils.fileExists('cypress.config.ts');
      
      if (!hasCypressConfig) {
        logger.warn('Cypress configuration not found. Creating default config...');
        await this.createDefaultCypressConfig();
      }

      const command = 'npx cypress run';
      const args = [
        '--spec', `${testDir}/**/*.cy.ts`,
        '--reporter', 'json',
        '--reporter-options', 'mochaFile=test-results.json'
      ];

      const fullCommand = `${command} ${args.join(' ')}`;
      logger.debug(`Running: ${fullCommand}`);

      const { stderr } = await execPromise(fullCommand);
      
      if (stderr) {
        logger.warn(`Cypress warnings: ${stderr}`);
      }

      // Parse results
      const results = await this.parseCypressResults();
      
      const timeTaken = Date.now() - startTime;

      return {
        totalTests: results.tests || 0,
        passedTests: results.passes || 0,
        failedTests: results.failures || 0,
        skippedTests: results.pending || 0,
        successRate: results.tests > 0 ? Math.round((results.passes / results.tests) * 100 * 100) / 100 : 0,
        timeTaken
      };
    } catch (error) {
      logger.error(`Cypress test failed: ${(error as Error).message}`);
      return this.createFailedRunResult();
    }
  }

  /**
   * Run tests with Playwright
   */
  private async runPlaywrightTests(testDir: string, _options: any): Promise<RunResult> {
    const startTime = Date.now();
    try {
      // Check if Playwright is configured
      const hasPlaywrightConfig = await fileUtils.fileExists('playwright.config.js') || 
                                 await fileUtils.fileExists('playwright.config.ts');
      
      if (!hasPlaywrightConfig) {
        logger.warn('Playwright configuration not found. Creating default config...');
        await this.createDefaultPlaywrightConfig();
      }

      const command = 'npx playwright test';
      const args = [
        testDir,
        '--reporter=json',
        '--output=test-results.json'
      ];

      const fullCommand = `${command} ${args.join(' ')}`;
      logger.debug(`Running: ${fullCommand}`);

      const { stderr } = await execPromise(fullCommand);
      
      if (stderr) {
        logger.warn(`Playwright warnings: ${stderr}`);
      }

      // Parse results
      const results = await this.parsePlaywrightResults();
      
      const timeTaken = Date.now() - startTime;

      return {
        totalTests: results.tests.length || 0,
        passedTests: results.tests.filter((t: any) => t.status === 'passed').length,
        failedTests: results.tests.filter((t: any) => t.status === 'failed').length,
        skippedTests: results.tests.filter((t: any) => t.status === 'skipped').length,
        successRate: results.tests.length > 0 ? 
          Math.round((results.tests.filter((t: any) => t.status === 'passed').length / results.tests.length) * 100 * 100) / 100 : 0,
        timeTaken
      };
    } catch (error) {
      logger.error(`Playwright test failed: ${(error as Error).message}`);
      return this.createFailedRunResult();
    }
  }

  /**
   * Create default Jest configuration
   */
  private async createDefaultJestConfig(): Promise<void> {
    const configContent = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(test|spec).+(ts|tsx|js)'],
};
`;
    await fileUtils.writeFile('jest.config.js', configContent);
  }

  /**
   * Create default Cypress configuration
   */
  private async createDefaultCypressConfig(): Promise<void> {
    const configContent = `const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
`;
    await fileUtils.writeFile('cypress.config.js', configContent);
  }

  /**
   * Create default Playwright configuration
   */
  private async createDefaultPlaywrightConfig(): Promise<void> {
    const configContent = `import { defineConfig, devices } from '@playwright/test';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`;
    await fileUtils.writeFile('playwright.config.js', configContent);
  }

  /**
   * Parse Jest results from JSON output
   */
  private async parseJestResults(): Promise<any> {
    try {
      const resultsContent = await fileUtils.readFile('test-results.json');
      return JSON.parse(resultsContent);
    } catch (error) {
      logger.warn(`Failed to parse Jest results: ${(error as Error).message}`);
      return {};
    }
  }

  /**
   * Parse Cypress results from JSON output
   */
  private async parseCypressResults(): Promise<any> {
    try {
      const resultsContent = await fileUtils.readFile('test-results.json');
      return JSON.parse(resultsContent);
    } catch (error) {
      logger.warn(`Failed to parse Cypress results: ${(error as Error).message}`);
      return {};
    }
  }

  /**
   * Parse Playwright results from JSON output
   */
  private async parsePlaywrightResults(): Promise<any> {
    try {
      const resultsContent = await fileUtils.readFile('test-results.json');
      return JSON.parse(resultsContent);
    } catch (error) {
      logger.warn(`Failed to parse Playwright results: ${(error as Error).message}`);
      return {};
    }
  }

  /**
   * Parse coverage results
   */
  private async parseCoverageResults(): Promise<any> {
    try {
      const coverageContent = await fileUtils.readFile('coverage/coverage-summary.json');
      const coverage = JSON.parse(coverageContent);
      
      return {
        statements: Math.round(coverage.total.statements.pct),
        branches: Math.round(coverage.total.branches.pct),
        functions: Math.round(coverage.total.functions.pct),
        lines: Math.round(coverage.total.lines.pct)
      };
    } catch (error) {
      logger.warn(`Failed to parse coverage results: ${(error as Error).message}`);
      return undefined;
    }
  }

  /**
   * Create failed run result
   */
  private createFailedRunResult(): RunResult {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      successRate: 0,
      timeTaken: 0
    };
  }
}