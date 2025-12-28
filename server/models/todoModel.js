import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  priority: { type: String, default: "Medium" },
  dueDate: { type: Date }
});

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
