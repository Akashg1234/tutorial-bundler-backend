import { Router } from "express";
import { buySubscription ,getRazorPayKey,paymentVerification,cancelSubscription} from "../Controllers/paymentController.js";
import { authorizedRoles, isAuthenticated } from "../Middlewares/authentication.js";
const router = Router()

router.route('/subscribe').get(isAuthenticated,authorizedRoles('user'),buySubscription)
router.route('/paymentverification').post(isAuthenticated,authorizedRoles('user'),paymentVerification)
router.route('/paymentverification').post(getRazorPayKey)
router.route('/subscribe/cancel').post(isAuthenticated,authorizedRoles('user'),cancelSubscription)

export default router