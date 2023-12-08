import express from 'express';
import { CheckValidate, CheckInput } from '../middleware/UserLogin/Validate'
const middle = express.Router();

middle.get('/CheckUser', CheckInput, CheckValidate);

export default middle;