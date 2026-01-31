import OpenAI from 'openai';
import { logger } from '../utils/logger';

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

  constructor() {
    // Initialize OpenAI client if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      logger.warn('OpenAI API key not found. Will use mock test generation.');
    }
  }

  /**
   * Generate test cases based on AST analysis
   */
  async generateTests(
    astResult: ASTParseResult,
    testType: string,
    model: string = 'gpt-4o-mini'
  ): Promise<GeneratedTests> {
    try {
      logger.debug(`Generating ${testType} tests for ${astResult.componentName}...`);

      if (this.openai) {
        return await this.generateWithAI(astResult, testType, model);
      } else {
        return this.generateMockTests(astResult, testType);
      }
    } catch (error) {
      logger.error(`Failed to generate tests: ${(error as Error).message}`);
      return this.generateMockTests(astResult, testType);
    }
  }

  /**
   * Generate tests using AI (OpenAI API)
   */
  private async generateWithAI(
    astResult: ASTParseResult,
    testType: string,
    model: string
  ): Promise<GeneratedTests> {
    const prompt = this.createTestGenerationPrompt(astResult, testType);

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

    const response = completion.choices[0].message.content || '';
    return this.parseAIResponse(response, astResult);
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
    testType: string
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