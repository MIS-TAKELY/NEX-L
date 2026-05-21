const https = require('https');

const url = "https://res.cloudinary.com/dzvq7ccgr/image/upload/v1779128366/nexl-courses/yqkdjutr8psob8sovoi4.pdf";

https.get(url, (res) => {
  console.log('PDF Status:', res.statusCode);
});

const urlJpg = "https://res.cloudinary.com/dzvq7ccgr/image/upload/v1779128366/nexl-courses/yqkdjutr8psob8sovoi4.jpg";
https.get(urlJpg, (res) => {
  console.log('JPG Status:', res.statusCode);
});
