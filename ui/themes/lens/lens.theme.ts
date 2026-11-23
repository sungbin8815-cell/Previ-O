// The lens theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in lens.settings.json and the generated lens.settings.ts;
// change them with `astryx experimental theme editor set lens ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {lensSettings} from './lens.settings';

export const lensTheme = defineTheme({
  extends: lensSettings,
  name: 'lens',
});
