import { Schema, model, Document, Types } from "mongoose";

export type FeedType = "post" | "announcement" | "event";
export type FeedVisibility = "public" | "group" | "private";

export interface IPost extends Document {
  authorId: Types.ObjectId;
  groupId: Types.ObjectId | null;
  type: FeedType;
  visibility: FeedVisibility;
  title: string | null;
  body: string;
  mediaUrls: string[];
  eventDate: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
    type: {
      type: String,
      enum: ["post", "announcement", "event"],
      default: "post",
    },
    visibility: {
      type: String,
      enum: ["public", "group", "private"],
      default: "public",
    },
    title: { type: String, default: null },
    body: { type: String, required: true },
    mediaUrls: [{ type: String }],
    eventDate: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Pleasde this is supposed to filter out soft-deleted posts by default in all queries
// PostSchema.pre(/^find/, function (next) {
//   (this as any).where({ isDeleted: false });
//   next();
// });

PostSchema.index({ visibility: 1, createdAt: -1 });
PostSchema.index({ groupId: 1, createdAt: -1 });

export const Post = model<IPost>("Post", PostSchema);
