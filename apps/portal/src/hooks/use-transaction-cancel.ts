// Small helper to normalize wallet cancel/reject into a boolean

export const isUserCancellation = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /cancelled|canceled|rejected|denied|abort/i.test(message);
};
