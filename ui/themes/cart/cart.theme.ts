// The cart theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in cart.settings.json and the generated cart.settings.ts;
// change them with `astryx experimental theme editor set cart ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {cartSettings} from './cart.settings';

export const cartTheme = defineTheme({
  extends: cartSettings,
  name: 'cart',
});
