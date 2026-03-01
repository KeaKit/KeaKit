export const removeSelectedId = (
  selectedIds: number[],
  idToRemove: number,
): number[] => selectedIds.filter((selectedId) => selectedId !== idToRemove);
