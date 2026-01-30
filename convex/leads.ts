import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createLead = mutation({
  args: {
    email: v.string(),
    isWinner: v.boolean(),
    prize: v.union(v.string(), v.null())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      email: args.email,
      isWinner: args.isWinner,
      prize: null,
    });
  },
});

export const getAllLeads = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leads").collect();
  },
});

export const getProbabilities = query({
  args: {},
  handler: async (ctx) => {
    // Obtenemos la primera configuración disponible
    const probabilities = await ctx.db.query("probabilities").first();
    return probabilities;
  },
});

export const updateProbability = mutation({
  args: {
    prize: v.union(
      v.literal("sos"),
      v.literal("grua"),
      v.literal("moto"),
      v.literal("moura"),
      v.literal("lusqtoff")
    ),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    // Validar que el valor esté entre 0 y 1
    if (args.value < 0 || args.value > 1) {
      throw new Error("La probabilidad debe estar entre 0 y 1");
    }

    const existing = await ctx.db.query("probabilities").first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        [args.prize]: args.value,
      });
    } else {
      // Si no existe, crear con valores por defecto y el valor actualizado
      await ctx.db.insert("probabilities", {
        sos: args.prize === "sos" ? args.value : 0.05,
        grua: args.prize === "grua" ? args.value : 0.1,
        moto: args.prize === "moto" ? args.value : 0.15,
        moura: args.prize === "moura" ? args.value : 0.2,
        lusqtoff: args.prize === "lusqtoff" ? args.value : 0.25,
      });
    }
  },
});

// Mutation para actualizar todas las probabilidades a la vez
export const updateAllProbabilities = mutation({
  args: {
    sos: v.number(),
    grua: v.number(),
    moto: v.number(),
    moura: v.number(),
    lusqtoff: v.number(),
  },
  handler: async (ctx, args) => {
    // Validar que todos los valores estén entre 0 y 1
    const values = Object.values(args);
    if (values.some(v => v < 0 || v > 1)) {
      throw new Error("Todas las probabilidades deben estar entre 0 y 1");
    }

    // Validar que la suma no supere 1
    const sum = values.reduce((acc, val) => acc + val, 0);
    if (sum > 1) {
      throw new Error(`La suma de probabilidades (${(sum * 100).toFixed(1)}%) no puede superar 100%`);
    }

    const existing = await ctx.db.query("probabilities").first();
    
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("probabilities", args);
    }
  },
});