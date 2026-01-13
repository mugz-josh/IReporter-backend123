import express from 'express';
import authController from '../Controllers/authController';
import redFlagsController from '../Controllers/redFlagsController';
import interventionsController from '../Controllers/interventionsController';
import commentsController from '../Controllers/commentsController';
import upvotesController from '../Controllers/upvotesController';
import auth from '../middleware/auth';
import notificationController from '../Controllers/notificationController';
import upload from '../config/multer';
const router = express.Router();
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

router.get('/auth/profile', auth.verifyToken, authController.getProfile);
router.patch('/auth/profile', auth.verifyToken, authController.updateProfile);
router.post('/auth/profile/picture', auth.verifyToken, upload.single('profile_picture'), authController.uploadProfilePicture);
router.get('/auth/users', auth.verifyToken, auth.isAdmin, authController.getUsers);

router.get('/red-flags', auth.verifyToken, redFlagsController.getAllRedFlags);
router.get('/red-flags/:id', auth.verifyToken, redFlagsController.getRedFlag);
router.post('/red-flags', auth.verifyToken, upload.any(), redFlagsController.createRedFlag);
router.patch('/red-flags/:id/location', auth.verifyToken, auth.checkRecordOwnership('red_flags'), redFlagsController.updateLocation);
router.patch('/red-flags/:id/comment', auth.verifyToken, auth.checkRecordOwnership('red_flags'), redFlagsController.updateComment);
router.post('/red-flags/:id/media', auth.verifyToken, auth.checkRecordOwnership('red_flags'), upload.array('media', 2), redFlagsController.addMedia);
router.delete('/red-flags/:id', auth.verifyToken, auth.checkRecordOwnership('red_flags'), redFlagsController.deleteRedFlag);
router.patch('/red-flags/:id/status', auth.verifyToken, auth.isAdmin, redFlagsController.updateStatus);
router.put('/red-flags/:id', auth.verifyToken, auth.checkRecordOwnership('red_flags'), upload.array('media', 2), redFlagsController.updateRedFlag)

router.get('/notifications', auth.verifyToken, notificationController.getUserNotifications);
router.put('/notifications/read', auth.verifyToken, notificationController.markAllAsRead);

router.get('/interventions', auth.verifyToken, interventionsController.getAllInterventions);
router.get('/interventions/:id', auth.verifyToken, interventionsController.getIntervention);
router.post('/interventions', auth.verifyToken, upload.any(), interventionsController.createIntervention);
router.patch('/interventions/:id/location', auth.verifyToken, auth.checkRecordOwnership('interventions'), interventionsController.updateLocation);
router.patch('/interventions/:id/comment', auth.verifyToken, auth.checkRecordOwnership('interventions'), interventionsController.updateComment);
router.post('/interventions/:id/media', auth.verifyToken, auth.checkRecordOwnership('interventions'), upload.any(), interventionsController.addMedia);
router.delete('/interventions/:id', auth.verifyToken, auth.checkRecordOwnership('interventions'), interventionsController.deleteIntervention);
router.patch('/interventions/:id/status', auth.verifyToken, auth.isAdmin, interventionsController.updateStatus);
router.put('/interventions/:id', auth.verifyToken, auth.checkRecordOwnership('interventions'), upload.any(), interventionsController.updateIntervention);

// Community interaction routes
router.get('/:reportType/:reportId/comments', auth.verifyToken, commentsController.getComments);
router.post('/:reportType/:reportId/comments', auth.verifyToken, commentsController.addComment);
router.delete('/comments/:commentId', auth.verifyToken, commentsController.deleteComment);

router.get('/:reportType/:reportId/upvotes', auth.verifyToken, upvotesController.getUpvotes);
router.post('/:reportType/:reportId/upvotes', auth.verifyToken, upvotesController.toggleUpvote);

export default router;
