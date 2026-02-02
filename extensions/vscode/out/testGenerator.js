"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGenerator = void 0;
const vscode = __importStar(require("vscode"));
const openai_1 = require("openai");
const node_fetch_1 = __importDefault(require("node-fetch"));
class TestGenerator {
    constructor(config) {
        this.config = config;
    }
    async generateTest(content, framework, fileName) {
        // 每次调用时重新获取最新配置
        const updatedConfig = vscode.workspace.getConfiguration('frontend-test-agent');
        const testRunner = updatedConfig.get('defaultTestRunner', 'jest');
        const modelProvider = updatedConfig.get('modelProvider', 'openai');
        const prompt = this.generatePrompt(content, framework, testRunner, fileName);
        try {
            let testContent;
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
        }
        catch (error) {
            console.error('API error:', error);
            throw new Error(`Failed to generate tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateWithOpenAI(prompt, config) {
        const apiKey = config.get('openaiApiKey');
        if (!apiKey) {
            throw new Error('OpenAI API key not configured. Please set it in extension settings.');
        }
        const model = config.get('openaiModel', 'gpt-3.5-turbo');
        const openai = new openai_1.OpenAI({ apiKey });
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
    async generateWithVolcengine(prompt, config) {
        const apiKey = config.get('volcengineApiKey');
        if (!apiKey) {
            throw new Error('Volcengine API key not configured. Please set it in extension settings.');
        }
        const model = config.get('volcengineModel', 'ep-20240722180546-xqxzh');
        const baseUrl = config.get('volcengineBaseUrl', 'https://ark.cn-beijing.volces.com/api/v3');
        const response = await (0, node_fetch_1.default)(`${baseUrl}/chat/completions`, {
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
    generatePrompt(content, framework, testRunner, fileName) {
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
    formatTestContent(content) {
        // Remove any markdown formatting from the AI response
        return content.replace(/^```typescript|^```ts|^```/gm, '').replace(/```$/gm, '').trim();
    }
}
exports.TestGenerator = TestGenerator;
//# sourceMappingURL=testGenerator.js.map