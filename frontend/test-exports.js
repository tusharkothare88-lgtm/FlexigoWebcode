import * as CountUpMod from 'react-countup';
import CountUpDefault from 'react-countup';

console.log('Full module:', Object.keys(CountUpMod));
console.log('Default export type:', typeof CountUpDefault);
if (typeof CountUpDefault === 'object') {
  console.log('Default export keys:', Object.keys(CountUpDefault));
}
