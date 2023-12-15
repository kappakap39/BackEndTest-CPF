import express from 'express';
import {AddToken, Logout } from '../controllers/authTokenController'
import {authToken} from '../middleware/authUser';
const middle = express.Router();

middle.post('/LoginUser', AddToken);
// middle.post('/LoginUser', authToken, AddToken);
middle.post('/Logout', authToken, Logout);

export default middle;