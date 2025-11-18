// Load environment variables FIRST before any other imports
const dotenv = require('dotenv');
dotenv.config({ path: './Config/config.env' });

// Now import other modules
const express = require('express');
const db = require('./Config/DBConnection');
const cors = require('cors');
const studyRoutes = require('./Routes/StudyRoutes/StudyRoutes');
const patientRoutes = require('./Routes/PatientRoutes/patientRoutes');
const medicineDiagnoseRoutes = require('./Routes/MedicineDiagnoseRoute/MedicineDiagnoseRoute');


const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://ghlbackend.research-hero.com','https://ghlstudies.research-hero.com','https://ghlpatient.research-hero.com','https://ghldashboard.research-hero.com', 'https://ghlmedicinediagnosis.research-hero.com'],
  credentials: true,
  optionSuccessStatus: 204,
};


const app = express();
app.use(cors(corsOptions));

// Serve static files from public folder
app.use('/public', express.static('public'));

app.use(express.json());
app.use('/api/study', studyRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/medicine-diagnose', medicineDiagnoseRoutes);





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
