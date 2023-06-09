const fs = require('fs');

class JsonDatabase {
  constructor(filename) {
    this.filename = filename;
    this.data = [];
    this.load();
  }

  load() {
    try {
      const fileData = fs.readFileSync(this.filename, 'utf-8');
      this.data = JSON.parse(fileData);
    } catch (error) {
      console.error('Error loading JSON database:', error);
      this.data = [];
    }
  }

  save() {
    try {
      const jsonData = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(this.filename, jsonData, 'utf-8');
      console.log('JSON database saved successfully');
    } catch (error) {
      console.error('Error saving JSON database:', error);
    }
  }

  getAll() {
    return this.data;
  }

  getById(id) {
    return this.data.find(item => item.id === id);
  }

  create(record) {
    const newId = this.generateId();
    const newRecord = { id: newId, ...record };
    this.data.push(newRecord);
    this.save();
    return newRecord;
  }

  update(id, updatedFields) {
    const record = this.getById(id);
    if (record) {
      Object.assign(record, updatedFields);
      this.save();
      return record;
    }
    return null;
  }

  delete(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedRecord = this.data.splice(index, 1)[0];
      this.save();
      return deletedRecord;
    }
    return null;
  }

  generateId() {
    const ids = this.data.map(item => item.id);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return maxId + 1;
  }
}

module.exports = JsonDatabase;
