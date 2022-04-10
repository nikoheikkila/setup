import { chalk } from "zx";

export const info = (message) => console.log(chalk.green(message));
export const warning = (message) => console.log(chalk.yellow(message));
export const error = (message) => console.error(chalk.red.bold(message));
