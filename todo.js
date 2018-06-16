let GUID = getGUID();
let recognition;
let recognizing = false;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
} else {
    recognition = null;
}


//todo style block inlineblock
//how to align things

window.onload = function () {

    //slide
    let slideout = new Slideout({
        'panel': document.getElementById('panel'),
        'menu': document.getElementById('menu'),
        'padding': 256,
        'tolerance': 70
    });

    // Toggle button
    document.querySelector('.toggle-button').addEventListener('click', function () {
        slideout.toggle();
    });

    initSpeechRec();

    model.init(function () {
        let data = model.data;

        //input binding
        let newTodo = $('.add-todo .input');
        newTodo.addEventListener('keyup', function () {
            data.msg = newTodo.value;
        });
        newTodo.addEventListener('change', function () {
            model.flush();
        });
        newTodo.addEventListener('keyup', function (ev) {
            if (ev.keyCode != 13)
                return; // Enter

            if (data.msg == '') {
                console.warn('input msg is empty');
                return;
            }

            let myDate = new Date();

            data.items.push({
                msg: data.msg,
                completed: false,
                createdTime: myDate.toLocaleString(),
                isImportant: false
            });
            data.msg = '';
            update();
        }, false);

        if (recognition) {
            let speechbutton = $('.add-todo .speech-icon');
            speechbutton.addEventListener('click', function (event) {
                if (recognizing) {
                    recognition.stop();
                    speechbutton.src = "./img/before.png";
                    return;
                }
                speechbutton.src = "./img/after.png";
                recognition.start();
            })
        }

        let overlay = document.getElementById('modal-overlay');
        let modifyInput = overlay.querySelector('.modal-data .change-todo');
        let modal = overlay.querySelector('.modal-data');
        modifyInput.addEventListener('keyup', function (event) {
            if (event.keyCode != 27 && event.keyCode != 13)
                return; // Enter
            if (modifyInput.value == '')
                return;
            modifyInput.finish(modifyInput.value);
            overlay.style.visibility = "hidden";
            update();
        }, false);

        //todo bigger blur
        modifyInput.addEventListener('blur', function (event) {
            overlay.style.visibility = "hidden";
            event.stopPropagation();
        }, false);

        update();
    });
}

function update() {
    model.flush();

    let data = model.data;
    let uncompletedList = $('.uncompleted-list');
    let completedList = $('.completed-list');
    let completedText = $('.completed-count');
    let input = $('.add-todo .input');
    let overlay = document.getElementById('modal-overlay');
    let modifyInput = overlay.querySelector('.modal-data .change-todo');

    input.value = data.msg;

    uncompletedList.innerHTML = '';

    let hammerUc = new Hammer(uncompletedList);
    hammerUc.get('pan').set({
        direction: Hammer.DIRECTION_ALL,
        threshold: 20
    });
    hammerUc.on('pandown', function (ev) {
        CorUCAll(true);
    });


    data.items.filter(item => item.completed == false).forEach(
        (itemData, index) => {
            let item = getItem(itemData);

            let hammertime = new Hammer(item);
            hammertime.get('pan').set({ threshold: 30 });
            hammertime.on('panleft', function (ev) {
                itemData.completed = true;
                update();
            });

            let finishbox = item.querySelector('.toggle');
            finishbox.checked = false;
            finishbox.addEventListener('click', function (event) {
                itemData.completed = !itemData.completed;
                update();
                event.stopPropagation();
            }, false);

            let editableItems = item.querySelector('.todo-label');

            editableItems.addEventListener('click', function (event) {
                overlay.style.visibility = (overlay.style.visibility == "visible") ? "hidden" : "visible";

                let modal = overlay.querySelector('.modal-data');
                let modifyInput = overlay.querySelector('.modal-data .change-todo');
                modifyInput.value = this.innerHTML;
                modifyInput.focus();
                modifyInput.finish = function (message) {
                    itemData.msg = message;
                    update();
                }
                //todo css
            }, false);

            uncompletedList.insertBefore(item, uncompletedList.firstChild)
        });

    let unfinishedCount = 0;
    unfinishedCount = data.items.filter(item => item.completed == true).length;
    completedText.innerHTML = 'Unfinished ' + unfinishedCount;

    completedList.innerHTML = '';

    let hammerC = new Hammer(completedList);
    hammerC.get('pan').set({
        direction: Hammer.DIRECTION_ALL,
        threshold: 30
    });
    hammerC.on('pandown', function (ev) {
        clearAllCompleted();
    });
    hammerC.on('panup',function(ev){
        CorUCAll(false);
    })

    data.items.filter(item => item.completed == true).forEach(
        (itemData, index) => {
            let item = getItem(itemData);

            let todolabel = item.querySelector('.todo-label');
            todolabel.classList.add("finished");
            let finishbox = item.querySelector('.toggle');
            finishbox.checked = true;
            finishbox.addEventListener('change', function () {
                itemData.completed = !itemData.completed;
                update();
            }, false);

            var hammertime = new Hammer(item);
            hammertime.get('pan').set({ threshold: 30 });
            hammertime.on('panleft', function (ev) {
                if (ev.isFinal) {
                    data.items.splice(index, 1);
                    //console.log(ev);
                    update();
                }
            });

            completedList.insertBefore(item, completedList.firstChild)
        });
}

function CorUCAll(isComplete) {
    let data = model.data;
    data.items.forEach(item => item.completed = isComplete);
    update();
}

function clearAllCompleted() {
    let data = model.data;
    data.items.filter(item => item.completed == true).forEach((itemData, index) => {
        data.items.splice(index, 1);
    });
    update();
}

function getItem(itemData) {
    let item = document.createElement('li');
    item.classList.add("single-todo");
    let id = 'item' + GUID();
    item.setAttribute('id', id);

    item.innerHTML = [
        '  <input class="toggle" type="checkbox">',
        '  <label class="todo-label">' + itemData.msg + '</label>',
    ].join('');
    return item;
}

function initSpeechRec() {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.onstart = function () {
        recognizing = true;
    };

    recognition.onend = function () {
        recognizing = false;
        let speechbutton = $('.add-todo .speech-icon');
        speechbutton.src = "./img/before.png";
    };

    recognition.onresult = function (event) {
        $('.input').value = event.results[0][0].transcript;
        let speechbutton = $('.add-todo .speech-icon');
        speechbutton.src = "./img/before.png";
    };
}

//fucntional functions
const $ = (sel) => {
    return document.querySelector(sel);
};

const $All = (sel) => {
    return document.querySelectorAll(sel);
};

//closure GUID
function getGUID() {
    let i = 0;
    function increment() {
        i++;
        return i;
    }
    return increment;
}