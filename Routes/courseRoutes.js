import { Router } from "express";
import {getAllCourses,createCourse,getCourseLecture,addCourseLecture, deleteCourse} from '../Controllers/courseController.js'
import { isAuthenticated,authorizedRoles, authorizedSubscriber } from "../Middlewares/authentication.js";


const router = Router()

router.route('/courses').get(getAllCourses)
router.route('/createcourse').post(isAuthenticated,authorizedRoles('admin'),createCourse)
router.route('/course/:id').get(isAuthenticated,authorizedSubscriber,getCourseLecture)
router.route('/course/:id').post(isAuthenticated,authorizedRoles('admin'),addCourseLecture)
router.route('/course/:id').delete(isAuthenticated,authorizedRoles('admin'),deleteCourse)
router.route('/lecture').delete(isAuthenticated,authorizedRoles('admin'),deleteCourse)

export default router