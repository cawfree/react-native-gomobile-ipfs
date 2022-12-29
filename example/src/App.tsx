import * as React from 'react';
import axios from 'axios';

import { StyleSheet, View } from 'react-native';

import { start, getIpfsUri } from 'react-native-gomobile-ipfs';

export default function App() {
  React.useEffect(
    () =>
      void (async () => {
        try {
          const { stop, port } = await start();

          const uri = getIpfsUri({ port });
          const four_bytes = `/ipfs/bafybeicsj2jntw5nf4ld23czky3ydhpivphgivcgcxegzbqpdxrhbgfu3y/4bytes`;
          const bytecode = `${four_bytes}/f78d1c6a`;

          const [{ data: helloWorlds }] = await Promise.all([
            axios({
              url: `${uri}/cat?arg=QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx`,
              method: 'post',
            }),
          ]);

          console.warn(helloWorlds);

          const [
            {
              data: { Path: resolvedHash },
            },
          ] = await Promise.all([
            axios({
              url: `${uri}/resolve?arg=${bytecode}&recursive=true&dht-timeout=0`,
              method: 'post',
            }),
          ]);

          console.warn(resolvedHash);

          const { data: signature } = await axios({
            url: `${uri}/cat?arg=${resolvedHash}`,
            method: 'post',
          });

          console.warn(signature);

          await stop();
        } catch (e) {
          console.error(e);
        }
      })(),
    []
  );

  return <View style={[StyleSheet.absoluteFill, styles.white]} />;
}

const styles = StyleSheet.create({
  white: {
    backgroundColor: 'white',
  },
});
