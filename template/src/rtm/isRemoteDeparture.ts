export const isRemoteDeparture = (
  type: number,
  includeTimeout: boolean,
): boolean => type === 4 || (includeTimeout && type === 5);
