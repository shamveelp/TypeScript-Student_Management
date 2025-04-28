import Student, { IStudent } from '../models/Student';
import mongoose from 'mongoose';

class StudentService {
  // Get all students
  async getAllStudents(): Promise<IStudent[]> {
    try {
      return await Student.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting students: ${error}`);
    }
  }

  // Create a new student
  async createStudent(studentData: IStudent): Promise<IStudent> {
    try {
      const student = new Student(studentData);
      return await student.save();
    } catch (error) {
      throw new Error(`Error creating student: ${error}`);
    }
  }

  // Get a student by ID
  async getStudentById(id: string): Promise<IStudent | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid student ID');
      }
      return await Student.findById(id);
    } catch (error) {
      throw new Error(`Error getting student: ${error}`);
    }
  }

  // Update a student
  async updateStudent(id: string, studentData: Partial<IStudent>): Promise<IStudent | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid student ID');
      }
      return await Student.findByIdAndUpdate(id, studentData, { new: true, runValidators: true });
    } catch (error) {
      throw new Error(`Error updating student: ${error}`);
    }
  }

  // Delete a student
  async deleteStudent(id: string): Promise<IStudent | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid student ID');
      }
      return await Student.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting student: ${error}`);
    }
  }

  // Search students by name or email
  async searchStudents(query: string): Promise<IStudent[]> {
    try {
      if (!query) {
        return await this.getAllStudents();
      }
      
      return await Student.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { course: { $regex: query, $options: 'i' } },
          { batch: { $regex: query, $options: 'i' } }
        ]
      });
    } catch (error) {
      throw new Error(`Error searching students: ${error}`);
    }
  }

  // Filter students by age range
  async filterByAge(minAge: number, maxAge: number): Promise<IStudent[]> {
    try {
      return await Student.find({
        age: { $gte: minAge, $lte: maxAge }
      });
    } catch (error) {
      throw new Error(`Error filtering students by age: ${error}`);
    }
  }
}

export default StudentService;