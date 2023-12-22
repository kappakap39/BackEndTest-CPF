import express from 'express';
import {AddToken, Logout, TokenUser } from '../controllers/authTokenController'
import {authToken, UserToken} from '../middleware/authUser';
const middle = express.Router();

middle.post('/LoginUser', AddToken);
// middle.post('/LoginUser', authToken, AddToken);
middle.post('/Logout', authToken, Logout);
middle.get('/TokenUser', UserToken, TokenUser);

export default middle;