const request = require('supertest');
const app = require('../service');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
});

test('login w/ correct credentials', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
});

//login multiple times

// test('login w/ incorrect credentials', async () => { -- without password
//     testUser.password = null;
//     const loginRes = await request(app).put('/api/auth').send(testUser);
//     // expect(loginRes.status).not.toBe(200);
//     // expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
  
//     const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
//     expect(loginRes.body.user).not.toMatchObject(user);
//   });

test('Register', async () => {
    const user = { name: 'pizza diner', email: 'reg@test.com' , password: 'a' };
    user.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(user);
    expect(registerRes.status).toBe(200);
    // expect(registerRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
  
    // const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
    // expect(loginRes.body.user).toMatchObject(user);
});

test('Register without password', async () => {
    const user = { name: 'pizza diner', email: 'reg@test.com'};
    user.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(user);
    expect(registerRes.status).toBe(400);
});