import mongoose from 'mongoose';

const GroupSchema = mongoose.Schema({
  id: { type: Object },
  babyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Baby', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
});
// Índice único para asegurar que no haya duplicados de la misma combinación babyId y parentId
GroupSchema.index({ babyId: 1, parentId: 1 }, { unique: true });

export default mongoose.model('Group', GroupSchema);
