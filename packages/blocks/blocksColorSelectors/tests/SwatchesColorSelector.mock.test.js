/*
  Copyright 2020 Lowdefy, Inc

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

import { runMockRenderTests } from '@lowdefy/block-tools';
import Enzyme, { mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { SwatchesPicker } from 'react-color';

Enzyme.configure({ adapter: new Adapter() });
import SwatchesColorSelector from '../src/blocks/SwatchesColorSelector/SwatchesColorSelector';
import examples from '../demo/examples/SwatchesColorSelector.yaml';
import meta from '../src/blocks/SwatchesColorSelector/SwatchesColorSelector.json';

jest.mock('react-color', () => {
  const selectors = {
    SwatchesPicker: jest.fn((props) => props.toString()),
  };
  return selectors;
});

const mocks = [
  {
    name: 'default',
    fn: SwatchesPicker,
  },
];

runMockRenderTests({ examples, Block: SwatchesColorSelector, meta, mocks, enzyme: { mount } });
