const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const templateRoot = path.resolve(__dirname, '../..');

const compile = (relativePath) => {
  const filename = path.join(templateRoot, relativePath);

  return babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false,
    configFile: false,
    filename,
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-typescript',
        {
          allExtensions: true,
          isTSX: true,
        },
      ],
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
  }).code;
};

const runtimeDependencies = (compiledCode) =>
  Array.from(compiledCode.matchAll(/require\(["']([^"']+)["']\)/g), (match) =>
    match[1],
  );

describe('web module boundaries', () => {
  test('SDK method events do not load the DeviceConfigure React component', () => {
    const dependencies = runtimeDependencies(
      compile('src/utils/SdkMethodEvents.ts'),
    );

    expect(dependencies).not.toContain('../components/DeviceConfigure');
  });

  test('customization app state delegates core hook creation to a leaf module', () => {
    const dependencies = runtimeDependencies(
      compile('customization-api/app-state.ts'),
    );

    expect(dependencies).not.toContain('../agora-rn-uikit');
    expect(dependencies).toContain('./core-contexts');
  });

  test.each([
    'src/app-state/useLocalUserInfo.ts',
    'src/subComponents/recording/useRecording.tsx',
    'src/components/chat-messages/useChatMessages.tsx',
    'src/components/useUserPreference.tsx',
  ])('%s does not load the public customization API barrel', (filename) => {
    const dependencies = runtimeDependencies(compile(filename));

    expect(dependencies).not.toContain('customization-api');
  });

  test.each([
    [
      'src/components/meeting-info/useMeetingInfo.tsx',
      '../../../customization-implementation/createHook',
    ],
    [
      'src/subComponents/recording/useRecording.tsx',
      '../../../customization-implementation/createHook',
    ],
    [
      'src/components/chat-ui/useChatUIControl.tsx',
      '../../../customization-implementation/createHook',
    ],
    [
      'src/components/chat-notification/useChatNotification.tsx',
      '../../../customization-implementation/createHook',
    ],
    [
      'src/components/chat-messages/useChatMessages.tsx',
      '../../../customization-implementation/createHook',
    ],
    [
      'src/components/useUserPreference.tsx',
      '../../customization-implementation/createHook',
    ],
    [
      'src/utils/useLayout.tsx',
      '../../customization-implementation/createHook',
    ],
    [
      'src/utils/useSidePanel.tsx',
      '../../customization-implementation/createHook',
    ],
  ])(
    '%s imports createHook without loading the customization implementation barrel',
    (filename, createHookPath) => {
      const dependencies = runtimeDependencies(compile(filename));

      expect(dependencies).not.toContain('customization-implementation');
      expect(dependencies).toContain(createHookPath);
    },
  );

});
