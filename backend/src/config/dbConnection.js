let mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

exports.dbConnection = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  let DBURL = process.env.DBURL;

  try {
    const db = await mongoose.connect(DBURL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('mongodb connected');
  } catch (e) {
    console.log('mongodb is not connect error: ', e);
    throw e;
  }
};