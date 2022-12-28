import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-gomobile-ipfs' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const GomobileIpfs = NativeModules.GomobileIpfs
  ? NativeModules.GomobileIpfs
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export type StartCallbackParams = {
  readonly repo_path: string;
  readonly port: number;
};

export type StopCallback = () => Promise<void>;

export type StartCallbackResult = StartCallbackParams & {
  readonly stop: StopCallback;
};

export type StartCallback = (
  params?: Partial<StartCallbackParams>
) => Promise<StartCallbackResult>;

export const sanitizeParams = (
  params?: Partial<StartCallbackParams>
): StartCallbackParams => ({
  repo_path: params?.repo_path ?? 'ipfs/repo',
  port: params?.port ?? 5001,
});

export const getIpfsUri = (
  maybeParams: Partial<StartCallbackParams> = {}
): string => {
  const { port } = sanitizeParams(maybeParams);
  return `http://${
    Platform.OS === 'android' ? 'localhost' : '127.0.0.1'
  }:${port}/api/v0`;
};

export const start: StartCallback = async (
  maybeParams: Partial<StartCallbackParams> = {}
): Promise<StartCallbackResult> => {
  const params = sanitizeParams(maybeParams);
  const { port } = params;

  await GomobileIpfs.start(params);

  const stop: StopCallback = async (): Promise<void> => {
    await GomobileIpfs.stop({ port });
  };

  return { ...params, stop };
};
