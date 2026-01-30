import { mutation , query } from "./_generated/server";
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

