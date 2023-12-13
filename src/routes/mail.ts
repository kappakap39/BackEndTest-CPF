import express from 'express';
import { SentMail } from '../controllers/mailController'
const mail = express.Router();

mail.post('/SentMail', SentMail);

export default mail;