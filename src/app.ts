import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import errorHandler from './middleware/errorHandler';
import fourOhFour from './middleware/fourOhFour';
import user from './routes/user';
<<<<<<< HEAD
import Token from './routes/authToken';

=======
import order from './routes/Order';
import OrderShow from './routes/OrderShow';
import product from './routes/Product';
import ProductCategory from './routes/ProductCategory';
import Token from './routes/authToken';
import mail from './routes/authmail';
import File from './routes/authFile';
>>>>>>> 65905ce2decc89fbcad5bc52200cceb6e88540b0
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
<<<<<<< HEAD
app.use('/Token', Token);
=======
app.use('/order', order);
app.use('/OrderShow', OrderShow);
app.use('/product', product);
app.use('/ProductCategory', ProductCategory);
app.use('/Token', Token);
app.use('/mail', mail);
app.use('/File', File);
>>>>>>> 65905ce2decc89fbcad5bc52200cceb6e88540b0
// app.use('/', test);


// Apply error handling last
app.use(fourOhFour);
app.use(errorHandler);

export default app;