const storage = require('../utils/storage');

/**
 * @route GET /api/students
 * @desc Get all students or filter by search query
 */
async function getStudents(req, res, next) {
  try {
    const { search } = req.query;
    const students = await storage.getAllStudents(search);
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/students/:rollNo
 * @desc Get single student by roll number
 */
async function getStudentByRoll(req, res, next) {
  try {
    const { rollNo } = req.params;
    const student = await storage.findStudentByRoll(rollNo);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with roll number "${rollNo}" not found.`
      });
    }
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route POST /api/students
 * @desc Register a new student
 */
async function createStudent(req, res, next) {
  try {
    const { rollNo, name, course, semester, email } = req.body;

    // Basic validation
    if (!rollNo || !name || !course || !semester || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields (rollNo, name, course, semester, email) are required.'
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const semNum = Number(semester);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be a valid number between 1 and 8.'
      });
    }

    const newStudent = await storage.createStudent({
      rollNo,
      name,
      course,
      semester: semNum,
      email
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data: newStudent
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route DELETE /api/students/:idOrRoll
 * @desc Delete student by ID or roll number
 */
async function deleteStudent(req, res, next) {
  try {
    const { idOrRoll } = req.params;
    const deleted = await storage.deleteStudent(idOrRoll);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Student "${idOrRoll}" not found.`
      });
    }
    res.json({
      success: true,
      message: `Student ${deleted.name} (${deleted.rollNo}) deleted successfully.`,
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudents,
  getStudentByRoll,
  createStudent,
  deleteStudent
};
