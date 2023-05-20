var passworder = require('https://unpkg.com/browser-passworder@2.0.3/index.js');

var secrets = { coolStuff: 'all', ssn: 'livin large' };
var password = 'hunter55';

passworder
  .encrypt(password, secrets)
  .then(function (blob) {
    return passworder.decrypt(password, blob);
  })
  .then(function (result) {
    assert.deepEqual(result, secrets);
  });

//   unpkg.com/browser-passworder@v4.1.0/
