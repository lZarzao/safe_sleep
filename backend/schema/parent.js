import mongoose from 'mongoose';

const ParentSchema = mongoose.Schema({
  id: { type: Object },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  socketId: { type: String, default: '' },
});

export default mongoose.model('Parent', ParentSchema);
