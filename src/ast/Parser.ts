import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as types from '@babel/types';
import { readFileSync } from 'fs';
import { logger } from '../utils/logger';
import { ASTParseResult } from '../ai/TestGenerator';

export class ASTParser {
  /**
   * Parse component file and extract metadata
   */
  async parseComponent(filePath: string, framework: string): Promise<ASTParseResult> {
    logger.debug(`Parsing ${framework} component at ${filePath}...`);
    
    const fileContent = readFileSync(filePath, 'utf-8');
    
    switch (framework.toLowerCase()) {
      case 'react':
        return this.parseReactComponent(fileContent, filePath);
      case 'vue':
        return this.parseVueComponent(fileContent, filePath);
      case 'angular':
        return this.parseAngularComponent(fileContent, filePath);
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }

  /**
   * Parse React component (TSX/JSX)
   */
  private parseReactComponent(content: string, filePath: string): ASTParseResult {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties']
    });

    const result: ASTParseResult = {
      componentName: this.extractComponentName(filePath),
      props: [],
      state: [],
      methods: [],
      dependencies: [],
      componentType: 'function'
    };

    traverse(ast, {
      // Extract imports
      ImportDeclaration(path) {
        const importSource = path.node.source.value;
        if (!result.dependencies.includes(importSource)) {
          result.dependencies.push(importSource);
        }
      },

      // Function component
      ArrowFunctionExpression(path) {
        if (this.isReactComponent(path)) {
          result.componentType = 'function';
          this.extractFunctionComponentProps(path, result);
        }
      },

      FunctionDeclaration(path) {
        if (this.isReactComponent(path)) {
          result.componentType = 'function';
          result.componentName = path.node.id?.name || result.componentName;
          this.extractFunctionComponentProps(path, result);
        }
      },

      // Class component
      ClassDeclaration(path) {
        if (this.isReactClassComponent(path)) {
          result.componentType = 'class';
          result.componentName = path.node.id?.name || result.componentName;
          this.extractClassComponentMembers(path, result);
        }
      }
    });

    return result;
  }

  /**
   * Parse Vue component (single file component)
   */
  private parseVueComponent(content: string, filePath: string): ASTParseResult {
    const result: ASTParseResult = {
      componentName: this.extractComponentName(filePath),
      props: [],
      state: [],
      methods: [],
      dependencies: [],
      componentType: 'function'
    };

    // Extract script content
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const scriptContent = scriptMatch[1];
      try {
        const ast = parser.parse(scriptContent, {
          sourceType: 'module',
          plugins: ['typescript']
        });

        traverse(ast, {
          ObjectExpression(path) {
            // Look for export default { ... }
            if (path.parentPath.isExportDefaultDeclaration()) {
              this.extractVueComponentOptions(path, result);
            }
          }
        });
      } catch (error) {
        logger.warn(`Failed to parse Vue component script: ${(error as Error).message}`);
      }
    }

    return result;
  }

  /**
   * Parse Angular component
   */
  private parseAngularComponent(content: string, filePath: string): ASTParseResult {
    const result: ASTParseResult = {
      componentName: this.extractComponentName(filePath),
      props: [],
      state: [],
      methods: [],
      dependencies: [],
      componentType: 'class'
    };

    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'decorators-legacy']
      });

      traverse(ast, {
        ClassDeclaration(path) {
          // Look for @Component decorator
          const decorator = path.node.decorators?.find(
            (d: any) => d.expression.callee.name === 'Component'
          );
          
          if (decorator) {
            this.extractAngularClassMembers(path, result);
          }
        }
      });
    } catch (error) {
      logger.warn(`Failed to parse Angular component: ${(error as Error).message}`);
    }

    return result;
  }

  /**
   * Check if AST path represents a React component
   */
  private isReactComponent(path: any): boolean {
    // Check if returns JSX
    if (path.node.body.type === 'JSXElement') {
      return true;
    }
    
    // Check if uses React hooks
    if (path.node.body.type === 'BlockStatement') {
      const hasHooks = path.node.body.body.some(
        (stmt: any) => stmt.type === 'ExpressionStatement' && 
                      stmt.expression.type === 'CallExpression' && 
                      stmt.expression.callee.name?.startsWith('use')
      );
      return hasHooks;
    }
    
    return false;
  }

  /**
   * Check if AST path represents a React class component
   */
  private isReactClassComponent(path: any): boolean {
    // Check if extends React.Component
    if (path.node.superClass) {
      const superClass = path.node.superClass;
      if (superClass.type === 'MemberExpression' && 
          superClass.object.name === 'React' && 
          superClass.property.name === 'Component') {
        return true;
      }
      if (superClass.type === 'Identifier' && 
          (superClass.name === 'Component' || superClass.name === 'PureComponent')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Extract props from function component
   */
  private extractFunctionComponentProps(path: any, result: ASTParseResult): void {
    const params = path.node.params;
    params.forEach((param: any) => {
      if (param.type === 'ObjectPattern') {
        param.properties.forEach((prop: any) => {
          if (prop.type === 'ObjectProperty') {
            result.props.push({
              name: prop.key.name,
              type: 'any',
              required: !prop.value || prop.value.type !== 'Identifier'
            });
          }
        });
      }
    });
  }

  /**
   * Extract members from class component
   */
  private extractClassComponentMembers(path: any, result: ASTParseResult): void {
    path.node.body.body.forEach((member: any) => {
      if (member.type === 'ClassMethod' && member.kind === 'method') {
        result.methods.push({
          name: member.key.name,
          parameters: member.params.map((param: any) => ({
            name: param.name,
            type: 'any'
          })),
          returnType: 'void',
          functionality: 'Class method'
        });
      } else if (member.type === 'ClassProperty' && !member.static) {
        result.state.push({
          name: member.key.name,
          type: 'any',
          initialValue: member.value ? member.value.type : 'undefined'
        });
      }
    });
  }

  /**
   * Extract Vue component options
   */
  private extractVueComponentOptions(path: any, result: ASTParseResult): void {
    path.node.properties.forEach((prop: any) => {
      if (prop.key.name === 'props') {
        if (prop.value.type === 'ObjectExpression') {
          prop.value.properties.forEach((propDef: any) => {
            result.props.push({
              name: propDef.key.name,
              type: propDef.value.type === 'ObjectExpression' 
                ? this.extractVuePropType(propDef.value) 
                : 'any',
              required: this.extractVuePropRequired(propDef.value)
            });
          });
        }
      } else if (prop.key.name === 'data') {
        // Extract data properties
      } else if (prop.key.name === 'methods') {
        // Extract methods
      }
    });
  }

  /**
   * Extract Angular class members
   */
  private extractAngularClassMembers(path: any, result: ASTParseResult): void {
    path.node.body.body.forEach((member: any) => {
      if (member.type === 'ClassMethod') {
        result.methods.push({
          name: member.key.name,
          parameters: member.params.map((param: any) => ({
            name: param.name,
            type: 'any'
          })),
          returnType: 'void',
          functionality: 'Class method'
        });
      }
    });
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const fileName = filePath.split('/').pop() || 'Component';
    return fileName.replace(/\.(tsx|jsx|vue|ts)$/, '');
  }

  /**
   * Extract Vue prop type
   */
  private extractVuePropType(propValue: any): string {
    const typeProp = propValue.properties.find((p: any) => p.key.name === 'type');
    if (typeProp) {
      return typeProp.value.name || 'any';
    }
    return 'any';
  }

  /**
   * Extract Vue prop required status
   */
  private extractVuePropRequired(propValue: any): boolean {
    const requiredProp = propValue.properties.find((p: any) => p.key.name === 'required');
    return requiredProp ? requiredProp.value.value : false;
  }
}