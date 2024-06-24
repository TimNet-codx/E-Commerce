// For Database configuration
require('dotenv').config();

// Why we use the below is order to avoid using try {} catch(error){} in all our controller, hence it will add it to all our controller automatically
require('express-async-errors');

// Express
const express = require('express');
const app = express();

// Rest of the packages
  // It is use for login middleware
  const morgan = require('morgan');
  
  const cookiesParser = require('cookie-parser');
  const fileUpload = require('express-fileupload');
  const rateLimiter = require('express-rate-limit');
  const helmet = require('helmet');
  const xss = require('xss-clean');
  const cors = require('cors');
  const mongoSanitize = require('express-mongo-sanitize');


// Database
const connectDB = require('./db/connect');

// routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter =  require('./routes/reviewRoutes');
const orderRouter =  require('./routes/orderRoutes');



// middleware 
const notFoundMiddleware = require('./middleware/not-found');
const errorHanderMiddleware = require('./middleware/error-handler');

app.set('trust proxy');
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(morgan('tiny'));
// To Have Access to Middleware
app.use(express.json());

app.use(cookiesParser(process.env.JWT_SECRET));

app.use(express.static('./public'));

app.use(fileUpload());


app.get('/', (req, res) => {
   res.send('E-Commerce API')
});

app.get('/api/v1', (req, res) => {
  // console.log(req.cookies);
  console.log(req.signedCookies);
  res.send('e-commerce api');
});

app.use('/api/v1/auth', authRouter);  
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);



app.use(notFoundMiddleware);
app.use(errorHanderMiddleware);


//console.log('E-Commerce API');
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

