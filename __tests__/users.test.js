const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const mockUser = { email: 'test@example.com', password: '123456' };

const registerAndLogin = async (userProps = {}) => {
  const agent = request.agent(app);
  const user = await UserService.create({ ...mockUser, ...userProps });
  const { email } = user;
  const password = userProps.password ?? mockUser.password;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('signs up a new user with mock data', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);

    expect(res.body).toEqual({
      id: expect.any(String),
      email: 'test@example.com',
    });
  });

  it('signs in an existing user', async () => {
    //can't figure out how to test this one until I add delete session
    const [agent] = await registerAndLogin();
    const res = await agent.delete('/api/v1/users/sessions');
    expect(res.status).toBe(200);

    const { email, password } = mockUser;

    const resp = await agent
      .post('/api/v1/users/sessions')
      .send({ email, password });
    expect(resp.status).toBe(200);
  });

  it('returns the current user if they are logged in', async () => {
    const [agent, user] = await registerAndLogin();
    console.log(agent);
    const me = await agent.get('/api/v1/users/me');
    expect(me.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('errors if the user is not logged in', async () => {
    const me = await request(app).get('/api/v1/users/me');
    expect(me.status).toEqual(401);
  });

  it('deletes the session for a user', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.delete('/api/v1/users/sessions');
    expect(res.status).toBe(200);
  });

  afterAll(() => {
    pool.end();
  });
});
