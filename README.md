# react-native-gomobile-ipfs

Access to the [__Interplanetary File System (IPFS)__](https://ipfs.tech/) for [__React Native__](https://reactnative.dev) apps _without_ depending upon trusted third parties.

Enables self-sovereign access to decentralized file systems for cross-platform applications. The property of decentralization is critical for [__dApps__](https://ethereum.org/en/dapps/); where data verifiability, integrity and availability are of paramount importance; usually in applications which deal with censorship-resistance or demand reliable [__off-chain storage__](https://ethereum.org/en/developers/docs/storage/).

> ℹ️ This project is a hard fork of [`tesseract-one/react-native-gomobile-ipfs`](https://github.com/tesseract-one/react-native-gomobile-ipfs) 💕

[`react-native-gomobile-ipfs`](https://github.com/cawfree-react-native-ipfs) works by launching a dedicated [__Kubo RPC API v0__](https://docs.ipfs.tech/reference/kubo/rpc/) which can be easily accessed at runtime via traditional networking libraries such as [`axios`](https://github.com/axios/axios).

### 🚀 Getting Started

You can install [`react-native-gomobile-ipfs`](https://github.com/cawfree/react-native-gomobile-ipfs) using [__Yarn__](https://yarnpkg.com/):

```shell
yarn add react-native-gomobile-ipfs
```

### ✏️ Usage

In this module, `import`ing [`react-native-gomobile-ipfs`](https://github.com/cawfree/react-native-gomobile-ipfs) exports a `start()` function, which allows the app to launch a localhost [__API__](https://docs.ipfs.tech/reference/kubo/rpc/). In the example below, we show how to [`cat`](https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-cat) the [`hello worlds`](https://blog.ipfs.io/0-hello-worlds/) tutorial hash:

```typescript
import { start, getIpfsUri } from 'react-native-gomobile-ipfs';
import axios from 'axios';

const { stop } = await start();

const uri = getIpfsUri(); // i.e. "http://localhost:5001/api/v0"

const {data: result} = await axios({
  url: `${uri}/cat?arg=QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx`,
  method: 'post',
});

console.log(result); // "hello, worlds"

await stop();
```

By calling `getIpfsUri()`, we can determine the platform-specific `localhost` URI of our IPFS API. Once finished, we safely `close()` the resource to terminate the server.

For further demonstration, please check out the [__Example App__](./example/src/App.tsx).

### 📲 Running on Expo

1. You can install to your project using `npx expo install react-native-gomobile-ipfs`.
2. Next, you'll need to add the Helios plugin to your Expo config (`app.json`, `app.config.json` or `app.config.js`):

```diff
{
  "expo": {
    "name": "my-app",
+   "plugins": [
+     "react-native-gomobile-ipfs"
+   ]
  }
}
```
3. Once that's done, use `npx expo prebuild` to generate Expo-friendly native binaries.
4. Finally, run `eas build` to build a new binary, or use `yarn ios` or `yarn android` to start running.

> Note:
> To run `eas build`, you'll need to `npm install --global expo-cli eas-cli`.

### 🏗 Building from Source

To build from source for Android and iOS, you'll need the following tools installed:
- [__Go__](https://go.dev/doc/install)
- [__Android SDK__](https://developer.android.com/sdk) & [__Android NDK__](https://developer.android.com/ndk) & [__Java SE__](https://www.oracle.com/uk/java/technologies/downloads/)

> ⚠️ Currently the build process is only supported on Apple Silicon.

With these installed, run `yarn gomobileup` from the project root to [__generate the native binaries__](./scripts/gomobileup.js) and link the example application.


### ✌️ License

[__MIT__](./LICENSE)
