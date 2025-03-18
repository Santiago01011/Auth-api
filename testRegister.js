const fetch = require('node-fetch');

async function testRegister() {
  const response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'santiagozapata2002@gmail.com',
      password: 'password123',
      fullName: 'Santiago',
      redirectUrl: 'http://localhost:3000/verify',
    }),
  });

  const data = await response.json();
  console.log(data);
}

testRegister();