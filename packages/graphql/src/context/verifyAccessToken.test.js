/*
  Copyright 2020-2021 Lowdefy, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import cookie from 'cookie';
import verifyAccessToken from './verifyAccessToken';

import createTokenController from '../controllers/tokenController';
import { testBootstrapContext } from '../test/testContext';
import { AuthenticationError, TokenExpiredError } from '../context/errors';

const setHeader = jest.fn();
const getSecrets = () => ({ JWT_SECRET: 'JWT_SECRET' });

const mockLoadComponent = jest.fn();
const loaders = {
  component: {
    load: mockLoadComponent,
  },
};

const createCookieHeader = async ({ expired, customRoles } = {}) => {
  const tokenController = createTokenController({
    getSecrets,
    host: 'host',
    getLoader: () => ({
      load: () => ({
        ,
      }),
    }),
  });
  const accessToken = await tokenController.issueAccessToken({
    sub: 'sub',
    email: 'email',
    customRoles,
  });
  return cookie.serialize('authorization', accessToken, {
    httpOnly: true,
    path: '/api/graphql',
    sameSite: 'lax',
    secure: true,
  });
};

test('no cookie header', async () => {
  const bootstrapContext = testBootstrapContext({});
  const user = await verifyAccessToken(bootstrapContext);
  expect(user).toEqual({});
});

test('empty cookie header', async () => {
  let bootstrapContext = testBootstrapContext({ headers: { cookie: '' } });
  let user = await verifyAccessToken(bootstrapContext);
  expect(user).toEqual({});
  bootstrapContext = testBootstrapContext({ headers: { Cookie: '' } });
  user = await verifyAccessToken(bootstrapContext);
  expect(user).toEqual({});
  bootstrapContext = testBootstrapContext({ headers: { cookie: 'authorization=' } });
  user = await verifyAccessToken(bootstrapContext);
  expect(user).toEqual({});
  bootstrapContext = testBootstrapContext({ headers: { Cookie: 'authorization=' } });
  user = await verifyAccessToken(bootstrapContext);
  expect(user).toEqual({});
});

test('valid authorization cookie', async () => {
  mockLoadComponent.mockImplementation(() => ({}));
  const cookie = await createCookieHeader();
  let bootstrapContext = testBootstrapContext({
    headers: { cookie },
    getSecrets,
    loaders,
  });
  let res = await verifyAccessToken(bootstrapContext);
  expect(res).toEqual({ user: { sub: 'sub', email: 'email' }, roles: [] });
  bootstrapContext = testBootstrapContext({
    headers: { Cookie: cookie },
    getSecrets,
    loaders,
  });
  res = await verifyAccessToken(bootstrapContext);
  expect(res).toEqual({ user: { sub: 'sub', email: 'email' }, roles: [] });
});

test('valid authorization cookie with roles', async () => {
  mockLoadComponent.mockImplementation(() => ({
    auth: { openId: { rolesField: 'customRoles' } },
  }));
  const cookie = await createCookieHeader({ customRoles: ['role1', 'role2'] });
  let bootstrapContext = testBootstrapContext({
    headers: { cookie },
    getSecrets,
    loaders,
  });
  let res = await verifyAccessToken(bootstrapContext);
  expect(res).toEqual({
    user: { sub: 'sub', email: 'email', customRoles: ['role1', 'role2'] },
    roles: ['role1', 'role2'],
  });
  bootstrapContext = testBootstrapContext({
    headers: { Cookie: cookie },
    getSecrets,
    loaders,
  });
  res = await verifyAccessToken(bootstrapContext);
  expect(res).toEqual({
    user: { sub: 'sub', email: 'email', customRoles: ['role1', 'role2'] },
    roles: ['role1', 'role2'],
  });
});

test('invalid authorization cookie', async () => {
  let bootstrapContext = testBootstrapContext({
    headers: { cookie: 'authorization=invalid' },
    getSecrets,
    setHeader,
  });
  await expect(verifyAccessToken(bootstrapContext)).rejects.toThrow(AuthenticationError);
  expect(setHeader.mock.calls).toEqual([
    ['Set-Cookie', 'authorization=; Max-Age=0; Path=/api/graphql; HttpOnly; Secure; SameSite=Lax'],
  ]);
  await expect(verifyAccessToken(bootstrapContext)).rejects.toThrow('Invalid token.');
});

test('expired token', async () => {
  const cookie = await createCookieHeader({ expired: true });

  let bootstrapContext = testBootstrapContext({
    headers: { cookie },
    getSecrets,
    setHeader,
  });
  await expect(verifyAccessToken(bootstrapContext)).rejects.toThrow(TokenExpiredError);
  expect(setHeader.mock.calls).toEqual([
    ['Set-Cookie', 'authorization=; Max-Age=0; Path=/api/graphql; HttpOnly; Secure; SameSite=Lax'],
  ]);
  await expect(verifyAccessToken(bootstrapContext)).rejects.toThrow('Token expired.');
});

test('development header', async () => {
  let bootstrapContext = testBootstrapContext({
    headers: { cookie: 'authorization=invalid' },
    getSecrets,
    setHeader,
    development: true,
  });
  await expect(verifyAccessToken(bootstrapContext)).rejects.toThrow(AuthenticationError);
  expect(setHeader.mock.calls).toEqual([
    ['Set-Cookie', 'authorization=; Max-Age=0; Path=/api/graphql; HttpOnly; SameSite=Lax'],
  ]);
});

test('configure gqlUri', async () => {
  const cookie = await createCookieHeader({ expired: true });

  let bootstrapContext = testBootstrapContext({
    headers: { cookie },
    getSecrets,
    gqlUri: '/custom/graphql',
    setHeader,
  });
  await expect(verifyAccessToken(bootstrapContext)).rejects.toThrow(TokenExpiredError);
  expect(setHeader.mock.calls).toEqual([
    [
      'Set-Cookie',
      'authorization=; Max-Age=0; Path=/custom/graphql; HttpOnly; Secure; SameSite=Lax',
    ],
  ]);
  await expect(verifyAccessToken(bootstrapContext)).rejects.toThrow('Token expired.');
});
