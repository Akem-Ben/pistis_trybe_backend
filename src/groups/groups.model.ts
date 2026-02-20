import { Schema, model, Document, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description: string | null;
  coverUrl: string | null;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    coverUrl: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// GroupSchema.pre(/^find/, function (next) {
//   (this as any).where({ isDeleted: false });
//   next();
// });

export const Group = model<IGroup>('Group', GroupSchema);