export const now = (): Date => new Date();

export const toUnix = (date: Date): number => Math.floor(date.getTime() / 1000);
