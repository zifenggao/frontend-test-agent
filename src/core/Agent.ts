import { TestGenerator } from '../ai/TestGenerator';
import { ASTParser } from '../ast/Parser';
import { TestExecutor } from '../test-runner/Executor';
import { ResultAnalyzer } from '../analyzer/ResultAnalyzer';
import { fileUtils } from '../utils/file-utils';
import { logger } from '../utils/logger';

export interface GenerateOptions {
  framework: string;
  type: string;
  output: string;
  model: string;
}

export interface RunOptions {
  runner: string;
  report: boolean;
  coverage: boolean;
}

export interface AnalyzeOptions {
  output: string;
}

export interface GenerateResult {
  componentsAnalyzed: number;
  testFilesGenerated: number;
  coverageEstimate: number;
  timeTaken: number;
}

export interface RunResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
  timeTaken: number;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

export interface AnalyzeResult {
  issuesFound: number;
  criticalIssues: number;
  suggestionsProvided: number;
  qualityImprovement: number;
  timeSaved: number;
}

export class TestAgent {
  private testGenerator: TestGenerator;
  private astParser: ASTParser;
  private testExecutor: TestExecutor;
  private resultAnalyzer: ResultAnalyzer;

  constructor() {
    this.testGenerator = new TestGenerator();
    this.astParser = new ASTParser();
    this.testExecutor = new TestExecutor();
    this.resultAnalyzer = new ResultAnalyzer();
  }

  /**
   * Generate test cases for frontend components
   * @param dir Directory containing frontend components
   * @param options Generation options
   */
  async generateTests(dir: string, options: GenerateOptions): Promise<GenerateResult> {
    const startTime = Date.now();
    logger.info(`Starting test generation for ${dir}...`);

    // Validate directory
    if (!fileUtils.directoryExists(dir)) {
      throw new Error(`Directory ${dir} does not exist`);
    }

    // Get all component files
    const componentFiles = fileUtils.getComponentFiles(dir, options.framework);
    logger.info(`Found ${componentFiles.length} component files`);

    if (componentFiles.length === 0) {
      throw new Error(`No component files found in ${dir}`);
    }

    // Parse components and generate tests
    let testFilesGenerated = 0;
    let totalCoverageEstimate = 0;

    for (const file of componentFiles) {
      try {
        logger.debug(`Processing ${file}...`);
        
        // Parse component AST
        const astResult = await this.astParser.parseComponent(file, options.framework);
        
        // Generate test cases
        const testCases = await this.testGenerator.generateTests(
          astResult,
          options.type,
          options.model
        );

        // Write test file
        const testFilePath = this.getTestFilePath(file, options.output);
        await fileUtils.writeTestFile(testFilePath, testCases, options.runner);
        
        testFilesGenerated++;
        totalCoverageEstimate += testCases.coverageEstimate || 0;
      } catch (error) {
        logger.warn(`Failed to process ${file}: ${(error as Error).message}`);
      }
    }

    const timeTaken = Date.now() - startTime;
    const coverageEstimate = totalCoverageEstimate / componentFiles.length;

    logger.info(`Test generation completed in ${timeTaken}ms`);

    return {
      componentsAnalyzed: componentFiles.length,
      testFilesGenerated,
      coverageEstimate: Math.round(coverageEstimate * 100) / 100,
      timeTaken
    };
  }

  /**
   * Run generated tests
   * @param testDir Directory containing test files
   * @param options Run options
   */
  async runTests(testDir: string, options: RunOptions): Promise<RunResult> {
    const startTime = Date.now();
    logger.info(`Starting test execution in ${testDir}...`);

    // Validate directory
    if (!fileUtils.directoryExists(testDir)) {
      throw new Error(`Test directory ${testDir} does not exist`);
    }

    // Run tests using specified runner
    const result = await this.testExecutor.runTests(testDir, options);

    const timeTaken = Date.now() - startTime;
    const successRate = result.passedTests / result.totalTests * 100;

    logger.info(`Test execution completed in ${timeTaken}ms`);

    return {
      ...result,
      successRate: Math.round(successRate * 100) / 100,
      timeTaken
    };
  }

  /**
   * Analyze test results and provide suggestions
   * @param resultFile Result file or directory
   * @param options Analysis options
   */
  async analyzeResults(resultFile: string, options: AnalyzeOptions): Promise<AnalyzeResult> {
    const startTime = Date.now();
    logger.info(`Starting result analysis...`);

    // Validate input
    if (!fileUtils.exists(resultFile)) {
      throw new Error(`Result file/directory ${resultFile} does not exist`);
    }

    // Analyze results
    const analysis = await this.resultAnalyzer.analyze(resultFile);

    // Generate report
    await this.generateAnalysisReport(analysis, options.output);

    const timeTaken = Date.now() - startTime;
    
    logger.info(`Analysis completed in ${timeTaken}ms`);

    return {
      issuesFound: analysis.issues.length,
      criticalIssues: analysis.criticalIssues,
      suggestionsProvided: analysis.suggestions.length,
      qualityImprovement: this.calculateQualityImprovement(analysis),
      timeSaved: this.calculateTimeSaved(analysis)
    };
  }

  /**
   * Get test file path from component file path
   */
  private getTestFilePath(componentPath: string, outputDir: string): string {
    const fileName = componentPath.split('/').pop() || 'component';
    const testFileName = fileName.replace(/\.(tsx|jsx|vue)$/, '.test.ts');
    return `${outputDir}/${testFileName}`;
  }

  /**
   * Generate analysis report
   */
  private async generateAnalysisReport(analysis: any, outputPath: string): Promise<void> {
    const reportContent = `# Test Analysis Report

## Overview
- **Issues Found**: ${analysis.issues.length}
- **Critical Issues**: ${analysis.criticalIssues}
- **Suggestions**: ${analysis.suggestions.length}

## Critical Issues
${analysis.issues
  .filter((issue: any) => issue.severity === 'critical')
  .map((issue: any) => `- ${issue.description}\n  - Impact: ${issue.impact}\n  - Recommendation: ${issue.recommendation}`)
  .join('\n')}

## Suggestions for Improvement
${analysis.suggestions
  .map((suggestion: any) => `- ${suggestion.description}\n  - Benefit: ${suggestion.benefit}`)
  .join('\n')}

## Performance Metrics
- **Estimated Time Saved**: ${this.calculateTimeSaved(analysis)} hours
- **Quality Improvement**: ${this.calculateQualityImprovement(analysis)}%
`;

    await fileUtils.writeFile(outputPath, reportContent);
  }

  /**
   * Calculate estimated quality improvement
   */
  private calculateQualityImprovement(analysis: any): number {
    // Simple algorithm: 5% improvement per critical issue fixed, 2% per suggestion implemented
    const criticalImprovement = analysis.criticalIssues * 5;
    const suggestionImprovement = analysis.suggestions.length * 2;
    return Math.min(criticalImprovement + suggestionImprovement, 50); // Cap at 50%
  }

  /**
   * Calculate estimated time saved
   */
  private calculateTimeSaved(analysis: any): number {
    // Estimate 1 hour per critical issue fixed, 0.5 hours per suggestion implemented
    const criticalTimeSaved = analysis.criticalIssues * 1;
    const suggestionTimeSaved = analysis.suggestions.length * 0.5;
    return Math.round((criticalTimeSaved + suggestionTimeSaved) * 10) / 10;
  }
}