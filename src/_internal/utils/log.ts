import chalk from 'chalk'

export const success = (...args: any[]) => {
  console.log(chalk.green(...args))
}

export const warn = (...args: any[]) => {
  console.log(chalk.hex('#FFA500')(...args))
}

export const info = (...args: any[]) => {
  console.log(chalk.hex('#77CFF5')(...args))
}

export const error = (...args: any[]) => {
  console.log(chalk.red(...args))
}

export const hop = (...args: any[]) => {
  console.log(chalk.hex('#F577F5')(...args))
}
