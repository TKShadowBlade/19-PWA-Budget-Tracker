let db;

const request = indexedDB.open('budgettrack', 1);

request.onupgradeneeded = (evt) => {
    const db = evt.target.result;
    db.createObjectStore('pending', {autoIncrement: true});
};

request.onsuccess = (evt) => {
    db = evt.target.result;

    if (navigator.onLine) {
        checkDb();
    }
};

request.onerror = (evt) => {
    console.log(evt.target.errorCode);
};