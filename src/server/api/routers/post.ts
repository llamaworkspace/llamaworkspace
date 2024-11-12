import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.create({
        data: {
          name: input.name,
        },
      });

      return ctx.db.app.create({
        data: {
          title: input.name,
          engineType: "LLAMA3",
          user: { connect: { id: ctx.session.user.id } },
          workspace: { connect: { id: workspace.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.app.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return post ?? null;
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return ctx.db.app.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
