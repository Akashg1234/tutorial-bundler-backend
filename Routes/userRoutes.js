import { Router } from "express";
import { deleteMe,deleteUser,updateUserRole,getAllUser,removeFromPlayList,addToPlayList,userRegister,userDetails,loginUser ,logoutUser,updatePassword,updateUserProfile,updateProfilePicture,forgetPassword,resetPassword} from "../Controllers/userController.js";
import { authorizedRoles, isAuthenticated } from "../Middlewares/authentication.js";

const router = Router()

router.route('/register').post(userRegister)
router.route('/login').post(loginUser)
router.route('/logout').get(isAuthenticated,logoutUser)
router.route('/me').get(isAuthenticated,userDetails)
router.route('/deleteme').delete(isAuthenticated,deleteMe)
router.route('/changepassword').put(isAuthenticated,updatePassword)
router.route('/updateprofile').put(isAuthenticated,updateUserProfile)
router.route('/updateprofilepicture').put(isAuthenticated,updateProfilePicture)
router.route('/forgetpassword').post(forgetPassword)
router.route('/resetpassword/:token').put(resetPassword)
router.route('/addtoplaylist').post(isAuthenticated,addToPlayList)
router.route('/removetoplaylist').delete(isAuthenticated,removeFromPlayList)


router.route('/admin/users').get(isAuthenticated,authorizedRoles('admin'),getAllUser)
router.route('/admin/user/:id').put(isAuthenticated,authorizedRoles('admin'),updateUserRole)
router.route('/admin/user/:id').delete(isAuthenticated,authorizedRoles('admin'),deleteUser)


export default router