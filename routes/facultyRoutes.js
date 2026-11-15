const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

// GET /api/faculty - Get all faculty members
router.get('/', facultyController.getFaculty);

// POST /api/faculty - Add a new faculty member
router.post('/', facultyController.createFaculty);

// DELETE /api/faculty/:idOrFacultyId - Delete faculty member
router.delete('/:idOrFacultyId', facultyController.deleteFaculty);

module.exports = router;
