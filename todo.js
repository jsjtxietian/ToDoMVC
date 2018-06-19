let GUID = getGUID();

window.onload = function () {

    initSlide();
    initSpeechRec();
    initModal();
    //todo filter

    model.init(function () {
        let data = model.data;

        //input binding
        let newTodo = $('.add-todo .input');
        newTodo.value = data.msg;

        newTodo.addEventListener('keyup', function () {
            data.msg = newTodo.value;
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
                isImportant: false,
                id: GUID(),
            });
            data.msg = '';
            Update();
        }, false);

        let uncompletedList = $('.uncompleted-list');
        let completedList = $('.completed-list');

        addSwipeEvent(uncompletedList, {
            direction: "down",
            userCallback: () => {
                toggleAll(true);
            },
            threshold: 10
        })

        addSwipeEvent(completedList, {
            direction: "down",
            userCallback: () => {
                clearAllCompleted();
            },
            threshold: 10
        });

        addSwipeEvent(completedList, {
            direction: "up",
            userCallback: () => {
                toggleAll(false);
            },
            threshold: 10
        });

        initFilter();
        initToggle();
        initClear();

        Update();
    });
}

function Update(action = null) {
    if (action) {
        if (action.type == "complete-one") {
            let uncompletedList = $('.uncompleted-list');
            let id = action.id;
            //delete old one
            uncompletedList.childNodes.forEach((node) => {
                if (node.id == id) {
                    node.remove();
                }
            });
            //create new one
            model.data.items.forEach((itemData) => {
                if (itemData.id == id) {
                    createCompleted(itemData);
                }
            });
            return;
        }
        else if (action.type == "cancel-complete-one") {
            let completedList = $('.completed-list');
            let id = action.id;
            //delete old one
            completedList.childNodes.forEach((node) => {
                if (node.id == id) {
                    node.remove();
                }
            });
            //create new one
            model.data.items.forEach((itemData) => {
                if (itemData.id == id) {
                    createUncomplete(itemData);
                }
            });
            return;
        }
        else if (action.type == "delete-one") {
            let completedList = $('.completed-list');
            let id = action.id;
            //delete old one
            completedList.childNodes.forEach((node) => {
                if (node.id == id) {
                    node.remove();
                }
            });
        }
        else if(action.type == "modify"){
            let uncompletedList = $('.uncompleted-list');
            let id = action.id;
            uncompletedList.childNodes.forEach((node) => {
                if (node.id == id) {
                    let todoContent = node.querySelector('.todo-label');
                    todoContent.innerHTML = action.msg;
                }
            });
        }
    } else {
        update();
    }

    model.flush();
}

function createCompleted(itemData) {
    let completedList = $('.completed-list');
    let data = model.data;

    let item = getItem(itemData);
    let uid = itemData.id;

    let todolabel = item.querySelector('.todo-label');
    todolabel.classList.add("finished");
    let finishbox = item.querySelector('.toggle');
    finishbox.checked = true;
    finishbox.addEventListener('change', function () {
        itemData.completed = !itemData.completed;
        Update({
            id: itemData.id,
            type: "cancel-complete-one"
        });
    }, false);

    addSwipeEvent(item, {
        direction: "left",
        userCallback: () => {
            for (let i = 0; i < data.items.length; i++) {
                if (data.items[i].id == uid) {
                    data.items.splice(i, 1);
                    break;
                }
            }
            Update({
                type: "delete-one",
                id: itemData.id
            });
        },
        threshold: 10
    });
    completedList.insertBefore(item, completedList.firstChild);

    updateCount();
}

function createUncomplete(itemData) {
    let uncompletedList = $('.uncompleted-list');
    let item = getItem(itemData);
    let overlay = document.getElementById('modal-overlay');

    addSwipeEvent(item, {
        direction: "left",
        userCallback: () => {
            itemData.completed = true;
            Update({
                type: "complete-one",
                id: item.id,
            });
        }
    });

    let finishbox = item.querySelector('.toggle');
    finishbox.checked = false;
    finishbox.addEventListener('change', function (event) {
        itemData.completed = !itemData.completed;
        Update();
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
            Update({
                type:"modify",
                id : itemData.id,
                msg : itemData.msg
            });
        }
        //todo css
    }, false);

    uncompletedList.insertBefore(item, uncompletedList.firstChild);
}

function updateCount() {
    let data = model.data;
    let completedText = $('.completed-count');
    completedText.innerHTML = '';
    let unfinishedCount = 0;
    unfinishedCount = data.items.filter(item => item.completed == true).length;
    completedText.innerHTML = 'Unfinished ' + unfinishedCount;
}

function update() {
    model.flush();

    let data = model.data;
    let uncompletedList = $('.uncompleted-list');
    let completedList = $('.completed-list');
    let input = $('.add-todo .input');

    input.value = data.msg;

    uncompletedList.innerHTML = '';

    if (data.filter == "All" || data.filter == "Active") {
        data.items.filter(item => item.completed == false).forEach(
            (itemData) => {
                createUncomplete(itemData);
            });
    }

    completedList.innerHTML = '';

    if (data.filter == "All" || data.filter == "Completed") {
        data.items.filter(item => item.completed == true).forEach(
            (itemData) => {
                createCompleted(itemData);
            });
    }
    updateCount();
}

//set all item to be done or not done
function toggleAll(isComplete) {
    let data = model.data;
    data.items.forEach(item => item.completed = isComplete);
    Update();
}

function clearAllCompleted() {
    let data = model.data;
    let count = 0;
    data.items.forEach(function (itemData, index) {
        if (itemData.completed) {
            count++;
        }
    });

    while (count--) {
        for (let i = 0; i < data.items.length; i++) {
            if (data.items[i].completed == true) {
                data.items.splice(i, 1);
                break;
            }
        }
    }
    Update();
}

//get a tempalte item 
//bu used in update function
function getItem(itemData) {
    let item = document.createElement('li');
    item.classList.add("single-todo");
    item.setAttribute('id', itemData.id);

    let uid = GUID();
    item.innerHTML = `<input type="checkbox" class="toggle" id="${uid}"> <label class="new-checkbox" for="${uid}"></label> <label class="todo-label">${itemData.msg}</label>`;
    return item;
}

//speech only support in chrome
function initSpeechRec() {

    if ('webkitSpeechRecognition' in window) {
        if ('webkitSpeechRecognition' in window) {
            window.Ping("http://www.google.com", {
                onSuccess: () => {
                    let recognition;
                    let recognizing = false;
                    recognition = new webkitSpeechRecognition();
                    recognition.continuous = false;
                    recognition.lang = 'en-US';
                    recognition.onstart = function () {
                        recognizing = true;
                    };

                    recognition.onend = function () {
                        recognizing = false;
                        let speechbutton = $('.add-todo .speech-icon');
                        speechbutton.src = "./img/before.svg";
                    };

                    recognition.onresult = function (event) {
                        $('.input').value = event.results[0][0].transcript;
                        let speechbutton = $('.add-todo .speech-icon');
                        speechbutton.src = "./img/before.svg";
                    };

                    let speechbutton = $('.add-todo .speech-icon');
                    speechbutton.addEventListener('click', function (event) {
                        if (recognizing) {
                            recognition.stop();
                            speechbutton.src = "./img/before.svg";
                            return;
                        }
                        speechbutton.src = "./img/after.svg";
                        recognition.start();
                    }, false);
                },
                onFailure: () => {
                    console.warn("you are required to get access to google to use speech input");
                }
            });
        }
    }
    else {
        console.warn("you are required to use chrome to use speech input");
    }
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

//swipe event
function addSwipeEvent(targetElement, userSetting) {

    let Setting = {
        threshold: 30,
        maxTrembling: 20,
        direction: "left",
        userCallback: () => { console.log('defalut event!') }
    };
    Object.assign(Setting, { ...userSetting });

    let oldTouch;
    let initTouch;
    let isContinue = true;

    touchHandler = {
        start: (ev) => {
            initTouch = ev.touches[0];
            oldTouch = initTouch;
        },

        move: (ev) => {
            let newTouch = ev.changedTouches[0];
            let clientRect = targetElement.getBoundingClientRect();

            if (newTouch.clientX > clientRect.left
                && newTouch.clientX < clientRect.right
                && newTouch.clientY > clientRect.top
                && newTouch.clientY < clientRect.bottom) {
            }
            else {
                isContinue = false;
            }

            if (event.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!event.defaultPrevented) {
                    event.preventDefault();
                }
            }

        },

        end: (ev) => {
            if (!isContinue) {
                isContinue = true;
                return;
            }

            let touchLeave = ev.changedTouches[0];
            let left = touchLeave.clientX - initTouch.clientX;
            let top = touchLeave.clientY - initTouch.clientY;

            if (Setting.direction === "left") {
                if ((left < Setting.threshold * (-1))
                    && Math.abs(top) < Setting.maxTrembling) {
                    userSetting.userCallback();
                }
            }
            else if (Setting.direction === "right") {
                if ((left > Setting.threshold)
                    && Math.abs(top) < Setting.maxTrembling) {
                    userSetting.userCallback();
                }
            }
            else if (Setting.direction === "up") {
                if ((top < Setting.threshold * (-1))
                    && Math.abs(left) < Setting.maxTrembling) {
                    userSetting.userCallback();
                }
            }
            else if (Setting.direction === "down") {
                if ((top > Setting.threshold)
                    && Math.abs(left) < Setting.maxTrembling) {
                    userSetting.userCallback();
                }
            }
        }
    }
    targetElement.addEventListener('touchstart', touchHandler.start, false);
    targetElement.addEventListener('touchmove', touchHandler.move, false);
    targetElement.addEventListener('touchend', touchHandler.end, false);
    targetElement.addEventListener('touchcancel', touchHandler.cancel, false);
}

function initSlide() {
    let body = $('.body-style');
    addSwipeEvent(body, {
        direction: "right",
        userCallback: () => {
            let panel = $('.panel');
            panel.classList.remove('move-left');
            panel.classList.add('move-right');
        }
    });

    addSwipeEvent(body, {
        direction: "left",
        userCallback: () => {
            let panel = $('.panel');
            panel.classList.remove('move-right');
            panel.classList.add('move-left');
        }
    });

    // Toggle button
    document.querySelector('.toggle-button').addEventListener('click', function () {
        let panel = $('.panel');
        if (panel.classList.contains("move-right")) {
            panel.classList.remove('move-right');
            panel.classList.add('move-left');
        }
        else {
            panel.classList.remove('move-left');
            panel.classList.add('move-right');
        }
    });
}

function initModal() {
    let overlay = document.getElementById('modal-overlay');
    let modifyInput = overlay.querySelector('.modal-data .change-todo');

    modifyInput.addEventListener('keyup', function (event) {
        if (event.keyCode != 27 && event.keyCode != 13)
            return; // Enter
        if (modifyInput.value == '')
            return;
        modifyInput.finish(modifyInput.value);
        overlay.style.visibility = "hidden";
        Update();
    }, false);

    //todo bigger blur
    modifyInput.addEventListener('blur', function (event) {
        overlay.style.visibility = "hidden";
        event.stopPropagation();
    }, false);
}

function initFilter() {
    let data = model.data;
    let filters = document.getElementsByName("filter");

    filters.forEach((item) => {
        if (item.value == data.filter) {
            item.checked = true;
        }
        item.addEventListener('change', () => {
            data.filter = item.value;
            Update();
        });
    });
}

function initToggle() {
    let checked = true;
    let toggleAll = $('.toggle-all-button');
    let data = model.data;

    toggleAll.addEventListener('click', () => {
        data.items.forEach((itemData) => {
            itemData.completed = checked;
        });
        checked = !checked;
        Update();
    });
}

function initClear() {
    let clear = $('.clear-completed-button');
    let data = model.data;
    clear.addEventListener('click', clearAllCompleted);
}