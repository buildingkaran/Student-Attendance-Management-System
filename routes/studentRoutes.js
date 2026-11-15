const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// GET /api/students - Get all students or search
router.get('/', studentController.getStudents);

// GET /api/students/:rollNo - Get student by roll
router.get('/:rollNo', studentController.getStudentByRoll);

// POST /api/students - Create new student
router.post('/', studentController.createStudent);

// DELETE /api/students/:idOrRoll - Delete student
router.delete('/:idOrRoll', studentController.deleteStudent);

module.exports = router;
