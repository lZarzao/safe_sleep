import mongoose from 'mongoose';

const BabySchema = mongoose.Schema({
  id: { type: Object },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  birthDate: { type: Date, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  socketId: { type: String, default: '' },
});

export default mongoose.model('Baby', BabySchema);
