import { Router } from "express";
import { adminDashboard, contactHandler, courseRequest } from "../Controllers/otherController.js";
import { authorizedRoles, isAuthenticated } from "../Middlewares/authentication.js";
const router = Router()

router.route('/contact').post(contactHandler)
router.route('/courserequest').post(courseRequest)
router.route('/admin/dashboard').post(isAuthenticated,authorizedRoles('admin'),adminDashboard)

export default router