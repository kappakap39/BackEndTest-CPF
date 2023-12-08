import express from 'express';
import { CheckValidate, CheckInput } from '../controllers/UserLogin/Validate'
import { AddToken } from '../controllers/UserLogin/Token'
const middle = express.Router();

middle.post('/CheckUser', CheckInput, CheckValidate, AddToken);

export default middle;