import {
  removeSelectedId,
  removeSelectedQuantity,
  upsertSelectedQuantity,
} from "../src/screens/kit/createKitSelection";

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

describe("removeSelectedQuantity", () => {
  it("elimina el producto del mapa de cantidades", () => {
    const selectedQuantities = { 1: 2, 2: 4, 3: 1 };

    const result = removeSelectedQuantity(selectedQuantities, 2);

    expect(result).toEqual({ 1: 2, 3: 1 });
  });

  it("no modifica el mapa si el producto no existe", () => {
    const selectedQuantities = { 10: 2, 20: 1 };

    const result = removeSelectedQuantity(selectedQuantities, 999);

    expect(result).toEqual({ 10: 2, 20: 1 });
  });
});

describe("upsertSelectedQuantity", () => {
  it("añade una nueva cantidad cuando el producto no existe", () => {
    const selectedQuantities = { 1: 2 };

    const result = upsertSelectedQuantity(selectedQuantities, 3, 5);

    expect(result).toEqual({ 1: 2, 3: 5 });
  });

  it("actualiza la cantidad cuando el producto ya existe", () => {
    const selectedQuantities = { 7: 1, 8: 3 };

    const result = upsertSelectedQuantity(selectedQuantities, 8, 4);

    expect(result).toEqual({ 7: 1, 8: 4 });
  });
});
