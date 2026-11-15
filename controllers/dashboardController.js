const storage = require('../utils/storage');
const dbConfig = require('../config/db');

/**
 * @route GET /api/dashboard/stats
 * @desc Get aggregated stats for the university dashboard
 */
async function getDashboardStats(req, res, next) {
  try {
    const stats = await storage.getDashboardStats();
    const dbStatus = dbConfig.getStatus();

    res.json({
      success: true,
      data: {
        ...stats,
        database: dbStatus
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats
};
