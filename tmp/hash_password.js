const bcrypt = require('bcryptjs');
const password = 'banana123';
bcrypt.hash(password, 10).then(hash => {
    console.log(hash);
});
