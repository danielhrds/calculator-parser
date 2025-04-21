export const isNumber = (str: string): boolean => {
  return str !== ' ' && !isNaN(Number(str))
}