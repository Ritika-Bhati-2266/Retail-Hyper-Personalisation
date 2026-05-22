import { dbState } from './db.js';
import { createMockModel } from './mockModel.js';

export function createModelProxy(collectionName, mongooseModel) {
  // Lazily create the mock model
  let MockModel = null;
  
  const getActiveModel = () => {
    if (dbState.isMock) {
      if (!MockModel) {
        MockModel = createMockModel(collectionName);
      }
      return MockModel;
    }
    return mongooseModel;
  };

  return new Proxy(class {}, {
    // Handle static method calls and properties
    get(target, prop) {
      const activeModel = getActiveModel();
      const val = activeModel[prop];
      if (typeof val === 'function') {
        return val.bind(activeModel);
      }
      return val;
    },
    // Handle instantiation: new User(...)
    construct(target, args) {
      const activeModel = getActiveModel();
      return Reflect.construct(activeModel, args);
    }
  });
}
