const { Storage } = require('@google-cloud/storage');
const path = require('path');

// 🔐 Load credentials and config from environment
const projectId = process.env.GCS_PROJECT_ID;
const bucketName = process.env.GCS_BUCKET_NAME;
const keyFilename = path.resolve(process.env.GCS_KEYFILE);

// ☁️ Initialize GCS client
const storage = new Storage({ projectId, keyFilename });
const bucket = storage.bucket(bucketName);

// ✅ Export bucket for use in upload routes
module.exports = bucket;