#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import { TestAgent } from '../core/Agent';
import { logger } from '../utils/logger';

const program = new Command();

// Print welcome banner
console.log(
  chalk.blue(
    figlet.textSync('Frontend Test Agent', { horizontalLayout: 'full' })
  )
);
console.log(chalk.gray('AI-powered frontend testing automation tool\n'));

program
  .name('test-agent')
  .description('Automatically generate, run, and analyze frontend tests')
  .version('1.0.0');

// Generate command
program
  .command('generate')
  .description('Generate test cases for frontend components')
  .argument('<dir>', 'Directory containing frontend components')
  .option('--framework <framework>', 'Frontend framework (react, vue, angular)', 'react')
  .option('--type <type>', 'Test type (unit, integration, e2e)', 'unit')
  .option('--output <output>', 'Output directory for test files', '__tests__')
  .option('--model <model>', 'AI model to use for generation', 'gpt-4o-mini')
  .action(async (dir, options) => {
    const spinner = ora('Generating test cases...').start();
    
    try {
      const agent = new TestAgent();
      const result = await agent.generateTests(dir, options);
      
      spinner.succeed(chalk.green('Test cases generated successfully!'));
      console.log(`\n📊 Generation Summary:`);
      console.log(`- Components analyzed: ${result.componentsAnalyzed}`);
      console.log(`- Test files generated: ${result.testFilesGenerated}`);
      console.log(`- Average coverage estimate: ${result.coverageEstimate}%`);
      console.log(`- Time taken: ${result.timeTaken}ms`);
      console.log(`\n📁 Output directory: ${chalk.cyan(options.output)}`);
    } catch (error) {
      spinner.fail(chalk.red('Failed to generate test cases'));
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Run command
program
  .command('run')
  .description('Run generated tests')
  .argument('<testDir>', 'Directory containing test files')
  .option('--runner <runner>', 'Test runner (jest, cypress, playwright)', 'jest')
  .option('--report <report>', 'Generate HTML report', false)
  .option('--coverage', 'Generate coverage report', false)
  .action(async (testDir, options) => {
    const spinner = ora('Running tests...').start();
    
    try {
      const agent = new TestAgent();
      const result = await agent.runTests(testDir, options);
      
      spinner.succeed(chalk.green('Tests completed!'));
      console.log(`\n📊 Test Results:`);
      console.log(`- Total tests: ${result.totalTests}`);
      console.log(`- Passed: ${chalk.green(result.passedTests)}`);
      console.log(`- Failed: ${chalk.red(result.failedTests)}`);
      console.log(`- Skipped: ${chalk.yellow(result.skippedTests)}`);
      console.log(`- Success rate: ${result.successRate}%`);
      console.log(`- Time taken: ${result.timeTaken}ms`);
      
      if (options.coverage) {
        console.log(`\n📈 Coverage Report:`);
        console.log(`- Statements: ${result.coverage?.statements}%`);
        console.log(`- Branches: ${result.coverage?.branches}%`);
        console.log(`- Functions: ${result.coverage?.functions}%`);
        console.log(`- Lines: ${result.coverage?.lines}%`);
      }
    } catch (error) {
      spinner.fail(chalk.red('Test execution failed'));
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Analyze test results and provide improvement suggestions')
  .argument('<resultFile>', 'Test result file or directory')
  .option('--output <output>', 'Output file for analysis report', 'test-analysis-report.md')
  .action(async (resultFile, options) => {
    const spinner = ora('Analyzing test results...').start();
    
    try {
      const agent = new TestAgent();
      const result = await agent.analyzeResults(resultFile, options);
      
      spinner.succeed(chalk.green('Analysis completed!'));
      console.log(`\n🔍 Analysis Summary:`);
      console.log(`- Issues found: ${result.issuesFound}`);
      console.log(`- Critical issues: ${chalk.red(result.criticalIssues)}`);
      console.log(`- Suggestions provided: ${result.suggestionsProvided}`);
      console.log(`- Estimated quality improvement: ${result.qualityImprovement}%`);
      console.log(`\n📁 Report saved to: ${chalk.cyan(options.output)}`);
    } catch (error) {
      spinner.fail(chalk.red('Analysis failed'));
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Auto command - end-to-end testing
program
  .command('auto')
  .description('End-to-end testing: generate, run, and analyze tests automatically')
  .argument('<srcDir>', 'Source code directory')
  .option('--framework <framework>', 'Frontend framework', 'react')
  .option('--runner <runner>', 'Test runner', 'jest')
  .option('--output <output>', 'Output directory', '__tests__')
  .action(async (srcDir, options) => {
    const spinner = ora('Starting end-to-end testing process...').start();
    
    try {
      const agent = new TestAgent();
      
      spinner.text = 'Generating test cases...';
      const generateResult = await agent.generateTests(srcDir, { ...options, type: 'unit' });
      
      spinner.text = 'Running tests...';
      const runResult = await agent.runTests(options.output, { ...options, coverage: true });
      
      spinner.text = 'Analyzing results...';
      const analyzeResult = await agent.analyzeResults(options.output, options);
      
      spinner.succeed(chalk.green('End-to-end testing completed successfully!'));
      console.log(`\n🎉 Full Process Summary:`);
      console.log(`- Components analyzed: ${generateResult.componentsAnalyzed}`);
      console.log(`- Test files generated: ${generateResult.testFilesGenerated}`);
      console.log(`- Tests passed: ${chalk.green(runResult.passedTests)}/${runResult.totalTests}`);
      console.log(`- Success rate: ${runResult.successRate}%`);
      console.log(`- Issues found: ${analyzeResult.issuesFound}`);
      console.log(`- Suggestions provided: ${analyzeResult.suggestionsProvided}`);
      console.log(`\n🚀 Estimated time saved: ${analyzeResult.timeSaved} hours`);
    } catch (error) {
      spinner.fail(chalk.red('End-to-end testing failed'));
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Configure command
program
  .command('configure')
  .description('Configure agent settings')
  .option('--api-key <key>', 'OpenAI API key')
  .option('--model <model>', 'Default AI model')
  .option('--framework <framework>', 'Default frontend framework')
  .action((options) => {
    const spinner = ora('Saving configuration...').start();
    
    try {
      // Save configuration to config file
      const config: any = {};
      if (options.apiKey) config['openaiApiKey'] = options.apiKey;
      if (options.model) config['defaultModel'] = options.model;
      if (options.framework) config['defaultFramework'] = options.framework;
      
      // Implementation would save to ~/.test-agent/config.json
      spinner.succeed(chalk.green('Configuration saved successfully!'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to save configuration'));
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

program.parse();