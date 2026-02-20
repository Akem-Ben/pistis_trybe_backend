import { Schema, model, Document, Types } from "mongoose";

export interface IGroupMember extends Document {
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  role: "admin" | "member";
  joinedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMember>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

// A user can only be a member of a group once
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const GroupMember = model<IGroupMember>(
  "GroupMember",
  GroupMemberSchema,
);
