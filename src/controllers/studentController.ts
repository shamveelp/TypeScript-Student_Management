import { Request, Response, NextFunction } from 'express';
import StudentService from '../services/studentService';
import { IStudent } from '../models/Student';

class StudentController {
  private studentService: StudentService;

  constructor() {
    this.studentService = new StudentService();
  }

  // Get all students
  getAllStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const students = await this.studentService.getAllStudents();
      res.render('index', { 
        title: 'Student Management System',
        students,
        message: req.query.message || ''
      });
    } catch (error) {
      next(error);
    }
  };

  // Create a new student
  createStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentData = req.body as IStudent;
      await this.studentService.createStudent(studentData);
      res.redirect('/?message=Student added successfully');
    } catch (error) {
      next(error);
    }
  };

  // Get a student by ID
  getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const student = await this.studentService.getStudentById(id);
      
      if (!student) {
        res.status(404).send('Student not found');
        return;
      }
      
      res.json(student);
    } catch (error) {
      next(error);
    }
  };

  // Update a student
  updateStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const studentData = req.body as Partial<IStudent>;
      await this.studentService.updateStudent(id, studentData);
      res.redirect('/?message=Student updated successfully');
    } catch (error) {
      next(error);
    }
  };

  // Delete a student
  deleteStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      await this.studentService.deleteStudent(id);
      res.redirect('/?message=Student deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  // Search students
  searchStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string;
      const filteredStudents = await this.studentService.searchStudents(query);
      res.json(filteredStudents);
    } catch (error) {
      next(error);
    }
  };

  // Filter students by age
  filterByAge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const minAge = parseInt(req.query.min as string) || 0;
      const maxAge = parseInt(req.query.max as string) || 100;
      const filteredStudents = await this.studentService.filterByAge(minAge, maxAge);
      res.json(filteredStudents);
    } catch (error) {
      next(error);
    }
  };
}

export default StudentController;