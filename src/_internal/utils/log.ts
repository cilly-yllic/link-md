import chalk from 'chalk';


export const success = (...args: any[]) => {
  console.log(chalk.green(...args));
}

export const warn = (...args: any[]) => {
  console.log(chalk.hex('#FFA500')(...args));
}

export const info = (...args: any[]) => {
  console.log(chalk.blue(...args));
}

export const error = (...args: any[]) => {
  console.log(chalk.red(...args));
}