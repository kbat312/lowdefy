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

import path from 'path';
import { readFile } from '@lowdefy/node-utils';
import getLowdefyYaml from './getLowdefyYaml.js';

jest.mock('@lowdefy/node-utils', () => {
  const readFile = jest.fn();
  const writeFile = jest.fn();
  return {
    readFile,
    writeFile,
  };
});

beforeEach(() => {
  readFile.mockReset();
});

const configDirectory = process.cwd();

test('get version from yaml file', async () => {
  readFile.mockImplementation((filePath) => {
    if (filePath === path.resolve(process.cwd(), 'lowdefy.yaml')) {
      return `
      lowdefy: 1.0.0
      `;
    }
    return null;
  });
  const config = await getLowdefyYaml({ configDirectory });
  expect(config).toEqual({ lowdefyVersion: '1.0.0', cliConfig: {} });
});

test('get version from yaml file, config dir specified', async () => {
  readFile.mockImplementation((filePath) => {
    if (filePath === path.resolve(process.cwd(), 'configDir/lowdefy.yaml')) {
      return `
      lowdefy: 1.0.0
      `;
    }
    return null;
  });
  const config = await getLowdefyYaml({
    configDirectory: path.resolve(process.cwd(), './configDir'),
  });
  expect(config).toEqual({ lowdefyVersion: '1.0.0', cliConfig: {} });
});

test('could not find lowdefy.yaml in cwd', async () => {
  readFile.mockImplementation((filePath) => {
    if (
      filePath === path.resolve(process.cwd(), 'lowdefy.yaml') ||
      filePath === path.resolve(process.cwd(), 'lowdefy.yml')
    ) {
      return null;
    }
    return `
    lowdefy: 1.0.0
    `;
  });
  await expect(getLowdefyYaml({ configDirectory })).rejects.toThrow(
    'Could not find "lowdefy.yaml" file in specified config directory'
  );
});

test('could not find lowdefy.yaml in config dir', async () => {
  readFile.mockImplementation((filePath) => {
    if (
      filePath === path.resolve(process.cwd(), 'configDir/lowdefy.yaml') ||
      filePath === path.resolve(process.cwd(), 'configDir/lowdefy.yml')
    ) {
      return null;
    }
    return `
    lowdefy: 1.0.0
    `;
  });
  await expect(
    getLowdefyYaml({ configDirectory: path.resolve(process.cwd(), './configDir') })
  ).rejects.toThrow('Could not find "lowdefy.yaml" file in specified config directory');
});

test('lowdefy.yaml is invalid yaml', async () => {
  readFile.mockImplementation((filePath) => {
    if (filePath === path.resolve(process.cwd(), 'lowdefy.yaml')) {
      return `
      lowdefy: 1.0.0
        - a: a
        b: b
      `;
    }
    return null;
  });
  await expect(getLowdefyYaml({ configDirectory })).rejects.toThrow(
    'Could not parse "lowdefy.yaml" file. Received error '
  );
});

test('No version specified', async () => {
  readFile.mockImplementation((filePath) => {
    if (filePath === path.resolve(process.cwd(), 'lowdefy.yaml')) {
      return `
      pages:
        - id: page1
          type: Context
      `;
    }
    return null;
  });
  await expect(getLowdefyYaml({ configDirectory })).rejects.toThrow(
    'No version specified in "lowdefy.yaml" file. Specify a version in the "lowdefy" field.'
  );
});

test('Version is not a string', async () => {
  readFile.mockImplementation((filePath) => {
    if (filePath === path.resolve(process.cwd(), 'lowdefy.yaml')) {
      return `
      lowdefy: 1
      `;
    }
    return null;
  });
  await expect(getLowdefyYaml({ configDirectory })).rejects.toThrow(
    'Version number specified in "lowdefy.yaml" file is not valid. Received 1.'
  );
});

test('Version is not a valid version number', async () => {
  readFile.mockImplementation((filePath) => {
    if (filePath === path.resolve(process.cwd(), 'lowdefy.yaml')) {
      return `
      lowdefy: v1-0-3
      `;
    }
    return null;
  });
  await expect(getLowdefyYaml({ configDirectory })).rejects.toThrow(
    'Version number specified in "lowdefy.yaml" file is not valid. Received "v1-0-3".'
  );
});

test('get cliConfig', async () => {
  readFile.mockImplementation((filePath) => {
    if (filePath === path.resolve(process.cwd(), 'lowdefy.yaml')) {
      return `
      lowdefy: 1.0.0
      cli:
        disableTelemetry: true
        watch:
          - a
      `;
    }
    return null;
  });
  const config = await getLowdefyYaml({ configDirectory });
  expect(config).toEqual({
    lowdefyVersion: '1.0.0',
    cliConfig: { disableTelemetry: true, watch: ['a'] },
  });
});

test('could not find lowdefy.yaml in config dir, command is "init" or "clean-cache"', async () => {
  readFile.mockImplementation(() => null);
  let config = await getLowdefyYaml({ command: 'init', configDirectory });
  expect(config).toEqual({
    cliConfig: {},
  });
  config = await getLowdefyYaml({ command: 'clean-cache', configDirectory });
  expect(config).toEqual({
    cliConfig: {},
  });
});

test('support yml extension', async () => {
  readFile.mockImplementation((filePath) => {
    if (filePath === path.resolve(process.cwd(), 'lowdefy.yml')) {
      return `
      lowdefy: 1.0.0
      `;
    }
    return null;
  });
  const config = await getLowdefyYaml({ configDirectory });
  expect(config).toEqual({ lowdefyVersion: '1.0.0', cliConfig: {} });
});
