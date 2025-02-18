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

import getFieldValues from '../src/getFieldValues.js';

test('single object', () => {
  expect(getFieldValues('_req', { _req: 1 })).toEqual([1]);
});

test('multiple objects', () => {
  expect(getFieldValues('_req', { _req: 1 }, { _req: 2 }, { _req: 1 }, { _req: 4 })).toEqual([
    1, 2, 4,
  ]);
});

test('multiple arrays', () => {
  expect(
    getFieldValues('_req', [{ _req: 1 }], [{ _req: 2 }], [{ _req: 1 }], [{ _req: 4 }])
  ).toEqual([1, 2, 4]);
});

test('multiple mixed', () => {
  expect(getFieldValues('_req', [{ _req: 1 }], { _req: 2 }, { _req: 1 }, [{ _req: 4 }])).toEqual([
    1, 2, 4,
  ]);
});

test('get on object of operator', () => {
  const data = {
    a: '1',
    defaultValue: { _request: 'a' },
  };
  expect(getFieldValues('defaultValue', data)).toEqual([{ _request: 'a' }]);
});
