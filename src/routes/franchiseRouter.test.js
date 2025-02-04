const request = require('supertest');
const app = require('../service');
const db = require('../database/database')

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const defaultAdmin = { email: 'a@jwt.com', password: 'admin', name: '常用名字' };
let defaultAdminAuthToken;

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

beforeAll(async () => {
  const loginRes = await request(app).put('/api/auth').send(defaultAdmin);
  defaultAdminAuthToken = loginRes.body.token;
});

const testFranchise = {
    "stores": [],
    "id": "",
    "name": "newFranchise1234",
    "admins": []
}

test('make a franchises while not Admin', async () => {
    const makeReq = await request(app).post('/api/franchise').send(testFranchise);
    expect(makeReq.status).toBe(401);
    expect(makeReq.body.message).toBe('unauthorized');
});

test('make a franchise while Admin', async () => {
    //create a user
    testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    testFranchise.admins.push({email: testUser.email});
    testFranchise.name = Math.random().toString(36).substring(2, 12)
    const makeReq = await request(app).post('/api/franchise').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(testFranchise);
    expect(makeReq.status).toBe(200);
    expect(makeReq.body.admins[0].email).toEqual(testUser.email);
    expect(makeReq.body.admins[0].name).toEqual(testUser.name);
})

test('create a store', async () => {
    
});
