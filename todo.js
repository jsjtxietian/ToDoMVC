let GUID = getGUID();
let recognition = new webkitSpeechRecognition();
let recognizing = false;




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
                createdTime: myDate.toLocaleString()
            });
            data.msg = '';
            update();
        }, false);

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

    input.value = data.msg;

    uncompletedList.innerHTML = '';
    data.items.filter(item => item.completed == false).forEach(
        (itemData, index) => {
            let item = document.createElement('li');
            item.classList.add("single-todo");
            let id = 'item' + GUID();
            item.setAttribute('id', id);

            item.innerHTML = [
                '  <input class="toggle" type="checkbox">',
                '  <label class="todo-label">' + itemData.msg + '</label>'
            ].join('');

            let hammertime = new Hammer(item);
            hammertime.get('pan').set({ threshold: 30 });
            hammertime.on('panleft', function (ev) {
                itemData.completed = true;
                update();
            });

            let finishbox = item.querySelector('.toggle');
            finishbox.checked = false;
            finishbox.addEventListener('change', function () {
                itemData.completed = !itemData.completed;
                update();
                stopPropagation();
            }, false);

            let editableItems = item.querySelector('.todo-label');
            editableItems.addEventListener('click', function (event) {
                let overlay = document.getElementById('modal-overlay');
                overlay.style.visibility = (overlay.style.visibility == "visible") ? "hidden" : "visible";
                let modifyInput = overlay.querySelector('.modal-data .change-todo');
                modifyInput.value = this.innerHTML;
                //todo css & save
            },false);

            uncompletedList.insertBefore(item, uncompletedList.firstChild)
        });

    let unfinishedCount = 0;
    unfinishedCount = data.items.filter(item => item.completed == true).length;
    completedText.innerHTML = 'Unfinished ' + unfinishedCount;

    completedList.innerHTML = '';
    data.items.filter(item => item.completed == true).forEach(
        (itemData, index) => {
            let item = document.createElement('li');
            item.classList.add("single-todo");
            let id = 'item' + GUID();
            item.setAttribute('id', id);

            item.innerHTML = [
                '  <input class="toggle" type="checkbox">',
                '  <label class="todo-label  finished">' + itemData.msg + '</label>'
            ].join('');

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
                    console.log(ev);
                    update();
                }
            });

            completedList.insertBefore(item, completedList.firstChild)
        });
}

function initSpeechRec() {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.onstart = function () {
        recognizing = true;
    };

    recognition.onend = function () {
        recognizing = false;
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