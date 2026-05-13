const cloudinary = require('cloudinary').v2;

// Manually setting the new credentials provided by the user
const cloud_name = 'dyssvgdoa';
const api_key = '939451977515645';
const api_secret = '6xsRe4TinVPOVGsQXcuKBz13Tvg';

cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret
});

console.log('Testing Cloudinary with NEW credentials:');
console.log('Cloud Name:', cloud_name);
console.log('API Key:', api_key);
console.log('API Secret:', api_secret);

cloudinary.api.resources({ max_results: 1 })
  .then(result => {
    console.log('SUCCESS: Connected to Cloudinary! Credentials are valid.');
    console.log('Sample Resource:', result.resources[0] ? result.resources[0].public_id : 'No resources found but connection ok');
    process.exit(0);
  })
  .catch(error => {
    console.error('FAILURE: Cloudinary Test Failed:');
    console.error(error.message);
    process.exit(1);
  });
