export const logWarning = (warningMessage: string): void => {
  if (
    typeof process !== 'object' ||
    (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production')
  ) {
    const yellowColor = '\x1b[33m%s\x1b[0m'

    const warning = ['[neverthrow]', warningMessage].join(' - ')

    console.warn(yellowColor, warning)
  }
}
