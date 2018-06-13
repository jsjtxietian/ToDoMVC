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

let GUID = getGUID();
let recognition = new webkitSpeechRecognition();
let recognizing = false;

window.onload = function () {
    //slide
    let slideout = new Slideout({
        'panel': document.getElementById('panel'),
        'menu': document.getElementById('menu'),
        'padding': 128,
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

            data.uitems.push({ 
                msg: data.msg, 
                completed: false, 
                createdTime : myDate.toLocaleString()
            });
            data.msg = '';
            update();
        }, false);

        let speechbutton = $('.add-todo .speech-icon');
        speechbutton.addEventListener('click',function(event){
            if (recognizing) {
                recognition.stop();
                speechbutton.src="./img/before.png";
                return;
            }
            speechbutton.src="./img/after.png";
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
    data.uitems.filter(item => item.completed == false).forEach(
        (itemData, index) => {
            let item = document.createElement('li');
            item.classList.add("single-todo");
            let id = 'item' + GUID();
            item.setAttribute('id', id);

            item.innerHTML = [
                '  <input class="toggle" type="checkbox">',
                '  <label class="todo-label">' + itemData.msg + '</label>'
            ].join('');

            uncompletedList.insertBefore(item, uncompletedList.firstChild)
        });
}

function overlay() {
    let e1 = document.getElementById('modal-overlay');
    e1.style.visibility = (e1.style.visibility == "visible") ? "hidden" : "visible";
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
    };
}


// var makeArray = function (likeArray) {
//     var array = [];
//     for (var i = 0; i < likeArray.length; ++i) {
//         array.push(likeArray[i]);
//     }
//     return array;
// };

// var guid = 0;
// var CL_COMPLETED = 'completed';
// var CL_SELECTED = 'selected';
// var CL_EDITING = 'editing';

// function update() {
//     model.flush();
//     var data = model.data;

//     var activeCount = 0;
//     var todoList = $('.todo-list');
//     todoList.innerHTML = '';
//     data.items.forEach(function (itemData, index) {
//         if (!itemData.completed) activeCount++;

//         if (
//             data.filter == 'All'
//             || (data.filter == 'Active' && !itemData.completed)
//             || (data.filter == 'Completed' && itemData.completed)
//         ) {
//             var item = document.createElement('li');
//             var id = 'item' + guid++;
//             item.setAttribute('id', id);
//             if (itemData.completed) item.classList.add(CL_COMPLETED);
//             item.innerHTML = [
//                 '<div class="view">',
//                 '  <input class="toggle" type="checkbox">',
//                 '  <label class="todo-label">' + itemData.msg + '</label>',
//                 '  <button class="destroy"></button>',
//                 '</div>'
//             ].join('');

//             var label = item.querySelector('.todo-label');
//             label.addEventListener('dblclick', function () {
//                 item.classList.add(CL_EDITING);

//                 var edit = document.createElement('input');
//                 var finished = false;
//                 edit.setAttribute('type', 'text');
//                 edit.setAttribute('class', 'edit');
//                 edit.setAttribute('value', label.innerHTML);

//                 function finish() {
//                     if (finished) return;
//                     finished = true;
//                     item.removeChild(edit);
//                     item.classList.remove(CL_EDITING);
//                 }

//                 edit.addEventListener('blur', function () {
//                     finish();
//                 }, false);

//                 edit.addEventListener('keyup', function (ev) {
//                     if (ev.keyCode == 27) { // Esc
//                         finish();
//                     }
//                     else if (ev.keyCode == 13) {
//                         label.innerHTML = this.value;
//                         itemData.msg = this.value;
//                         update();
//                     }
//                 }, false);

//                 item.appendChild(edit);
//                 edit.focus();
//             }, false);

//             var itemToggle = item.querySelector('.toggle');
//             itemToggle.checked = itemData.completed;
//             itemToggle.addEventListener('change', function () {
//                 itemData.completed = !itemData.completed;
//                 update();
//             }, false);

//             item.querySelector('.destroy').addEventListener('click', function () {
//                 data.items.splice(index, 1);
//                 update();
//             }, false);

//             todoList.insertBefore(item, todoList.firstChild);
//         }
//     });

//     var newTodo = $('.new-todo');
//     newTodo.value = data.msg;

//     var completedCount = data.items.length - activeCount;
//     var count = $('.todo-count');
//     count.innerHTML = (activeCount || 'No') + (activeCount > 1 ? ' items' : ' item') + ' left';

//     var clearCompleted = $('.clear-completed');
//     clearCompleted.style.visibility = completedCount > 0 ? 'visible' : 'hidden';

//     var toggleAll = $('.toggle-all');
//     toggleAll.style.visibility = data.items.length > 0 ? 'visible' : 'hidden';
//     toggleAll.checked = data.items.length == completedCount;

//     var filters = makeArray($All('.filters li a'));
//     filters.forEach(function (filter) {
//         if (data.filter == filter.innerHTML) filter.classList.add(CL_SELECTED);
//         else filter.classList.remove(CL_SELECTED);
//     });
// }

// window.onload = function () {
//     model.init(function () {
//         var data = model.data;

//         var newTodo = $('.new-todo');
//         newTodo.addEventListener('keyup', function () {
//             data.msg = newTodo.value;
//         });
//         newTodo.addEventListener('change', function () {
//             model.flush();
//         });
//         newTodo.addEventListener('keyup', function (ev) {
//             if (ev.keyCode != 13) return; // Enter

//             if (data.msg == '') {
//                 console.warn('input msg is empty');
//                 return;
//             }
//             data.items.push({ msg: data.msg, completed: false });
//             data.msg = '';
//             update();
//         }, false);

//         var clearCompleted = $('.clear-completed');
//         clearCompleted.addEventListener('click', function () {
//             data.items.forEach(function (itemData, index) {
//                 if (itemData.completed) data.items.splice(index, 1);
//             });
//             update();
//         }, false);

//         var toggleAll = $('.toggle-all');
//         toggleAll.addEventListener('change', function () {
//             var completed = toggleAll.checked;
//             data.items.forEach(function (itemData) {
//                 itemData.completed = completed;
//             });
//             update();
//         }, false);

//         var filters = makeArray($All('.filters li a'));
//         filters.forEach(function (filter) {
//             filter.addEventListener('click', function () {
//                 data.filter = filter.innerHTML;
//                 filters.forEach(function (filter) {
//                     filter.classList.remove(CL_SELECTED);
//                 });
//                 filter.classList.add(CL_SELECTED);
//                 update();
//             }, false);
//         });

//         update();
//     });
// };