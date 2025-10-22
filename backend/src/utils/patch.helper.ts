export function cleanPatchData<T extends object>(
  patchData: Partial<T>,
  existingUser: T,
  stripNull = true,
): { cleaned: Partial<T>; isChanged: boolean } {
  const cleaned: Partial<T> = {};
  let isChanged: boolean = false;
  for (const key of Object.keys(patchData) as (keyof T)[]) {
    const newValue = patchData[key];
    const oldValue = existingUser[key];
    if (newValue !== undefined && (!stripNull || newValue !== null)) {
      if (newValue !== oldValue) {
        cleaned[key] = newValue;
        isChanged = true;
      }
    }
  }
  return { cleaned, isChanged };
}
