import chalk from 'chalk';

export const logger = {
  info: (message: string) => {
    console.log(chalk.blue('INFO:'), message);
  },
  success: (message: string) => {
    console.log(chalk.green('SUCCESS:'), message);
  },
  error: (message: string) => {
    console.log(chalk.red('ERROR:'), message);
  },
  warn: (message: string) => {
    console.log(chalk.yellow('WARN:'), message);
  },
  debug: (message: string) => {
    console.log(chalk.gray('DEBUG:'), message);
  }
};
