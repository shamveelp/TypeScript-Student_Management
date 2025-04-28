import mongoose, { Document, Schema } from 'mongoose';

// Student interface
export interface IStudent extends Document {
  name: string;
  age: number;
  email: string;
  batch: string;
  course: string;
  createdAt: Date;
  updatedAt: Date;
}

// Student schema
const StudentSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [15, 'Age must be at least 15'],
    max: [100, 'Age must be less than 100']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  batch: {
    type: String,
    required: [true, 'Batch is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Create and export Student model
export default mongoose.model<IStudent>('Student', StudentSchema);