package com.gomobileipfs;

import android.app.Activity;
import android.content.Context;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import ipfs.gomobile.android.IPFS;

@ReactModule(name = GomobileIpfsModule.NAME)
public class GomobileIpfsModule extends ReactContextBaseJavaModule {

  private interface RunnableWithException {
    void run() throws Exception;
  }

  public static final String NAME = "GomobileIpfs";

  private static Map<String, IPFS> INSTANCES = new HashMap();

  private static ExecutorService EXECUTOR = Executors.newFixedThreadPool(1);

  private static final Integer getPort(final ReadableMap pReadableMap) {
    return new Integer((int)pReadableMap.getDouble("port"));
  }

  private static final String getKey(final Integer port) {
    return port.toString();
  }

  public GomobileIpfsModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  private static final void shouldStopIpfs(
    final Integer port
  ) throws IPFS.NodeStopException {
    final String key = getKey(port);

    final IPFS maybeIpfs = INSTANCES.get(key);

    if (maybeIpfs == null) return;

    maybeIpfs.stop();

    INSTANCES.remove(key);
  }

  private static final void shouldStartIpfs(
    final Context pContext,
    final Integer port,
    final String repoPath
  ) throws Exception {
    final String key = getKey(port);

    GomobileIpfsModule.shouldStopIpfs(port);

    IPFS ipfs = new IPFS(pContext, repoPath);

    ipfs.start();
    ipfs.node.serveTCPGateway(key, false);

    INSTANCES.put(key, ipfs);
  }

  private static final void resolveOrReject(
    final Activity pActivity,
    final Promise pPromise,
    final RunnableWithException pRunnable
  ) {
    EXECUTOR.execute(() -> {
      try {
        pRunnable.run();
        pActivity.runOnUiThread(() -> pPromise.resolve(0));
      } catch (Exception e) {
        e.printStackTrace();
        pActivity.runOnUiThread(() -> pPromise.reject(e));
      }
    });
  }

  @ReactMethod
  public void start(
    final ReadableMap pParams,
    final Promise pPromise
  ) {
    resolveOrReject(
      getCurrentActivity(),
      pPromise,
      () -> {
        final String repo_path = pParams.getString("repo_path");
        shouldStartIpfs(getReactApplicationContext(), getPort(pParams), repo_path);
      }
    );
  }

  @ReactMethod
  public void stop(
    final ReadableMap pParams,
    final Promise pPromise
  ) {
    resolveOrReject(
      getCurrentActivity(),
      pPromise,
      () -> shouldStopIpfs(getPort(pParams))
    );
  }

}
