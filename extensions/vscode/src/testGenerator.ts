import * as vscode from 'vscode';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';

// 模型厂商类型
type ModelProvider = 'openai' | 'volcengine' | 'anthropic' | 'google';

export class TestGenerator {
    private config: vscode.WorkspaceConfiguration;

    constructor(config: vscode.WorkspaceConfiguration) {
        this.config = config;
    }

    async generateTest(
        content: string,
        framework: string,
        fileName: string
    ): Promise<string> {
        // 每次调用时重新获取最新配置
        const updatedConfig = vscode.workspace.getConfiguration('frontend-test-agent');
        const testRunner = updatedConfig.get<string>('defaultTestRunner', 'jest');
        const modelProvider = updatedConfig.get<ModelProvider>('modelProvider', 'openai');
        const prompt = this.generatePrompt(content, framework, testRunner, fileName);

        try {
            let testContent: string;
            
            switch (modelProvider) {
                case 'openai':
                    testContent = await this.generateWithOpenAI(prompt, updatedConfig);
                    break;
                case 'volcengine':
                    testContent = await this.generateWithVolcengine(prompt, updatedConfig);
                    break;
                case 'anthropic':
                case 'google':
                    throw new Error(`${modelProvider} is not fully implemented yet.`);
                default:
                    throw new Error(`Unsupported model provider: ${modelProvider}`);
            }

            if (!testContent) {
                throw new Error('No test content generated from AI.');
            }

            return this.formatTestContent(testContent);
        } catch (error) {
            console.error('API error:', error);
            throw new Error(`Failed to generate tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async generateWithOpenAI(prompt: string, config: vscode.WorkspaceConfiguration): Promise<string> {
        const apiKey = config.get<string>('openaiApiKey');
        if (!apiKey) {
            throw new Error('OpenAI API key not configured. Please set it in extension settings.');
        }

        const model = config.get<string>('openaiModel', 'gpt-3.5-turbo');
        const openai = new OpenAI({ apiKey });
        
        const completion = await openai.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert frontend test developer. Write comprehensive, production-ready tests that follow best practices.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        return completion.choices[0].message.content || '';
    }

    private async generateWithVolcengine(prompt: string, config: vscode.WorkspaceConfiguration): Promise<string> {
        const apiKey = config.get<string>('volcengineApiKey');
        if (!apiKey) {
            throw new Error('Volcengine API key not configured. Please set it in extension settings.');
        }

        const model = config.get<string>('volcengineModel', 'ep-20240722180546-xqxzh');
        const baseUrl = config.get<string>('volcengineBaseUrl', 'https://ark.cn-beijing.volces.com/api/v3');
        
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert frontend test developer. Write comprehensive, production-ready tests that follow best practices.'
                    },
                    { role: 'user', content: prompt }
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
