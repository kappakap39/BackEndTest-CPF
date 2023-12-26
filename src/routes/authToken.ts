import express from 'express';
<<<<<<< HEAD
import {AddToken, Logout, TokenUser } from '../controllers/authTokenController'
=======
import {Login, Logout, TokenUser } from '../controllers/authTokenController'
>>>>>>> 65905ce2decc89fbcad5bc52200cceb6e88540b0
import {authToken, UserToken} from '../middleware/authUser';
const middle = express.Router();

middle.post('/LoginUser', Login);
// middle.post('/LoginUser', authToken, AddToken);
middle.post('/Logout', authToken, Logout);
middle.get('/TokenUser', UserToken, TokenUser);

export default middle;