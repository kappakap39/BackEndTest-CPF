import express from 'express';
import { sentSms } from '../controllers/authSMS';
const root = express.Router();

root.post('/sentSms', sentSms);

export default root;