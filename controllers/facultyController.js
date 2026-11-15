const storage = require('../utils/storage');

/**
 * @route GET /api/faculty
 * @desc Get all faculty members
 */
async function getFaculty(req, res, next) {
  try {
    const faculty = await storage.getAllFaculty();
    res.json({
      success: true,
      count: faculty.length,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route POST /api/faculty
 * @desc Register a new faculty member
 */
async function createFaculty(req, res, next) {
  try {
    const { facultyId, name, department, email } = req.body;

    if (!facultyId || !name || !department || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields (facultyId, name, department, email) are required.'
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const newFaculty = await storage.createFaculty({
      facultyId,
      name,
      department,
      email
    });

    res.status(201).json({
      success: true,
      message: 'Faculty member registered successfully.',
      data: newFaculty
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route DELETE /api/faculty/:idOrFacultyId
 * @desc Delete faculty member
 */
async function deleteFaculty(req, res, next) {
  try {
    const { idOrFacultyId } = req.params;
    const deleted = await storage.deleteFaculty(idOrFacultyId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Faculty member "${idOrFacultyId}" not found.`
      });
    }
    res.json({
      success: true,
      message: `Faculty member ${deleted.name} (${deleted.facultyId}) deleted successfully.`,
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFaculty,
  createFaculty,
  deleteFaculty
};
