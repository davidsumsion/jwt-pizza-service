const request = require('supertest');
const app = require('../service');
const {DB} = require('../database/database')
// const { createFranchise } = require('./franchiseRouter.test')
const {Role} = require('../model/model')

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const admin = { email: 'a@jwt.com', password: 'admin', name: '常用名字' };
// const defaultAdmin = { email: 'a@jwt.com', password: 'admin', name: '常用名字' };
// const admin = {name: 'fake test admin', email: 'fakeAdmin@jwt.com', password: 'a', roles: [{ role: Role.Admin }]}
let defaultAdminAuthToken;
let testUserId;

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

const testFranchise = {
    "stores": [],
    "id": "",
    "name": "newFranchise1234",
    "admins": []
}

beforeAll(async () => {
//   defaultAdminAuthToken = loginRes.body.token;
    // admin.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    // const registerRes = await request(app).post('/api/auth').send(admin);
    // DB.addUser(admin);
    const loginRes = await request(app).put('/api/auth').send(admin);
    console.log(loginRes.body)
    defaultAdminAuthToken = loginRes.body.token;
});

test('add an item to the menu', async () => {
    const item = { "title":'myItem' + Math.random().toString(36).substring(2, 12), "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }
    const addItemReq = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(item);
    expect(addItemReq.status).toBe(200);
    let isSuccessful = false
    addItemReq.body.forEach(dbItem => {
        if (dbItem.title === item.title) isSuccessful = true
    });
    expect(isSuccessful).toBe(true);
});

test('create an Order', async () => {
    // create a franchise
    testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com'
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    testFranchise.admins.push({email: testUser.email});
    testFranchise.name = Math.random().toString(36).substring(2, 12)
    const makeReq = await request(app).post('/api/franchise').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(testFranchise);
    expect(makeReq.status).toBe(200);

    // create a store
    const newStore = {"franchiseId": makeReq.body.id, "name":Math.random().toString(36).substring(2, 12)}
    const newStoreReq = await request(app).post('/api/franchise/' + makeReq.body.id + '/store').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(newStore);
    expect(newStoreReq.status).toBe(200);

    // create an item
    const item = { "title":'myItem' + Math.random().toString(36).substring(2, 12), "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }
    const addItemReq = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(item);
    expect(addItemReq.status).toBe(200);

    const orderMetaData = {"franchiseId": makeReq.body.id, "storeId":newStoreReq.body.franchiseId, "items":[{ "menuId": 1, ...item}]}
    const orderReq = await request(app).post('/api/order').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(orderMetaData);
    expect(addItemReq.status).toBe(200);
})