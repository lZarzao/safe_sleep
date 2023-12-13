import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  id: { type: Object },
  idUser: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, required: true },
});

export default mongoose.model("Todo", TodoSchema)