import { Schema, model, Document, Types } from "mongoose";

export interface IFollow extends Document {
  followerId: Types.ObjectId; // This is the user who is following
  followingId: Types.ObjectId; // This is the user being followed
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    followingId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

// Prevent a user from following the same person twice
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const Follow = model<IFollow>("Follow", FollowSchema);
