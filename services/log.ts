import chalk from "chalk";

export const info = (message: string) => console.log(chalk.green(message));
export const warning = (message: string) => console.log(chalk.yellow(message));
export const error = (error: Error | string) => console.error(chalk.red.bold(error));
