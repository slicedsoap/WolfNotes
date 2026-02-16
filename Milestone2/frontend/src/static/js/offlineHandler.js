import { dbHelper } from "./dbHelper.js";

function log(...data) {
  console.log("OfflineHandler", ...data);
}

/**
 * Check for pending uploads on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (navigator.onLine) {
    syncPendingUploads();
  }
});

/**
 * Sync pending uploads when back online
 */
async function syncPendingUploads() {
  if (!navigator.onLine) return;
  
  try {
    const pending = await dbHelper.getPendingUploads();
    if (pending.length === 0) return;
    
    log(`Syncing ${pending.length} pending upload(s)...`);
    
    for (const upload of pending) {
      try {
        const formData = new FormData();
        formData.append('title', upload.title);
        formData.append('pdf', upload.fileBlob, upload.fileName);
        
        const response = await fetch(`/api/notes/classes/${upload.classID}`, {
          method: 'POST',
          body: formData,
          credentials: "include"
        });
        
        if (response.ok) {
          const result = await response.json();
          await dbHelper.removePendingUpload(upload.tempId);
          log(`✅ Synced upload: ${upload.title}`);
        }
      } catch (error) {
        log(`❌ Failed to sync upload: ${upload.title}`, error);
      }
    }
    
    log('✅ All pending uploads synced, reloading...');
    window.location.reload();
  } catch (error) {
    log('❌ Sync failed:', error);
  }
}

/**
 * Auto-sync when back online
 */
window.addEventListener('online', () => {
  log('📡 Back online, syncing...');
  syncPendingUploads();
});