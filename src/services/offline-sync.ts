const DB_NAME = 'GEARONE_DB';
const DB_VERSION = 1;

interface OfflineData {
  id?: string;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorageService {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Criar object stores para diferentes tipos de dados
        if (!db.objectStoreNames.contains('presenca_offline')) {
          db.createObjectStore('presenca_offline', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('ocorrencias_offline')) {
          db.createObjectStore('ocorrencias_offline', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('insumos_offline')) {
          db.createObjectStore('insumos_offline', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async saveOfflineData(type: string, data: any): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([type + '_offline'], 'readwrite');
      const store = transaction.objectStore(type + '_offline');

      const offlineData: OfflineData = {
        ...data,
        type,
        action: 'create',
        timestamp: Date.now(),
        synced: false,
      };

      const request = store.add(offlineData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Adicionar à fila de sincronização
        this.addToSyncQueue(type, offlineData);
        resolve();
      };
    });
  }

  async getOfflineData(type: string): Promise<any[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([type + '_offline'], 'readonly');
      const store = transaction.objectStore(type + '_offline');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addToSyncQueue(type: string, data: any): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');

      const queueItem: OfflineData = {
        type,
        action: 'create',
        data,
        timestamp: Date.now(),
        synced: false,
      };

      const request = store.add(queueItem);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSyncQueue(): Promise<OfflineData[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result.filter((item) => !item.synced);
        resolve(results);
      };
    });
  }

  async markAsSynced(id: number): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const updateRequest = store.put(data);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearOfflineData(type: string): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([type + '_offline'], 'readwrite');
      const store = transaction.objectStore(type + '_offline');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export class SyncService {
  private offlineStorage = new OfflineStorageService();

  async syncOfflineData(): Promise<{ synced: number; failed: number }> {
    await this.offlineStorage.initialize();

    const queue = await this.offlineStorage.getSyncQueue();
    let syncedCount = 0;
    let failedCount = 0;

    for (const item of queue) {
      try {
        // Implementar sincronização real com API
        console.log(`Sincronizando ${item.type}:`, item.data);

        // Exemplo: POST para API
        // await apiClient.post(`/api/${item.type}`, item.data);

        await this.offlineStorage.markAsSynced(item.id!);
        syncedCount++;
      } catch (error) {
        console.error(`Erro ao sincronizar ${item.type}:`, error);
        failedCount++;
      }
    }

    return { synced: syncedCount, failed: failedCount };
  }

  // Monitorar reconexão
  monitorConnection(): void {
    window.addEventListener('online', async () => {
      console.log('Conexão restaurada. Iniciando sincronização...');
      const result = await this.syncOfflineData();
      console.log(`Sincronização completa: ${result.synced} sincronizados, ${result.failed} falhados`);
    });

    window.addEventListener('offline', () => {
      console.log('Conexão perdida. Modo offline ativado.');
    });
  }
}

export const offlineStorage = new OfflineStorageService();
export const syncService = new SyncService();
