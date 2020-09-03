(function () {
    'use strict';

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
        return;
    }

    var app = {

        isLoading: true,
        visibleCards: {},
        selectedTimetables: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container')
    };

    var dbPromise = idb.open('metroStations', 1, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains('schedules')) {
            console.log('Creating metroStations object store');
            upgradeDb.createObjectStore('schedules', { keyPath: 'key' });
        }
    });

    app.saveSchedules = function () {
        dbPromise.then(function (db) {
            var tx = db.transaction('schedules', 'readwrite');
            var store = tx.objectStore('schedules');
            store.delete(1);
            return tx.complete;
        }).then(function () {
            dbPromise.then(function (db) {
                var tx = db.transaction('schedules', 'readwrite');
                var store = tx.objectStore('schedules');
                var item = {
                    key: 1,
                    schedules: app.selectedTimetables
                }
                store.add(item);
                return tx.complete;
            }).then(function () {
                console.log('schedules added to storage');
            });
        });
    };

    var firstLoad = true;
    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById('butRefresh').addEventListener('click', function () {
        // Refresh all of the metro stations
        app.updateSchedules();
    });

    document.getElementById('butAdd').addEventListener('click', function () {
        // Open/show the add new station dialog
        app.toggleAddDialog(true);
    });

    document.getElementById('butAddCity').addEventListener('click', function () {


        var select = document.getElementById('selectTimetableToAdd');
        var selected = select.options[select.selectedIndex];
        var key = selected.value;
        var label = selected.textContent;
        if (!app.selectedTimetables) {
            app.selectedTimetables = [];
        }
        app.getSchedule(key, label);
        app.selectedTimetables.push({ key: key, label: label });
        app.saveSchedules();
        app.toggleAddDialog(false);
    });

    document.getElementById('butAddCancel').addEventListener('click', function () {
        // Close the add new station dialog
        app.toggleAddDialog(false);
    });


    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    // Toggles the visibility of the add new station dialog.
    app.toggleAddDialog = function (visible) {
        if (visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible');
        }
    };

    // Updates a timestation card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.

    app.updateTimetableCard = function (data) {
        var key = data.key;
        var dataLastUpdated = new Date(data.created);
        var schedules = data.schedules;
        var card = app.visibleCards[key];

        if (!card) {
            var label = data.label.split(', ');
            var title = label[0];
            var subtitle = label[1];
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.querySelector('.label').textContent = title;
            card.querySelector('.subtitle').textContent = subtitle;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[key] = card;
        }
        card.querySelector('.card-last-updated').textContent = data.created;

        var scheduleUIs = card.querySelectorAll('.schedule');
        for (var i = 0; i < 4; i++) {
            var schedule = schedules[i];
            var scheduleUI = scheduleUIs[i];
            if (schedule && scheduleUI) {
                scheduleUI.querySelector('.message').textContent = schedule.message;
            }
        }

        if (app.isLoading) {
            //obtiene el tiempo que ha pasado desde (en millisegundos) que la página empezó a cargar
            window.cardLoadTime = performance.now();
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/


    app.getSchedule = function (key, label) {
        var url = 'https://api-ratp.pierre-grimaud.fr/v3/schedules/' + key;

        getSchedulesFromCache(url, key, label);
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    var result = {};
                    result.key = key;
                    result.label = label;
                    result.created = response._metadata.date;
                    result.schedules = response.result.schedules;
                    app.updateTimetableCard(result);
                }
            } else {
                // Return the initial weather forecast since no data is available.
                app.updateTimetableCard(initialStationTimetable);
            }
        };
        request.open('GET', url);
        request.send();
    };

    // Iterate all of the cards and attempt to get the latest timetable data
    app.updateSchedules = function () {
        var keys = Object.keys(app.visibleCards);
        keys.forEach(function (key) {
            app.getSchedule(key);
        });
    };

    /*
     * Fake timetable data that is presented when the user first uses the app,
     * or when the user has not saved any stations. See startup code for more
     * discussion.
     */

    var initialStationTimetable = {

        key: 'metros/1/bastille/A',
        label: 'Bastille, Direction La Défense',
        created: '2017-07-18T17:08:42+02:00',
        schedules: [
            {
                message: '0 mn'
            },
            {
                message: '2 mn'
            },
            {
                message: '5 mn'
            }
        ],
        key: 'metros/1/nation/R',
        label: 'Nation, Direction Château de Vincennes',
        created: '2020-08-20T17:08:42+02:00',
        schedules: [
            {
                message: '0 mn'
            },
            {
                message: '2 mn'
            },
            {
                message: '5 mn'
            }
        ]


    };

    function getSchedulesFromCache(url, key, label) {
        // CODELAB: Add code to get weather forecast from the caches object.
        if (!('caches' in window)) {
            return null;
        }
        return caches.match(url).then((response) => {
            if (response) {
                response.json().then(function updateFromCache(json) {
                    var result = {};
                    result.key = key;
                    result.label = label;
                    result.created = json._metadata.date;
                    result.schedules = json.result.schedules;
                    app.updateTimetableCard(result);
                })
            }
            return null;
        })
            .catch((err) => {
                console.error('Error getting data from cache', err);
                return null;
            });
    }



    dbPromise.then(function (db) {
        window.inicialLoadTime = performance.now();
        var tx = db.transaction('schedules', 'readonly');
        var store = tx.objectStore('schedules');

        return store.openCursor();
    }).then(function showRange(cursor) {
        console.log('Evaluating cursor');
        if (!cursor) {
            app.getSchedule('metros/1/bastille/A', 'Bastille, Direction La Défense');
            app.getSchedule('metros/1/nation/R', 'Nation, Direction Château de Vincennes');
            app.selectedTimetables = [
                { key: 'metros/1/bastille/A', label: 'Bastille, Direction La Défense' },
                { key: 'metros/1/nation/R', label: 'Nation, Direction Château de Vincennes' }
            ];

            app.saveSchedules();
            return;
        } else {
            app.selectedTimetables = cursor.value.schedules;
            app.selectedTimetables.forEach(function (table) {
                app.getSchedule(table.key, table.label);
            });
        }



        return cursor.continue().then(showRange);
    });

})();