import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import errorHandler from './middleware/errorHandler';
import fourOhFour from './middleware/fourOhFour';
import test from './routes/test';
import user from './routes/user';
import order from './routes/Order';
import OrderShow from './routes/OrderShow';
import product from './routes/Product';
import ProductCategory from './routes/ProductCategory';

import { exampleMiddleware } from './middleware/Test/MiddlewareTest';
import { PeopleMd } from './middleware/Test/PeopleSS';

import { CheckValidate, CheckInput } from './middleware/UserLogin/Validate'
import UserMD from './routes/Middlewere';


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
app.use('/test', test);
app.use('/user', user);
app.use('/order', order);
app.use('/OrderShow', OrderShow);
app.use('/product', product);
app.use('/ProductCategory', ProductCategory);
app.use('/UserMD', UserMD);
// app.use('/', test);

//!middleware People
app.use(exampleMiddleware);
app.use(PeopleMd);

//!middleware User
app.use(CheckValidate);
app.use(CheckInput);

// Apply error handling last
app.use(fourOhFour);
app.use(errorHandler);

export default app;