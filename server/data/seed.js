const mongoose = require('mongoose');
const Paper = require('../models/Paper');
require('dotenv').config();

const papers = [
  {
    title: "Electricity and Magnetism",
    course: "PHY 212",
    year: 2018,
    filePath: "./uploads/phyc212-2018-resit.pdf" 
  },
  {
    title: "Electricity and Magnetism",
    course: "PHY 212",
    year: 2020,
    filePath: "./uploads/phyc212-2020.pdf" 
  },
  {
    title: "Electricity and Magnetism",
    course: "PHY 212",
    year: 2018,
    filePath: "./uploads/phyc212-2018.pdf" 
  },
  {
    title: "Electricity and Magnetism",
    course: "PHY 212",
    year: 2019,
    filePath: "./uploads/phyc212-2019.pdf" 
  },
  {
    title: "Electricity and Magnetism",
    course: "PHY 212",
    year: 2016,
    filePath: "./uploads/phyc212-2016.pdf" 
  },
];

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://gakenge7_db_user:YIZhDrYhFEGm9Xgu@cluster0.nmooubb.mongodb.net/?appName=Cluster0")
  .then(async () => {
    console.log('Connected to DB. Seeding...');
    await Paper.deleteMany({}); // Clear existing
    await Paper.insertMany(papers);
    console.log('Data Seeded!');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });