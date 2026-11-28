// The well theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in well.settings.json and the generated well.settings.ts;
// change them with `astryx experimental theme editor set well ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {wellSettings} from './well.settings';

export const wellTheme = defineTheme({
  extends: wellSettings,
  name: 'well',
});
