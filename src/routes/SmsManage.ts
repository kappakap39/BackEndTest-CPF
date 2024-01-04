import express from 'express';
import { sentSms, getSmsByID, getSmsWithMessages } from '../controllers/authSMS';
const root = express.Router();

root.post('/sentSms', sentSms);
root.get('/getSmsByID', getSmsByID);
root.get('/getSmsWithMessages', getSmsWithMessages);

export default root;