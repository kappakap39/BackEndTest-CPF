import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import errorHandler from './middleware/errorHandler';
import fourOhFour from './middleware/fourOhFour';
import user from './routes/user';
import UserOrAdmin from './routes/UserOrAdmin';
import Token from './routes/authToken';
import mail from './routes/authmail';
import File from './routes/authFile';
import test from './routes/People';
import Sms from './routes/SmsManage';
import multer from 'multer';

const app = express();

// Apply most middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        // @ts-ignore
        origin: config.clientOrigins[config.nodeEnv],
    }),
);
app.use(helmet());
app.use(morgan('tiny'));

// Apply routes before error handling
app.use('/user', user);
app.use('/UserOrAdmin', UserOrAdmin);
app.use('/Token', Token);
app.use('/mail', mail);
app.use('/File', File);
app.use('/test', test);
app.use('/Sms', Sms);
// app.use('/', test);


// Apply error handling last
app.use(fourOhFour);
app.use(errorHandler);

export default app;