/**
 * Database name and version for IndexedDB
 */
const DB_NAME = 'WolfNotesDB';
const DB_VERSION = 3;

/**
 * Database helper class for managing IndexedDB operations
 */
class DBHelper {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  /**
   * Initialize the IndexedDB database
   * @returns {Promise} resolves when database is ready
   */
  async init() {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }
    
    // Return immediately if already initialized
    if (this.db) {
      return Promise.resolve(this.db);
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('noteMetadata')) {
          const notesStore = db.createObjectStore('noteMetadata', { keyPath: 'id' });
          notesStore.createIndex('classID', 'classID', { unique: false });
          console.log('Created noteMetadata store');
        }

        // Pending uploads store (notes created while offline)
        if (!db.objectStoreNames.contains('pendingUploads')) {
          db.createObjectStore('pendingUploads', { 
            keyPath: 'tempId', 
            autoIncrement: true 
          });
        }

        if (!db.objectStoreNames.contains('classes')) {
          db.createObjectStore('classes', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('classStudents')) {
          db.createObjectStore('classStudents', { keyPath: 'classID' });
        }

        if (!db.objectStoreNames.contains('userProfile')) {
          db.createObjectStore('userProfile', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('authors')) {
          db.createObjectStore('authors', { keyPath: 'id' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Ensure database is initialized before any operation
   */
  async ensureInitialized() {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Save note metadata to IndexedDB
   * @param {Object} note note metadata object
   * @returns {Promise} resolves when saved
   */
  async saveNoteMetadata(note) {
    await this.ensureInitialized();
    const transaction = this.db.transaction(['noteMetadata'], 'readwrite');
    const store = transaction.objectStore('noteMetadata');
    
    return new Promise((resolve, reject) => {
      const request = store.put(note);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save multiple notes to IndexedDB
   * @param {Array} notes array of note metadata objects
   * @returns {Promise} resolves when all saved
   */
  async saveMultipleNotes(notes) {
    await this.ensureInitialized();
    const transaction = this.db.transaction(['noteMetadata'], 'readwrite');
    const store = transaction.objectStore('noteMetadata');
    
    return new Promise((resolve, reject) => {
      notes.forEach(note => store.put(note));
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get all notes for a specific class
   * @param {string} classID class identifier
   * @returns {Promise<Array>} array of note metadata objects
   */
  async getNotesByClass(classID) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['noteMetadata'], 'readonly');
      const store = transaction.objectStore('noteMetadata');
      const index = store.index('classID');
      const request = index.getAll(classID);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all notes from IndexedDB
   * @returns {Promise<Array>} array of all note metadata objects
   */
  async getAllNotes() {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['noteMetadata'], 'readonly');
      const store = transaction.objectStore('noteMetadata');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add a pending upload to IndexedDB (for offline note creation)
   * @param {Object} noteData note metadata (title, classID, tags)
   * @param {Blob} fileBlob the PDF/image file blob
   * @returns {Promise} resolves with tempId
   */
  async addPendingUpload(noteData, fileBlob) {
    await this.ensureInitialized();
    const transaction = this.db.transaction(['pendingUploads'], 'readwrite');
    const store = transaction.objectStore('pendingUploads');
    
    return new Promise((resolve, reject) => {
      const request = store.add({
        title: noteData.title,
        classID: noteData.classID,
        fileBlob: fileBlob,
        fileName: fileBlob.name,
        fileType: fileBlob.type,
        createdAt: Date.now()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending uploads from IndexedDB
   * @returns {Promise<Array>} array of pending upload objects
   */
  async getPendingUploads() {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingUploads'], 'readonly');
      const store = transaction.objectStore('pendingUploads');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove a pending upload after successful sync
   * @param {number} tempId temporary ID of pending upload
   * @returns {Promise} resolves when deleted
   */
  async removePendingUpload(tempId) {
    await this.ensureInitialized();
    const transaction = this.db.transaction(['pendingUploads'], 'readwrite');
    const store = transaction.objectStore('pendingUploads');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(tempId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveClasses(classes) {
    await this.ensureInitialized();
    const tx = this.db.transaction(['classes'], 'readwrite');
    const store = tx.objectStore('classes');

    return new Promise((resolve, reject) => {
      classes.forEach(cls => store.put(cls));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getClasses() {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['classes'], 'readonly');
      const store = tx.objectStore('classes');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveStudentsForClass(classID, students) {
    await this.ensureInitialized();
    const tx = this.db.transaction(['classStudents'], 'readwrite');
    const store = tx.objectStore('classStudents');

    return new Promise((resolve, reject) => {
      store.put({ classID, students });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getStudentsForClass(classID) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['classStudents'], 'readonly');
      const store = tx.objectStore('classStudents');
      const request = store.get(classID);

      request.onsuccess = () => {
        resolve(request.result ? request.result.students : []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveUserProfile(user) {
    await this.ensureInitialized();
    const tx = this.db.transaction(['userProfile'], 'readwrite');
    const store = tx.objectStore('userProfile');

    return new Promise((resolve, reject) => {
      store.put(user);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getUserProfile() {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['userProfile'], 'readonly');
      const store = tx.objectStore('userProfile');
      const request = store.getAll();

      request.onsuccess = () => {
        const users = request.result || [];
        // return the first user (assuming single user per browser)
        resolve(users.length > 0 ? users[0] : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveAuthor(userID, authorData) {
    await this.ensureInitialized();
    const tx = this.db.transaction(['authors'], 'readwrite');
    const store = tx.objectStore('authors');
    
    return new Promise((resolve, reject) => {
      store.put({
        id: userID,
        ...authorData,
        cachedAt: new Date().toISOString()
      });
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAuthor(userID) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['authors'], 'readonly');
      const store = tx.objectStore('authors');
      const request = store.get(userID);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
const dbHelper = new DBHelper();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  dbHelper.init().catch(err => {
    console.error('❌ Failed to auto-initialize IndexedDB:', err);
  });
}

export { dbHelper };