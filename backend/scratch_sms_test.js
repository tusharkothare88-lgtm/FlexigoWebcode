import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function checkBalance() {
  const url = 'https://cloud.smsindiahub.in/vendorsms/CheckBalance.aspx';
  try {
    const params = {
      user: process.env.SMSINDIAHUB_USERNAME,
      password: process.env.SMSINDIAHUB_API_KEY, // SMSIndiaHub sometimes uses password or APIKey as the password parameter
    };
    console.log('Checking with password/APIKey:', params);
    const res = await axios.get(url, { params });
    console.log('Balance check result:', res.data);
  } catch (err) {
    console.error('Balance check error:', err.message);
  }

  try {
    const params = {
      user: process.env.SMSINDIAHUB_USERNAME,
      APIKey: process.env.SMSINDIAHUB_API_KEY,
    };
    console.log('Checking with APIKey parameter:', params);
    const res = await axios.get(url, { params });
    console.log('Balance check result:', res.data);
  } catch (err) {
    console.error('Balance check error:', err.message);
  }
}

checkBalance();
