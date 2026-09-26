import { describe, it, expect } from "@jest/globals";
import { normalizeCharacter } from "../../utils/characters";
import { sampleCharacters } from "../../data/sampleCharacters";

const sample = sampleCharacters[0];
if (!sample) throw new Error("Personnage de test manquant");
const characterFixture = sample;

describe("points de relance", () => {
  it("ouvre les anciens personnages avec des compteurs à zéro", () => {
    const character = normalizeCharacter({ ...characterFixture, advantagePoints: undefined, disadvantagePoints: undefined });
    expect(character.advantagePoints).toBe(0);
    expect(character.disadvantagePoints).toBe(0);
  });

  it("conserve les deux réserves indépendantes après sérialisation", () => {
    const character = normalizeCharacter({ ...characterFixture, advantagePoints: 3, disadvantagePoints: 2 });
    const restored = normalizeCharacter(JSON.parse(JSON.stringify(character)));
    expect(restored.advantagePoints).toBe(3);
    expect(restored.disadvantagePoints).toBe(2);
    expect(restored.stats).toEqual(character.stats);
  });

  it.each([-1, NaN, Infinity])("corrige un compteur invalide (%s)", (value) => {
    const character = normalizeCharacter({ ...characterFixture, advantagePoints: value, disadvantagePoints: 2.8 });
    expect(character.advantagePoints).toBe(0);
    expect(character.disadvantagePoints).toBe(2);
  });
});
