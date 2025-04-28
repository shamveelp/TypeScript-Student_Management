import express from 'express';
import StudentController from '../controllers/studentController';

const router = express.Router();
const studentController = new StudentController();

// Get all students (main page)
router.get('/', studentController.getAllStudents);

// Create a new student
router.post('/students', studentController.createStudent);

// Get a student by ID
router.get('/students/:id', studentController.getStudentById);

// Update a student
router.put('/students/:id', studentController.updateStudent);

// Delete a student
router.delete('/students/:id', studentController.deleteStudent);

// Search students
router.get('/search', studentController.searchStudents);

export default router;