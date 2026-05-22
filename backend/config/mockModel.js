import { getMockData, saveMockData } from './db.js';

class MockModelInstance {
  constructor(collectionName, data) {
    this._collectionName = collectionName;
    Object.assign(this, data);
  }

  async save() {
    const dbData = getMockData();
    const collection = dbData[this._collectionName] || [];
    const index = collection.findIndex(item => item._id === this._id);
    
    // Copy properties, exclude private tracker field
    const dataToSave = {};
    for (const key of Object.keys(this)) {
      if (key !== '_collectionName') {
        dataToSave[key] = this[key];
      }
    }
    
    if (index >= 0) {
      collection[index] = dataToSave;
    } else {
      if (!dataToSave._id) {
        dataToSave._id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      }
      if (!dataToSave.createdAt) {
        dataToSave.createdAt = new Date().toISOString();
      }
      dataToSave.updatedAt = new Date().toISOString();
      collection.push(dataToSave);
    }
    
    dbData[this._collectionName] = collection;
    saveMockData(dbData);
    return this;
  }
}

export function createMockModel(collectionName) {
  return class MockModel {
    static _collection = collectionName;

    static match(item, query) {
      if (!query || Object.keys(query).length === 0) return true;
      return Object.entries(query).every(([key, val]) => {
        if (val && typeof val === 'object') {
          if (val.$in) {
            return Array.isArray(val.$in) && val.$in.includes(item[key]);
          }
          if (val.$ne) {
            return item[key] !== val.$ne;
          }
          // Simple support for other operators
          return true;
        }
        return item[key] === val;
      });
    }

    static async find(query = {}) {
      const dbData = getMockData();
      const items = dbData[this._collection] || [];
      const filtered = items.filter(item => this.match(item, query));
      return filtered.map(item => new MockModelInstance(this._collection, item));
    }

    static async findOne(query = {}) {
      const results = await this.find(query);
      return results[0] || null;
    }

    static async findById(id) {
      return this.findOne({ _id: id });
    }

    static async create(data) {
      const dbData = getMockData();
      const items = dbData[this._collection] || [];
      const docs = Array.isArray(data) ? data : [data];
      const createdDocs = [];

      for (const doc of docs) {
        const newDoc = {
          _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...doc
        };
        items.push(newDoc);
        createdDocs.push(new MockModelInstance(this._collection, newDoc));
      }

      dbData[this._collection] = items;
      saveMockData(dbData);
      return Array.isArray(data) ? createdDocs : createdDocs[0];
    }

    static async findByIdAndUpdate(id, update, options = {}) {
      const dbData = getMockData();
      const items = dbData[this._collection] || [];
      const index = items.findIndex(item => item._id === id);
      if (index === -1) return null;

      const current = items[index];
      
      // Support basic $set and $push operators, or normal objects
      let updated = { ...current };
      if (update.$set) {
        updated = { ...updated, ...update.$set };
      } else if (update.$push) {
        // e.g. { $push: { searchKeywords: '...' } }
        for (const [key, val] of Object.entries(update.$push)) {
          if (!Array.isArray(updated[key])) {
            updated[key] = [];
          }
          updated[key].push(val);
        }
      } else {
        updated = { ...updated, ...update };
      }
      
      updated.updatedAt = new Date().toISOString();

      items[index] = updated;
      dbData[this._collection] = items;
      saveMockData(dbData);

      return new MockModelInstance(this._collection, updated);
    }

    static async updateOne(query, update) {
      const doc = await this.findOne(query);
      if (!doc) return { nModified: 0 };
      await this.findByIdAndUpdate(doc._id, update);
      return { nModified: 1 };
    }

    static async deleteMany(query = {}) {
      const dbData = getMockData();
      const items = dbData[this._collection] || [];
      const keep = items.filter(item => !this.match(item, query));
      const deletedCount = items.length - keep.length;
      dbData[this._collection] = keep;
      saveMockData(dbData);
      return { deletedCount };
    }
  };
}
export { MockModelInstance };
