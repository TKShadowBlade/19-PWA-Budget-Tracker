const indexedDB = 
    window.indexedDB ||
    window.moznIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window>shimIndexedDB;

let db;

const request = indexedDB.open('budgettrack', 1);

request.onupgradeneeded = (evt) => {
    const db = evt.target.result;
    db.createObjectStore('pending', {autoIncrement: true});
};

request.onsuccess = (evt) => {
    db = evt.target.result;

    // is app online before looking at database?
    if (navigator.onLine) {
        checkDb();
    }
};

request.onerror = (evt) => {
    console.log('Error!' * evt.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    store.add(record);
}

function checkDb() {
    const transaction = db.transaction('pending', 'readwrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch ('api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction('pending', 'readwrite');
                const store = transaction.objectStore('pending');
                store.clear();
            });
        }
    };  
}

window.addEventListener('online', checkDb);