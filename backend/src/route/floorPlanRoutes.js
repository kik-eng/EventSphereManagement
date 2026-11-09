const express = require('express');
const router = express.Router();
const {
  createHallWithBooths,
  getFloorPlan,
  updateBooth,
  approveBooth,
  getExhibitors,
   getAllHalls,
} = require('../controllers/floorPlanController');

const { protect, adminOnly } = require('../middleware/adminMiddleware');

// All floor-plan routes require authentication + admin role
// POST   /api/floor-plan/hall              → Create hall & batch generate booths
router.post('/hall', protect, adminOnly, createHallWithBooths);

// GET    /api/floor-plan/floor-plan        → Fetch halls + all booths (optionally filter by ?hallId=)
router.get('/floor-plan', protect, adminOnly, getFloorPlan);

// GET    /api/floor-plan/exhibitors        → List all exhibitors for assignment dropdown
router.get('/exhibitors', protect, adminOnly, getExhibitors);

// PUT    /api/floor-plan/booth/:id         → Update booth category / price / status
router.put('/booth/:id', protect, adminOnly, updateBooth);

// PUT    /api/floor-plan/booth/:id/approve → Assign & approve booth for an exhibitor
router.put('/booth/:id/approve', protect, adminOnly, approveBooth);


router.get('/halls', protect, adminOnly, getAllHalls);
module.exports = router;
