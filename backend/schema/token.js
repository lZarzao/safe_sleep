import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  id: { type: Object },
  token: { type: String, required: true },
});

export default mongoose.model('Token', TokenSchema);
