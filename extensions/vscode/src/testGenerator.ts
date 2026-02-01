import * as vscode from 'vscode';
import { OpenAI } from 'openai';

export class TestGenerator {
    private openai: OpenAI | undefined;
    private config: vscode.WorkspaceConfiguration;

    constructor(config: vscode.WorkspaceConfiguration) {
        this.config = config;
        const apiKey = config.get<string>('openaiApiKey');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        }
    }

    async generateTest(
        content: string,
        framework: string,
        fileName: string
    ): Promise<string> {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured. Please set it in extension settings.');
        }

        const testRunner = this.config.get<string>('defaultTestRunner', 'jest');
        const prompt = this.generatePrompt(content, framework, testRunner, fileName);

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert frontend test developer specialized in ${framework} and ${testRunner}.
                        Write comprehensive, production-ready tests that follow best practices.
                        Include detailed comments and ensure all edge cases are covered.
                        Make sure the tests are runnable without modification.`
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });

            const testContent = completion.choices[0].message.content;
            if (!testContent) {
                throw new Error('No test content generated from AI.');
            }

            return this.formatTestContent(testContent);
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error(`Failed to generate tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private generatePrompt(
        content: string,
        framework: string,
        testRunner: string,
        fileName: string
    ): string {
        return `Generate ${testRunner} tests for this ${framework} component:

File name: ${fileName}
Component code:
${content}

Requirements:
1. Generate complete, runnable test cases
2. Include unit tests for rendering, state changes, event handlers
3. Cover edge cases and error scenarios
4. Follow best practices for ${framework} testing
5. Add meaningful comments
6. Ensure compatibility with ${testRunner}
7. Use appropriate testing utilities`;
    }

    private formatTestContent(content: string): string {
        // Remove any markdown formatting from the AI response
        return content.replace(/^```typescript|^```ts|^```/gm, '').replace(/```$/gm, '').trim();
    }
}
