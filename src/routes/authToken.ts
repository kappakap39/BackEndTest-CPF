import express from 'express';
import {AddToken, Logout } from '../controllers/authTokenController'
import {authToken} from '../middleware/authUser';
const middle = express.Router();

// middle.post('/CheckUser', AddToken);
middle.post('/CheckUser', authToken, AddToken);
middle.post('/Logout', authToken, Logout);

export default middle;