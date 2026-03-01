export const removeSelectedId = (
  selectedIds: number[],
  idToRemove: number,
): number[] => selectedIds.filter((selectedId) => selectedId !== idToRemove);

export const removeSelectedQuantity = (
  selectedQuantities: Record<number, number>,
  idToRemove: number,
): Record<number, number> => {
  const next = { ...selectedQuantities };
  delete next[idToRemove];
  return next;
};

export const upsertSelectedQuantity = (
  selectedQuantities: Record<number, number>,
  id: number,
  quantity: number,
): Record<number, number> => ({
  ...selectedQuantities,
  [id]: quantity,
});
