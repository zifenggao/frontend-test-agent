import OpenAI from 'openai';
import { logger } from '../utils/logger';
import fetch from 'node-fetch';

// 模型厂商类型
export type ModelProvider = 'openai' | 'volcengine' | 'anthropic' | 'google';

// 模型配置接口
export interface ModelConfig {
  provider: ModelProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ASTParseResult {
  componentName: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  state: Array<{
    name: string;
    type: string;
    initialValue: string;
  }>;
  methods: Array<{
    name: string;
    parameters: Array<{
      name: string;
      type: string;
    }>;
    returnType: string;
    functionality: string;
  }>;
  dependencies: Array<string>;
  componentType: 'function' | 'class';
}

export interface TestCase {
  testName: string;
  testDescription: string;
  testCode: string;
  coverageAreas: Array<string>;
}

export interface GeneratedTests {
  componentName: string;
  testCases: Array<TestCase>;
  coverageEstimate: number;
  testFileContent: string;
}

export class TestGenerator {
  private openai: OpenAI | null = null;
  private volcengineClient: any = null;
  private modelConfig: ModelConfig | null = null;

  constructor(modelConfig?: ModelConfig) {
    if (modelConfig) {
      this.modelConfig = modelConfig;
      this.initializeModelClient(modelConfig);
    } else {
      // Initialize with default OpenAI config if API key is available
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        const defaultConfig: ModelConfig = {
          provider: 'openai',
          apiKey,
          model: 'gpt-4o-mini'
        };
        this.modelConfig = defaultConfig;
        this.initializeModelClient(defaultConfig);
      } else {
        logger.warn('No model API key found. Will use mock test generation.');
      }
    }
  }

  /**
   * Initialize model client based on provider
   */
  private initializeModelClient(config: ModelConfig): void {
    switch (config.provider) {
      case 'openai':
        this.openai = new OpenAI({ 
          apiKey: config.apiKey,
          baseURL: config.baseUrl
        });
        break;
      case 'volcengine':
        this.initializeVolcengineClient(config);
        break;
      case 'anthropic':
      case 'google':
        logger.info(`${config.provider} model client initialized`);
        break;
      default:
        logger.warn(`Unsupported model provider: ${config.provider}`);
    }
  }

  /**
   * Initialize Volcengine client
   */
  private initializeVolcengineClient(config: ModelConfig): void {
    // For now, we'll use a simple HTTP client approach
    // In production, you would use the official Volcengine SDK
    this.volcengineClient = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3',
      model: config.model
    };
    logger.info('Volcengine model client initialized');
  }

  /**
   * Generate test cases based on AST analysis
   */
  async generateTests(
    astResult: ASTParseResult,
    _testType: string,
    model?: string
  ): Promise<GeneratedTests> {
    try {
      logger.debug(`Generating tests for ${astResult.componentName}...`);

      if (this.modelConfig && this.openai) {
        return await this.generateWithAI(astResult, _testType, model || this.modelConfig.model);
      } else {
        return this.generateMockTests(astResult, _testType);
      }
    } catch (error) {
      logger.error(`Failed to generate tests: ${(error as Error).message}`);
      return this.generateMockTests(astResult, _testType);
    }
  }

  /**
   * Generate tests using AI
   */
  private async generateWithAI(
    astResult: ASTParseResult,
    testType: string,
    model: string
  ): Promise<GeneratedTests> {
    const prompt = this.createTestGenerationPrompt(astResult, testType);

    let response = '';
    
    if (this.modelConfig) {
      switch (this.modelConfig.provider) {
        case 'openai':
          response = await this.generateWithOpenAI(prompt, model);
          break;
        case 'volcengine':
          response = await this.generateWithVolcengine(prompt, model);
          break;
        case 'anthropic':
        case 'google':
          // Will be implemented later
          logger.warn(`Model provider ${this.modelConfig.provider} not fully implemented. Using mock response.`);
          response = this.generateMockAIResponse(astResult);
          break;
        default:
          logger.warn(`Unsupported model provider: ${this.modelConfig.provider}`);
          response = this.generateMockAIResponse(astResult);
      }
    }

    return this.parseAIResponse(response, astResult);
  }

  /**
   * Generate tests using OpenAI API
   */
  private async generateWithOpenAI(prompt: string, model: string): Promise<string> {
    const completion = await this.openai!.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert frontend testing engineer specializing in React, Vue, and Angular. Generate comprehensive, high-quality test cases based on component analysis.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0].message.content || '';
  }

  /**
   * Generate tests using Volcengine API
   */
  private async generateWithVolcengine(prompt: string, model: string): Promise<string> {
    try {
      if (!this.volcengineClient) {
        throw new Error('Volcengine client not initialized');
      }

      const response = await fetch(`${this.volcengineClient.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.volcengineClient.apiKey}`
        },
        body: JSON.stringify({
          model: model || this.volcengineClient.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert frontend testing engineer specializing in React, Vue, and Angular. Generate comprehensive, high-quality test cases based on component analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Volcengine API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || '';
    } catch (error) {
      logger.error(`Failed to generate tests with Volcengine: ${(error as Error).message}`);
      // Fallback to mock response if API call fails
      return this.generateMockAIResponse({ componentName: 'TestComponent' } as ASTParseResult);
    }
  }

  /**
   * Generate mock AI response for testing
   */
  private generateMockAIResponse(astResult: ASTParseResult): string {
    return `### Test Case 1: Renders correctly
Tests that the component renders without errors

\`\`\`javascript
it('renders correctly', () => {
  const { getByTestId } = render(<${astResult.componentName} />);
  expect(getByTestId('${astResult.componentName.toLowerCase()}')).toBeInTheDocument();
});
\`\`\``;
  }

  /**
   * Create prompt for AI test generation
   */
  private createTestGenerationPrompt(astResult: ASTParseResult, testType: string): string {
    return `Generate ${testType} tests for the following component:

Component Name: ${astResult.componentName}
Component Type: ${astResult.componentType}

Props:
${astResult.props.map(p => `- ${p.name}: ${p.type} ${p.required ? '(required)' : ''}`).join('\n')}

State Variables:
${astResult.state.map(s => `- ${s.name}: ${s.type} = ${s.initialValue}`).join('\n')}

Methods:
${astResult.methods.map(m => `- ${m.name}(${m.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}): ${m.returnType}\n  ${m.functionality}`).join('\n')}

Dependencies: ${astResult.dependencies.join(', ')}

Requirements:
1. Generate comprehensive test cases that cover all important functionality
2. Include edge cases and error scenarios
3. Provide test code that can be directly used with Jest
4. Include comments explaining what each test does
5. Estimate the test coverage percentage
6. Format the response with clear sections
`;
  }

  /**
   * Parse AI response into structured test data
   */
  private parseAIResponse(response: string, astResult: ASTParseResult): GeneratedTests {
    // This is a simplified parser - in production, use more robust parsing
    const testCases: TestCase[] = [];
    
    // Extract test cases from response
    const testBlocks = response.split('###').slice(1);
    testBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      const testName = lines[0].replace(/Test Case\s*\d+:\s*/, '').trim();
      const codeStart = lines.findIndex(line => line.startsWith('```'));
      const codeEnd = lines.findIndex((line, idx) => line.startsWith('```') && idx > codeStart);
      
      if (codeStart !== -1 && codeEnd !== -1) {
        const testCode = lines.slice(codeStart + 1, codeEnd).join('\n');
        testCases.push({
          testName,
          testDescription: lines.slice(1, codeStart).join('\n').trim(),
          testCode,
          coverageAreas: ['Component rendering', 'Props handling']
        });
      }
    });

    // Generate test file content
    const testFileContent = this.generateTestFileContent(astResult, testCases);

    return {
      componentName: astResult.componentName,
      testCases,
      coverageEstimate: Math.min(80 + testCases.length * 2, 95), // Simple estimation
      testFileContent
    };
  }

  /**
   * Generate mock tests when AI is not available
   */
  private generateMockTests(
    astResult: ASTParseResult,
    _testType: string
  ): GeneratedTests {
    const testCases: TestCase[] = [];

    // Mock basic test cases
    testCases.push({
      testName: 'renders correctly with default props',
      testDescription: 'Test that the component renders without errors with default props',
      testCode: `import React from 'react';
import { render } from '@testing-library/react';
import ${astResult.componentName} from '../${astResult.componentName}';

describe('${astResult.componentName}', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<${astResult.componentName} />);
    expect(getByTestId('${astResult.componentName.toLowerCase()}')).toBeInTheDocument();
  });
});`,
      coverageAreas: ['Component rendering', 'Default props']
    });

    // Add more mock tests based on AST analysis
    if (astResult.props.length > 0) {
      testCases.push({
        testName: 'handles required props correctly',
        testDescription: 'Test that the component handles required props properly',
        testCode: `it('handles required props correctly', () => {
  const requiredProps = { ${astResult.props.filter(p => p.required).map(p => `${p.name}: 'test-value'`).join(', ')} };
  const { getByText } = render(<${astResult.componentName} {...requiredProps} />);
  expect(getByText('Test Content')).toBeInTheDocument();
});`,
        coverageAreas: ['Props handling', 'Required props']
      });
    }

    const testFileContent = this.generateTestFileContent(astResult, testCases);

    return {
      componentName: astResult.componentName,
      testCases,
      coverageEstimate: 75 + testCases.length * 5,
      testFileContent
    };
  }

  /**
   * Generate complete test file content
   */
  private generateTestFileContent(
    astResult: ASTParseResult,
    testCases: TestCase[]
  ): string {
    const imports = `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ${astResult.componentName} from '../src/${astResult.componentName}';
`;

    const testCode = `describe('${astResult.componentName} Component', () => {
  ${testCases.map(test => `it('${test.testName}', () => {
    ${test.testCode}
  });`).join('\n\n  ')}
});`;

    return `${imports}\n${testCode}`;
  }
}