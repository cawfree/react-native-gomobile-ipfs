@objc(GomobileIpfs)
class GomobileIpfs: NSObject {
    
  var INSTANCES = [String: IPFS]();
    
  let DISPATCH_QUEUE = DispatchQueue(label: "io.github.cawfree.react-native-gomobile-ipfs", qos: .background, attributes: .concurrent)
    
  private func getPort(pDictionary: NSDictionary) -> Int {
    return Int(pDictionary["port"] as! Double);
  }
  
  private func getKey(pPort: Int) -> String {
     return String(pPort);
  }
    
  private func shouldStopIpfs(pPort: Int) throws {
    let key = getKey(pPort: pPort);
    let maybeNode = INSTANCES[key];
      
    if (maybeNode == nil) {
      return;
    }
      
    try maybeNode!.stop();
    
    INSTANCES.removeValue(forKey: key);
  }
    
  private func shouldStartIpfs(pPort: Int, pRepoPath: String) throws {
    try shouldStopIpfs(pPort: pPort);
      
    let key = getKey(pPort: pPort);
    
    let node = try IPFS(pRepoPath);
      
    try node.start();
      
    try node.serveAPI(onTCPPort: key);
      
    INSTANCES[key] = node;
  }
  
  func resolveOrReject(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock,
    runnable: @escaping () throws -> Any?
  ) {
    DISPATCH_QUEUE.async {
      do {
        try runnable();
        DispatchQueue.main.async { resolve(0); }
      } catch let error as NSError {
        DispatchQueue.main.async {
          reject("\(error.code)", error.userInfo.description, error);
        }
      }
    }
  }

  @objc(start:resolve:reject:)
  public func start(
    params: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let port = getPort(pDictionary: params);
    let repo_path = params["repo_path"] as! String;
      
    resolveOrReject(resolve: resolve, reject: reject) {
      try self.shouldStartIpfs(pPort: port, pRepoPath: repo_path);
    }
  }
    
  @objc(stop:resolve:reject:)
  public func stop(
    params: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let port = getPort(pDictionary: params);
    
    resolveOrReject(resolve: resolve, reject: reject) {
      try self.shouldStopIpfs(pPort: port);
    }
  }
    
}
