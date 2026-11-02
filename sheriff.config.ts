import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  enableBarrelLess: true,

  modules: {
    'libs/<domain>/src/lib/<type>': ['domain:<domain>', 'type:<type>'],
  },

  depRules: {
    // A domain can only depend on its own domain.
    'domain:*': ({ from, to }) => from === to,

    // Features can depend on data-access, UI, and utils.
    'type:feature': ['type:data-access', 'type:ui', 'type:utils'],

    // Data-access can depend on utils only.
    'type:data-access': 'type:utils',

    // UI can depend on utils only.
    'type:ui': 'type:utils',

    // Utils cannot depend on other architectural layers.
    'type:utils': [],

    // Application shell can access domain features.

    root: '*',
    noTag: ['noTag', 'root'],
  },
};
