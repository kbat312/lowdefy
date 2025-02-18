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

import testContext from '../testContext.js';

const lowdefy = {};

const RealDate = Date;
const mockDate = jest.fn(() => ({ date: 0 }));
mockDate.now = jest.fn(() => 0);

// Comment out to use console
console.log = () => {};
console.error = () => {};

beforeAll(() => {
  global.Date = mockDate;
});

afterAll(() => {
  global.Date = RealDate;
});

test('CallMethod with no args, synchronous method', async () => {
  const blockMethod = jest.fn((...args) => ({ args }));
  const rootBlock = {
    id: 'block:root:root:0',
    blockId: 'root',
    meta: {
      category: 'container',
    },
    areas: {
      content: {
        blocks: [
          {
            id: 'block:root:textInput:0',
            blockId: 'textInput',
            type: 'TextInput',
            meta: {
              category: 'input',
              valueType: 'string',
            },
          },
          {
            id: 'block:root:button:0',
            blockId: 'button',
            type: 'Button',
            meta: {
              category: 'display',
              valueType: 'string',
            },
            events: {
              onClick: [
                {
                  id: 'a',
                  type: 'CallMethod',
                  params: { blockId: 'textInput', method: 'blockMethod' },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
    initState: { textInput: 'init' },
  });
  const button = context._internal.RootBlocks.map['block:root:button:0'];
  const textInput = context._internal.RootBlocks.map['block:root:textInput:0'];

  textInput.registerMethod('blockMethod', blockMethod);
  const res = await button.triggerEvent({ name: 'onClick' });
  expect(res).toEqual({
    blockId: 'button',
    bounced: false,
    event: undefined,
    eventName: 'onClick',
    responses: {
      a: {
        type: 'CallMethod',
        index: 0,
        response: {
          args: [],
        },
      },
    },
    success: true,
    startTimestamp: { date: 0 },
    endTimestamp: { date: 0 },
  });
  expect(blockMethod.mock.calls).toEqual([[]]);
});

test('CallMethod method return a promise', async () => {
  const timeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const calls = [];
  const blockMethod = async (...args) => {
    calls.push(args);
    await timeout(300);
    return { args };
  };
  const rootBlock = {
    id: 'block:root:root:0',
    blockId: 'root',
    meta: {
      category: 'container',
    },
    areas: {
      content: {
        blocks: [
          {
            id: 'block:root:textInput:0',
            blockId: 'textInput',
            type: 'TextInput',
            meta: {
              category: 'input',
              valueType: 'string',
            },
          },
          {
            id: 'block:root:button:0',
            blockId: 'button',
            type: 'Button',
            meta: {
              category: 'display',
              valueType: 'string',
            },
            events: {
              onClick: [
                {
                  id: 'a',
                  type: 'CallMethod',
                  params: { blockId: 'textInput', method: 'blockMethod', args: ['arg'] },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
    initState: { textInput: 'init' },
  });
  const button = context._internal.RootBlocks.map['block:root:button:0'];
  const textInput = context._internal.RootBlocks.map['block:root:textInput:0'];

  textInput.registerMethod('blockMethod', blockMethod);
  const res = await button.triggerEvent({ name: 'onClick' });
  expect(res).toEqual({
    blockId: 'button',
    bounced: false,
    event: undefined,
    eventName: 'onClick',
    responses: {
      a: {
        type: 'CallMethod',
        index: 0,
        response: {
          args: ['arg'],
        },
      },
    },
    success: true,
    startTimestamp: { date: 0 },
    endTimestamp: { date: 0 },
  });
  expect(calls).toEqual([['arg']]);
});

test('CallMethod with args not an array', async () => {
  const blockMethod = jest.fn((...args) => ({ args }));
  const rootBlock = {
    id: 'block:root:root:0',
    blockId: 'root',
    meta: {
      category: 'container',
    },
    areas: {
      content: {
        blocks: [
          {
            id: 'block:root:textInput:0',
            blockId: 'textInput',
            type: 'TextInput',
            meta: {
              category: 'input',
              valueType: 'string',
            },
          },
          {
            id: 'block:root:button:0',
            blockId: 'button',
            type: 'Button',
            meta: {
              category: 'display',
              valueType: 'string',
            },
            events: {
              onClick: [
                {
                  id: 'a',
                  type: 'CallMethod',
                  params: { blockId: 'textInput', method: 'blockMethod', args: 'arg' },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
    initState: { textInput: 'init' },
  });
  const button = context._internal.RootBlocks.map['block:root:button:0'];
  const textInput = context._internal.RootBlocks.map['block:root:textInput:0'];

  textInput.registerMethod('blockMethod', blockMethod);
  const res = await button.triggerEvent({ name: 'onClick' });
  expect(res).toEqual({
    blockId: 'button',
    bounced: false,
    event: undefined,
    eventName: 'onClick',
    error: {
      action: {
        id: 'a',
        params: {
          args: 'arg',
          blockId: 'textInput',
          method: 'blockMethod',
        },
        type: 'CallMethod',
      },
      error: {
        error: new Error(
          'Failed to call method "blockMethod" on block "textInput": "args" should be an array. Received "{"blockId":"textInput","method":"blockMethod","args":"arg"}".'
        ),
        index: 0,
        type: 'CallMethod',
      },
    },
    responses: {
      a: {
        type: 'CallMethod',
        index: 0,
        error: new Error(
          'Failed to call method "blockMethod" on block "textInput": "args" should be an array. Received "{"blockId":"textInput","method":"blockMethod","args":"arg"}".'
        ),
      },
    },
    success: false,
    startTimestamp: { date: 0 },
    endTimestamp: { date: 0 },
  });
  expect(blockMethod.mock.calls).toEqual([]);
});

test('CallMethod with multiple positional args, synchronous method', async () => {
  const blockMethod = jest.fn((...args) => ({ args }));
  const rootBlock = {
    id: 'block:root:root:0',
    blockId: 'root',
    meta: {
      category: 'container',
    },
    areas: {
      content: {
        blocks: [
          {
            id: 'block:root:textInput:0',
            blockId: 'textInput',
            type: 'TextInput',
            meta: {
              category: 'input',
              valueType: 'string',
            },
          },
          {
            id: 'block:root:button:0',
            blockId: 'button',
            type: 'Button',
            meta: {
              category: 'display',
              valueType: 'string',
            },
            events: {
              onClick: [
                {
                  id: 'a',
                  type: 'CallMethod',
                  params: { blockId: 'textInput', method: 'blockMethod', args: ['arg1', 'arg2'] },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
    initState: { textInput: 'init' },
  });
  const button = context._internal.RootBlocks.map['block:root:button:0'];
  const textInput = context._internal.RootBlocks.map['block:root:textInput:0'];

  textInput.registerMethod('blockMethod', blockMethod);
  const res = await button.triggerEvent({ name: 'onClick' });
  expect(res).toEqual({
    blockId: 'button',
    bounced: false,
    event: undefined,
    eventName: 'onClick',
    responses: {
      a: {
        type: 'CallMethod',
        index: 0,
        response: {
          args: ['arg1', 'arg2'],
        },
      },
    },
    success: true,
    startTimestamp: { date: 0 },
    endTimestamp: { date: 0 },
  });
  expect(blockMethod.mock.calls).toEqual([['arg1', 'arg2']]);
});

test('CallMethod of block in array by explicit id', async () => {
  const blockMethod0 = jest.fn((...args) => ({ args }));
  const blockMethod1 = jest.fn((...args) => ({ args }));
  const rootBlock = {
    id: 'block:root:root:0',
    blockId: 'root',
    meta: {
      category: 'container',
    },
    areas: {
      content: {
        blocks: [
          {
            id: 'block:root:list:0',
            blockId: 'list',
            type: 'List',
            meta: {
              category: 'list',
              valueType: 'array',
            },
            areas: {
              content: {
                blocks: [
                  {
                    id: 'block:root:list.$.textInput:0',
                    blockId: 'list.$.textInput',
                    type: 'TextInput',
                    defaultValue: '123',
                    meta: {
                      category: 'input',
                      valueType: 'string',
                    },
                  },
                ],
              },
            },
          },
          {
            id: 'block:root:button:0',
            blockId: 'button',
            type: 'Button',
            meta: {
              category: 'display',
              valueType: 'string',
            },
            events: {
              onClick: [
                {
                  id: 'a',
                  type: 'CallMethod',
                  params: { blockId: 'list.0.textInput', method: 'blockMethod', args: ['arg'] },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
    initState: { list: [{ textInput: '0' }, { textInput: '1' }] },
  });

  const button = context._internal.RootBlocks.map['block:root:button:0'];
  const textInput0 = context._internal.RootBlocks.map['block:root:list.0.textInput:0'];
  const textInput1 = context._internal.RootBlocks.map['block:root:list.1.textInput:0'];

  textInput0.registerMethod('blockMethod', blockMethod0);
  textInput1.registerMethod('blockMethod', blockMethod1);
  await button.triggerEvent({ name: 'onClick' });
  expect(blockMethod0.mock.calls).toEqual([['arg']]);
  expect(blockMethod1.mock.calls).toEqual([]);
});

test('CallMethod of block in array by block with same indices and id pattern', async () => {
  const blockMethod0 = jest.fn((...args) => ({ args }));
  const blockMethod1 = jest.fn((...args) => ({ args }));
  const rootBlock = {
    id: 'block:root:root:0',
    blockId: 'root',
    meta: {
      category: 'container',
    },
    areas: {
      content: {
        blocks: [
          {
            id: 'block:root:list:0',
            blockId: 'list',
            type: 'List',
            meta: {
              category: 'list',
              valueType: 'array',
            },
            areas: {
              content: {
                blocks: [
                  {
                    id: 'block:root:list.$.textInput:0',
                    blockId: 'list.$.textInput',
                    type: 'TextInput',
                    defaultValue: '123',
                    meta: {
                      category: 'input',
                      valueType: 'string',
                    },
                  },
                  {
                    id: 'block:root:list.$.button:0',
                    blockId: 'list.$.button',
                    type: 'Button',
                    meta: {
                      category: 'display',
                      valueType: 'string',
                    },
                    events: {
                      onClick: [
                        {
                          id: 'a',
                          type: 'CallMethod',
                          params: {
                            blockId: 'list.$.textInput',
                            method: 'blockMethod',
                            args: ['arg'],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
    initState: { list: [{ textInput: '0' }, { textInput: '1' }] },
  });

  const textInput0 = context._internal.RootBlocks.map['block:root:list.0.textInput:0'];
  const textInput1 = context._internal.RootBlocks.map['block:root:list.1.textInput:0'];
  const button0 = context._internal.RootBlocks.map['block:root:list.0.button:0'];
  const button1 = context._internal.RootBlocks.map['block:root:list.1.button:0'];

  textInput0.registerMethod('blockMethod', blockMethod0);
  textInput1.registerMethod('blockMethod', blockMethod1);
  await button1.triggerEvent({ name: 'onClick' });
  expect(blockMethod0.mock.calls).toEqual([]);
  expect(blockMethod1.mock.calls).toEqual([['arg']]);

  await button0.triggerEvent({ name: 'onClick' });
  expect(blockMethod0.mock.calls).toEqual([['arg']]);
  expect(blockMethod1.mock.calls).toEqual([['arg']]);
});

test('CallMethod with method does not exist', async () => {
  const blockMethod = jest.fn((...args) => ({ args }));
  const rootBlock = {
    id: 'block:root:root:0',
    blockId: 'root',
    meta: {
      category: 'container',
    },
    areas: {
      content: {
        blocks: [
          {
            id: 'block:root:textInput:0',
            blockId: 'textInput',
            type: 'TextInput',
            meta: {
              category: 'input',
              valueType: 'string',
            },
          },
          {
            id: 'block:root:button:0',
            blockId: 'button',
            type: 'Button',
            meta: {
              category: 'display',
              valueType: 'string',
            },
            events: {
              onClick: [
                {
                  id: 'a',
                  type: 'CallMethod',
                  params: { blockId: 'textInput', method: 'no-method' },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
    initState: { textInput: 'init' },
  });
  const button = context._internal.RootBlocks.map['block:root:button:0'];

  const res = await button.triggerEvent({ name: 'onClick' });
  expect(res).toEqual({
    blockId: 'button',
    bounced: false,
    event: undefined,
    eventName: 'onClick',
    error: {
      action: {
        id: 'a',
        params: {
          blockId: 'textInput',
          method: 'no-method',
        },
        type: 'CallMethod',
      },
      error: {
        error: new Error(
          'Failed to call method "no-method" on block "textInput". Check if "no-method" is a valid block method for block "textInput". Received "{"blockId":"textInput","method":"no-method"}".'
        ),
        index: 0,
        type: 'CallMethod',
      },
    },
    responses: {
      a: {
        type: 'CallMethod',
        index: 0,
        error: new Error(
          'Failed to call method "no-method" on block "textInput". Check if "no-method" is a valid block method for block "textInput". Received "{"blockId":"textInput","method":"no-method"}".'
        ),
      },
    },
    success: false,
    startTimestamp: { date: 0 },
    endTimestamp: { date: 0 },
  });
  expect(blockMethod.mock.calls).toEqual([]);
});
