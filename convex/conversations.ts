import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const createConversation = mutation({
    args: {
        participants: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.id("_storage")),
        admin: v.optional(v.string()),
    },
    handler: async (ctx, args ) => {
        const indentity = await ctx.auth.getUserIdentity();
        if(!indentity) throw new ConvexError("Unauthourized");


        const existingConversation = await ctx.db
        .query("conversations")
        .filter((q) => 
            q.or(
                q.eq(q.field("participants"), args.participants),
                q.eq(q.field("participants"), args.participants.reverse()),
            )
        )
        .first();

        if (existingConversation) {
            return existingConversation._id;
        }

        let groupImage;

        if (args.groupImage) {
            groupImage = (await ctx.storage.getUrl(args.groupImage)) as string;
        }

        const conversationId = await ctx.db.insert("conversations", {
            participants: args.participants,
            isGroup: args.isGroup,
            groupName: args.groupName,
            groupImage,
            admin: args.admin,
        });

        return conversationId;
    },
});


export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
})