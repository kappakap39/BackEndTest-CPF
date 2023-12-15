import express from 'express';
import { UpFile } from '../controllers/authFileController';
import {authToken} from '../middleware/authUser';
const file = express.Router();

file.post('/UpFile', UpFile);

export default file;