import { Schema, model, Document, Types } from "mongoose";

export interface IChat extends Document {
  participants: Types.ObjectId[]; // This will always be exactly 2 users [userA, userB]
  lastMessageAt: Date | null;
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Ensure one Chat per pair — prevents duplicates regardless of order
ChatSchema.index({ participants: 1 }, { unique: true });

export const Chat = model<IChat>("Chat", ChatSchema);
