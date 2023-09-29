const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const errorHandler = require('./middlewares/error-handler');

const { PORT = 3000, DB_CONN = 'mongodb://127.0.0.1:27017/bitfilmsdb' } =
  process.env;

const app = express();
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://kinoblojer.nomoredomainsicu.ru',
      'https://kinoblojer.nomoredomainsicu.ru',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

async function main() {
  await mongoose.connect(DB_CONN, {
    useNewUrlParser: true,
  });

  app.listen(PORT, () => {
    console.log(`Port ${PORT}`);
  });
}

app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
main();
