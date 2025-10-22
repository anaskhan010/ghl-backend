const express = require('express');
const db = require('./Config/DBConnection');
const dotenv = require('dotenv');
const cors = require('cors');
const studyRoutes = require('./Routes/StudyRoutes/StudyRoutes');

dotenv.config({ path: './Config/config.env' });


const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionSuccessStatus: 204,
};


const app = express();
app.use(cors(corsOptions));



app.use(express.json());
app.use('/api/study', studyRoutes);





app.listen(process.env.PORT,async() => {
  console.log(`Example app listening at PORT: ${process.env.PORT}`);

  try {
    const connection = await db.getConnection();
    console.log('Connected to database');
    connection.release();
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
});
