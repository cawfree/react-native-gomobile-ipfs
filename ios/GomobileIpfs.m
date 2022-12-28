#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GomobileIpfs, NSObject)

RCT_EXTERN_METHOD(start:(NSDictionary*)params
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stop:(NSDictionary*)params
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
