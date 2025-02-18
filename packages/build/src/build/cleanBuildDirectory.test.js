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

jest.mock('@lowdefy/node-utils', () => {
  return {
    cleanDirectory: jest.fn(),
  };
});

test('cleanOutputDirectory calls cleanDirectory', async () => {
  const nodeUtils = await import('@lowdefy/node-utils');
  const cleanBuildDirectory = await import('./cleanBuildDirectory.js');
  const context = {
    directories: {
      build: 'buildDirectory',
    },
  };
  await cleanBuildDirectory.default({ context });
  expect(nodeUtils.cleanDirectory.mock.calls).toEqual([['buildDirectory']]);
});
