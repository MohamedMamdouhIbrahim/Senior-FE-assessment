import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  enableBarrelLess: true,

  modules: {
    'libs/<domain>/src/lib/data-access/models': [
      'domain:<domain>',
      'type:data-access-model',
    ],
    'libs/<domain>/src/lib/<type>': ['domain:<domain>', 'type:<type>'],
  },

  depRules: {
    // A domain can only depend on its own domain.
    'domain:*': ({ from, to }) => from === to,

    // Features can depend on data-access, UI, and utils.
    'type:feature': [
      'type:data-access',
      'type:data-access-model',
      'type:ui',
      'type:utils',
    ],

    // Data-access can depend on models and utils.
    'type:data-access': ['type:data-access-model', 'type:utils'],

    // UI can depend on utils and data-access models, but not stores.
    'type:ui': ['type:data-access-model', 'type:utils'],

    // Utils can use data-access models but not other architectural layers.
    'type:utils': 'type:data-access-model',

    // Models cannot depend on other architectural layers.
    'type:data-access-model': [],

    // Application shell can access domain features.

    root: '*',
    noTag: ['noTag', 'root'],
  },
};
