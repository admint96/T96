// config.js

const LOCAL_API = 'http://192.168.243.226:5000'; // Local network
const PROD_API = 'https://apps-j0w2.onrender.com'; // Deployed on Render

// 🚀 Change this flag to switch API quickly
const useLocal = true;

export const API_URL = useLocal ? LOCAL_API : PROD_API;
