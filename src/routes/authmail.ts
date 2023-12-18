import express from 'express';
import { SentMail, VerifyAddToken } from '../controllers/authmailController'
import {authToken, authTokenOTP} from '../middleware/authUser';
import { AddToken } from '../controllers/authTokenController'

const mail = express.Router();

// mail.post('/SentMail', authTokenOTP, SentMail);
mail.post('/SentMail', SentMail);
mail.post('/VerifyAddToken', VerifyAddToken);

export default mail;