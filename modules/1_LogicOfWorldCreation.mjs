import { initialPresets } from "../configs/constants.mjs"

// 1. UNKNOWN LOGIC OF WORLD CREATION.
export class World {
  constructor(_GodSHiddenThoughts) {
    this.generatedPresets = {
      ...initialPresets,
    }
    this.isRunned = true
  };

  bigBang = async _generatedPresets => {
    const entities = null
    return entities
  }

  toDevelopCivilization = async _entities => {
    const output = {
      populationIsBroken: Boolean(Math.round(Math.random())),
      destroyTheWorld: null,
      rethinking: async _thoughts => _thoughts,
    }
    return output
  }
};