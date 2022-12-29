const fs = require('fs-extra');
const path = require('path');
const child_process = require('child_process');

const gomobile_ipfs = path.resolve('gomobile-ipfs');
const stdio = 'inherit';
const hash = '2886338061a15b31275ebec97b8f08281b0477d3';
const android_ndk_version = '25.1.8937393';

child_process.execSync(
  'git clone https://github.com/ipfs-shipyard/gomobile-ipfs',
  { stdio }
);

child_process.execSync(`git reset --hard ${hash}`, {
  stdio,
  cwd: gomobile_ipfs,
});

const sources = path.resolve(
  gomobile_ipfs,
  'ios',
  'Bridge',
  'GomobileIPFS',
  'Sources'
);
const sources_to = path.resolve('ios', 'Sources');

if (fs.existsSync(sources_to)) fs.removeSync(sources_to, { recursive: true });

fs.copySync(sources, sources_to);

child_process.execSync(
  [
    // TODO: You must have go installed.
    'export GOPATH="$HOME/go"',
    'export PATH="$PATH:$GOPATH/bin"',
    // TODO: Determine this dynamically.
    `export ANDROID_NDK_HOME="$ANDROID_NDK_HOME/${android_ndk_version}"`,
    // TODO: You must have the JRE installed.
    'make build_core.android',
    'make build_core.ios',
  ].join('\n'),
  { stdio, cwd: gomobile_ipfs }
);

const xcframework = path.resolve(
  gomobile_ipfs,
  'build',
  'ios',
  'intermediates',
  'core',
  'Core.xcframework'
);

const xcframework_to = path.resolve('ios', 'Core.xcframework');

if (fs.existsSync(xcframework_to))
  fs.removeSync(xcframework_to, { recursive: true });

fs.copySync(xcframework, xcframework_to, { dereference: true });

// Remove version duplicates.
['ios-arm64', 'ios-arm64_x86_64-simulator'].forEach((name) =>
  fs.removeSync(
    path.resolve(xcframework_to, name, 'Core.framework', 'Versions'),
    { recursive: true }
  )
);

const libs = path.resolve('android', 'libs');

if (fs.existsSync(libs)) fs.removeSync(libs, { recursive: true });

fs.mkdirsSync(libs);

const aar = path.resolve(
  gomobile_ipfs,
  'build',
  'android',
  'intermediates',
  'core',
  'core.aar'
);

const aar_to = path.resolve(libs, 'core.aar');

fs.copySync(aar, aar_to);

child_process.execSync(`unzip core.aar`, { stdio, cwd: libs });

fs.removeSync(aar_to, { recursive: true });

// HACK: Remove some of the supported platforms from the .aar to reduce the binary size:
const platforms_to_remove = ['x86', 'x86_64'];

platforms_to_remove
  .map((e) => path.resolve(libs, 'jni', e))
  .forEach((e) => fs.removeSync(e, { recursive: true }));

const filesToZip = fs.readdirSync(libs);

child_process.execSync(`zip -r9 core.aar ${filesToZip.join(' ')}`, {
  stdio,
  cwd: libs,
});

filesToZip.forEach((file) =>
  fs.removeSync(path.resolve(libs, file), { recursive: true })
);

const bridge = path.resolve(
  gomobile_ipfs,
  'android',
  'bridge',
  'src',
  'main',
  'java',
  'ipfs'
);
const bridge_to = path.resolve('android', 'src', 'main', 'java', 'ipfs');

if (fs.existsSync(bridge_to)) fs.removeSync(bridge_to, { recursive: true });

fs.copySync(bridge, bridge_to);

const android_hack = path.resolve(
  bridge_to,
  'gomobile',
  'android',
  'IPFS.java'
);

fs.writeFileSync(
  android_hack,
  fs
    .readFileSync(android_hack, 'utf-8')
    .split('\n')
    .flatMap((str) => {
      // HACK: Enable external access to the `node` instance so that we can
      //       call `serveTCPGateway` for parity with iOS.
      if (str.trim() === 'private Node node;') {
        return ['public Node node;'];
      }
      return [str];
    })
    .join('\n')
);
