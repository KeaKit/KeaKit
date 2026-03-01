import { removeSelectedId } from "../src/screens/kit/createKitSelection";

describe("removeSelectedId", () => {
  it("elimina el id indicado de la selección", () => {
    const selectedIds = [1, 2, 3, 4];

    const result = removeSelectedId(selectedIds, 3);

    expect(result).toEqual([1, 2, 4]);
  });

  it("no modifica la selección si el id no existe", () => {
    const selectedIds = [10, 20, 30];

    const result = removeSelectedId(selectedIds, 999);

    expect(result).toEqual([10, 20, 30]);
  });

  it("elimina todas las ocurrencias del id si estuviera repetido", () => {
    const selectedIds = [7, 8, 7, 9, 7];

    const result = removeSelectedId(selectedIds, 7);

    expect(result).toEqual([8, 9]);
  });
});
