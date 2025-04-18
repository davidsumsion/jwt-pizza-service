const express = require('express');
const { authRouter, setAuthUser } = require('./routes/authRouter.js');
const orderRouter = require('./routes/orderRouter.js');
const franchiseRouter = require('./routes/franchiseRouter.js');
const version = require('./version.json');
const config = require('./config.js');
const metrics = require('./metrics.js')
const logger = require('./logger.js')
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
app.use(setAuthUser);
app.use(metrics.requestTracker);
app.use(metrics.timeTracker);
app.use(logger.httpLogger);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Too many requests from this IP, please try again after a minute.',
  standardHeaders: true,
  legacyHeaders: false,
});

const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again after 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(rateLimiter);


const apiRouter = express.Router();
app.use('/api', apiRouter);
apiRouter.use('/auth', authLimiter, authRouter);
apiRouter.use('/order', orderRouter);
apiRouter.use('/franchise', franchiseRouter);

apiRouter.use('/docs', (req, res) => {
  res.json({
    version: version.version,
    endpoints: [...authRouter.endpoints, ...orderRouter.endpoints, ...franchiseRouter.endpoints],
    config: { factory: config.factory.url, db: config.db.connection.host },
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'welcome to JWT Pizza',
    version: version.version,
  });
});

app.use('/error', (req, res) => {
  throw Error('TEST ERROR')
})

app.use('*', (req, res) => {
  res.status(404).json({
    message: 'unknown endpoint',
  });
});


// Default error handler for all exceptions and errors.
app.use((err, req, res, next) => {
  logger.log('error', 'system-fail', { message: err.message, stack: err.stack })
  res.status(err.statusCode ?? 500).json({ message: err.message, stack: err.stack });
  next();
});

const SIXTY_SECONDS = 60000
metrics.sendMetricsPeriodically(SIXTY_SECONDS)

module.exports = app;
