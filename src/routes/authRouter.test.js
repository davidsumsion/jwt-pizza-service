const request = require('supertest');
const app = require('../service');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const testUser2 = { name: 'testUser2', email: 'something@gmail.com', password: 'a' };
let testUserAuthToken;

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;

  testUser2.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes2 = await request(app).post('/api/auth').send(testUser2);
  testUserAuthToken2 = registerRes2.body.token;
});

test('login w/ correct credentials', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
});

// test('login w/ correct credentials consecutive times', async () => {
//   const loginRes = await request(app).put('/api/auth').send(testUser2);
//   expect(loginRes.status).toBe(200);
//   const loginResAgain = await request(app).put('/api/auth').send(testUser2);
//   expect(loginResAgain.status).toBe(500);
//   expect(loginResAgain.body.message).toMatch(/^Duplicate entry '[^']+' for key 'auth.PRIMARY'$/)
// });


test('login w/ incorrect credentials', async () => { //without password
    testUser.password = null;
    const loginRes = await request(app).put('/api/auth').send(testUser);
    const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
    expect(loginRes.status).toBe(500);
    expect(loginRes.body.message).toBe('data and hash arguments required');
  });

test('Register', async () => {
    const user = { name: 'pizza diner', email: 'reg@test.com' , password: 'a' };
    user.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(user);
    expect(registerRes.status).toBe(200);
    expect(registerRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
  
    const { password, ...userRes } = { ...user, roles: [{ role: 'diner' }] };
    expect(userRes).toMatchObject({email: user.email, name: user.name});
});

test('Register without password', async () => {
    const user = { name: 'pizza diner', email: 'reg@test.com'};
    user.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(user);
    expect(registerRes.status).toBe(400);
});

test('logout', async () => {
  const logoutRes = await request(app).delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`);
  expect(logoutRes.status).toBe(200);
  expect(logoutRes.body.message).toBe('logout successful');  
})
