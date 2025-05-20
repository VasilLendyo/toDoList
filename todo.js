let tasks = [];

function addTask() {
    const input = document.getElementById("taskInput");
    const taskText = input.value.trim();

    if(taskText === ""){
        alert("Введи завдання");
        return;
    }

    const task = {text: taskText, done: false};
    tasks.push(task);
    saveTasks();
    showTask(task);
    input.value = "";
    updateStats();
}

function showTask(task){
    const li = document.createElement("li");
    li.draggable = true;

    li.addEventListener("dragstart", (e) => {
        li.classList.add("dragging");
    });
    li.addEventListener("dragend", (e) => {
        li.classList.remove("dragging");
        const newTasks = [];
        document.querySelectorAll("#taskList li").forEach(liEl => {
            const text = liEl.querySelector("span")?.textContent || "";
            const old = tasks.find(t => t.text === text);
            if(old) newTasks.push(old);
        });
        tasks = newTasks;
        saveTasks();
    });

    if(task.done)
        li.classList.add("done");

    li.onclick = () => {
        task.done = !task.done;
        li.classList.toggle("done");
        saveTasks();
        updateStats();
    };

    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;
    textSpan.className = "task-text";

    textSpan.ondblclick = (e) => {
        e.stopPropagation();

        const input = document.createElement("input");
        input.type = "text";
        input.value = task.text;
        input.className = "editInput";
        

        input.onblur = () => {
            task.text = input.value.trim() || task.text;
            saveTasks();
            renderTasks();
        };

        input.onkeydown = (e) => {
            if(e.key === "Enter"){
                input.blur();
            }
        };
        li.replaceChild(input, textSpan);
        input.focus();
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "x";
    delBtn.className = "delete-btn";
    delBtn.onclick = (e) => {
        e.stopPropagation();
        tasks = tasks.filter(t => t !== task);
        saveTasks();
        li.remove();
        updateStats();
    };

    li.appendChild(textSpan);
    li.appendChild(delBtn);

    document.getElementById("taskList").appendChild(li);
}

function saveTasks(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateStats(){
    document.getElementById("total").textContent = tasks.length;
    document.getElementById("done").textContent = tasks.filter(t => t.done).length;
    document.getElementById("undone").textContent = tasks.filter(t => !t.done).length;
}

let currentFilter = 'all';

function setFilter(filter){
    currentFilter = filter;
    renderTasks();
}

function renderTasks(){
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    list.addEventListener("dragover", (e) => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        const afterElement = getDragAfterElement(list, e.clientY);
        if(afterElement == null){
            list.appendChild(dragging);
        }else{
            list.insertBefore(dragging, afterElement);
        }
    });

    function getDragAfterElement(container, y){
        const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height/2;
            if (offset < 0 && offset > closest.offset){
                return {
                    offset: offset, element: child
                };
            
        }else{
                return closest;
            }
    }, {offset: Number.NEGATIVE_INFINITY}).element;
    }

    let filteredTasks = tasks;
    if(currentFilter === 'done'){
        filteredTasks = tasks.filter(t => t.done);
    }else if(currentFilter === 'undone'){
        filteredTasks = tasks.filter(t => !t.done);
    }

    filteredTasks.forEach(showTask);
    updateStats();
}

const themeBtn = document.getElementById("themeToggle");
themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
    localStorage.setItem("theme", 
        document.body.classList.contains("dark") ? "dark" : "light"
    );
};

window.onload = () => {
    tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    
    const savedTheme = localStorage.getItem("theme") || "light";

    document.body.classList.add(savedTheme);

    renderTasks();
};

document.getElementById("currentDay").textContent = "Сьогодні: " + new Date().toLocaleDateString("uk-UA", {
    weekday: 'long', day: 'numeric', month: 'long'
});