const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
// const defaultAdmin = { email: 'a@jwt.com', password: 'admin', name: '常用名字' };
let testUserId;

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }

let defaultAdminAuthToken;
let defaultAdmin  = {}
async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  user = await DB.addUser(user);
  return { ...user, password: 'toomanysecrets' };
}

beforeAll(async () => {
    const user = await createAdminUser();
    console.log('USER, PASSWORD', user);
    const loginRes = await request(app).put('/api/auth').send(user);
    console.log("LOGGED IN ADMIN:", loginRes.body);
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
    const email = Math.random().toString(36).substring(2, 12) + '@test.com'
    const makeReq = await createFranchise(email);
    expect(makeReq.status).toBe(200);
    expect(makeReq.body.admins[0].email).toEqual(testUser.email);
    expect(makeReq.body.admins[0].name).toEqual(testUser.name);
})

test('create a store', async () => {
    const email = Math.random().toString(36).substring(2, 12) + '@test.com'
    const makeReq = await createFranchise(email);
    expect(makeReq.status).toBe(200);
    const newStoreReq = await createStore(makeReq);
    expect(newStoreReq.status).toBe(200);
    expect(newStoreReq.body.franchiseId).toEqual(makeReq.body.id);
});

test('delete a store', async () => {
    const email = Math.random().toString(36).substring(2, 12) + '@test.com'
    const makeReq = await createFranchise(email);
    expect(makeReq.status).toBe(200);
    const newStoreReq = await createStore(makeReq);
    expect(newStoreReq.status).toBe(200);
    const deleteStoreReq = await request(app).delete('/api/franchise/' + makeReq.body.id + '/store/' + newStoreReq.body.franchiseId).set('Authorization', `Bearer ${defaultAdminAuthToken}`)
    expect(deleteStoreReq.body.message).toEqual('store deleted');
})

// test('delete a store that doesn\'t exist', async () => {
//     const makeReq = await createFranchise();
//     expect(makeReq.status).toBe(200);
//     const newStoreReq = await createStore(makeReq);
//     expect(newStoreReq.status).toBe(200);
//     const deleteStoreReq = await request(app).delete('/api/franchise/' + "oneTwoThree" + '/store/' + 50000).set('Authorization', `Bearer ${defaultAdminAuthToken}`)
//     expect(deleteStoreReq.body.message).toEqual('store deleted');
// })

test('delete a franchise', async () => {
    const email = Math.random().toString(36).substring(2, 12) + '@test.com'
    const makeReq = await createFranchise(email);
    expect(makeReq.status).toBe(200);
    const deleteFranchiseReq = await request(app).delete('/api/franchise/' + makeReq.body.id).set('Authorization', `Bearer ${defaultAdminAuthToken}`)
    expect(deleteFranchiseReq.body.message).toEqual('franchise deleted');
})

test('get user franchises', async () => {
    const email = Math.random().toString(36).substring(2, 12) + '@test.com'
    testUser.email = email;

    const registerRes = await request(app).post('/api/auth').send(testUser);
    expect(registerRes.status).toBe(200);

    const userId = registerRes.body.user.id;
    const testFranchise1 = { "stores": [], "id": "", "name": Math.random().toString(36).substring(2, 12), "admins": [{email: email}] }
    const testFranchise2 = { "stores": [], "id": "", "name": Math.random().toString(36).substring(2, 12), "admins": [{email: email}] }
    const fran1Req = await request(app).post('/api/franchise').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(testFranchise1);
    const fran2Req = await request(app).post('/api/franchise').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(testFranchise2);
    expect(fran1Req.status).toBe(200);
    expect(fran2Req.status).toBe(200);

    const getUserFranchiseReq = await request(app).get('/api/franchise/' + userId).set('Authorization', `Bearer ${defaultAdminAuthToken}`);
    expect(getUserFranchiseReq.body.length).toBe(2);
})

async function createFranchise(email) {
    testUser.email = email;
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    testFranchise.admins.push({email: testUser.email});
    testFranchise.name = Math.random().toString(36).substring(2, 12)
    return await request(app).post('/api/franchise').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(testFranchise);
}

async function createStore(makeReq) {
    const newStore = {"franchiseId": makeReq.body.id, "name":Math.random().toString(36).substring(2, 12)}
    return await request(app).post('/api/franchise/' + makeReq.body.id + '/store').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(newStore);
}