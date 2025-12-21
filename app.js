// =============== DOM ELEMENTS =============== //

const body = document.body;

// Theme
const themeModeBtn = document.getElementById("themeModeBtn");
const moon = document.getElementById("dark");
const sun = document.getElementById("light");

// Modal
const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const addTodoBtn = document.getElementById("addTodoBtn");
const newNoteBtn = document.getElementById("newNoteBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

// Todo
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");

// Edit
const editBtn = document.getElementById("editBtn");
const editInput = document.getElementById("editInput");

// Filter
const filterBtnText = document.querySelector(".filter__button__text");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Undo
const undoBtn = document.getElementById("undoBtn");
const undoTimer = document.getElementById("undoTimer");
const circle = document.querySelector(".undoCircle circle");

// STATE

let todo = localStorage.getItem("todo")
  ? JSON.parse(localStorage.getItem("todo"))
  : [];

let currentFilter = localStorage.getItem("filterState") || "all";
let searchQuery = "";

let lastDeleted = null;
let deleteTimer = null;
let animationFrame = null;

// INIT

setFilter(currentFilter);
filterBtnText.textContent = currentFilter;
todoLoop();

if (localStorage.getItem("themeMode") === "dark") {
  body.classList.add("dark");
}

updateIcons();

// =============== FUNCTIONS =============== //

function updateIcons() {
  const isDark = body.classList.contains("dark");
  sun.style.display = isDark ? "flex" : "none";
  moon.style.display = isDark ? "none" : "flex";
}

function hideModal() {
  overlay.style.display = "none";
  modal.classList.remove("openModal");
}

function setFilter(filter) {
  currentFilter = filter;
  localStorage.setItem("filterState", filter);

  searchQuery = "";
  searchInput.value = "";

  filterBtnText.textContent = filter;
  todoLoop();
}

function todoLoop() {
  todoList.innerHTML = "";

  let hasItems = false;

  todo.forEach((item, index) => {
    if (searchQuery && !item.value.toLowerCase().includes(searchQuery)) return;

    if (
      (currentFilter === "complete" && !item.done) ||
      (currentFilter === "incomplete" && item.done)
    ) {
      return;
    }

    hasItems = true;

    todoList.innerHTML += `
      <li>
        <label class="todoCheck ${item.done ? "todoCheck__checked" : ""}">
          <input 
            type="checkbox" 
            class="todoCheck__input" 
            ${item.done ? "checked" : ""} 
            onchange="toggleDone(${index}, this)"
          />

          <span class="todoCheck__box">
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.94975 8.48527L13.435 -8.28505e-06L14.8492 1.41421L4.94975 11.3137L0 6.36395L1.41421 4.94974L4.94975 8.48527Z" fill="#F7F7F7"/>
            </svg>
          </span>

          <p class="todoCheck__text">${item.value}</p>
        </label>

        <input type="text" class="editInput" value="${item.value}" />

        <div class="actions">
          <button class="editBtn" onclick="todoEdit(${index}, this)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.17272 3.49106L0.5 10.1637V13.5H3.83636L10.5091 6.82736M7.17272 3.49106L9.5654 1.09837L9.5669 1.09695C9.8962 0.767585 10.0612 0.602613 10.2514 0.540824C10.4189 0.486392 10.5993 0.486392 10.7669 0.540824C10.9569 0.602571 11.1217 0.767352 11.4506 1.09625L12.9018 2.54738C13.2321 2.87769 13.3973 3.04292 13.4592 3.23337C13.5136 3.40088 13.5136 3.58133 13.4592 3.74885C13.3974 3.93916 13.2324 4.10414 12.9025 4.43398L12.9018 4.43468L10.5091 6.82736M7.17272 3.49106L10.5091 6.82736" stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="removeBtn" onclick="removeTodo(${index})">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.87426 7.61505C3.80724 6.74386 4.49607 6 5.36983 6H12.6302C13.504 6 14.1928 6.74385 14.1258 7.61505L13.6065 14.365C13.5464 15.1465 12.8948 15.75 12.1109 15.75H5.88907C5.10526 15.75 4.4536 15.1465 4.39348 14.365L3.87426 7.61505Z" stroke="#CDCDCD"/>
              <path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round"/>
              <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"/>
              <path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
              <path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
            </svg>
          </button>

          <button class="saveBtn" onclick="todoEdit(${index}, this)">
            <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.94975 7.77818L12.7279 7.7486e-06L14.8492 2.12133L4.94975 12.0208L0 7.07108L2.12132 4.94976L4.94975 7.77818Z" fill="#6C63FF"/>
            </svg>
          </button>

          <button class="cancelBtn" onclick="cancelEdit(this)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.4355 2.12109L8.83887 6.7168L13.4355 11.3135L11.3145 13.4355L6.71777 8.83887L2.12109 13.4355L0 11.3145L4.5957 6.7168L0 2.12109L2.12207 0L6.71777 4.5957L11.3135 0L13.4355 2.12109Z" fill="#E50000"/>
            </svg>
          </button>
        </div>
      </li>
    `;
  });

  emptyState.style.display = hasItems ? "none" : "flex";

  todoList.querySelectorAll("li").forEach((li) => {
    const input = li.querySelector(".editInput");
    const saveBtn = li.querySelector(".saveBtn");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveBtn.click();
    });
  });
}

function toggleDone(index, checkbox) {
  todo[index].done = checkbox.checked;
  localStorage.setItem("todo", JSON.stringify(todo));

  checkbox.parentElement.classList.toggle(
    "todoCheck__checked",
    checkbox.checked
  );
}

function removeTodo(index) {
  lastDeleted = {
    task: todo[index],
    index,
    element: todoList.children[index],
  };

  lastDeleted.element.style.display = "none";
  undoBtn.classList.add("undo");

  const totalTime = 3000;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / totalTime, 1);
    undoTimer.textContent = Math.ceil((1 - progress) * 3);
    circle.style.strokeDashoffset = 75 * (1 - progress);

    if (progress < 1) animationFrame = requestAnimationFrame(animate);
  }

  animationFrame = requestAnimationFrame(animate);

  deleteTimer = setTimeout(() => {
    todo.splice(index, 1);
    localStorage.setItem("todo", JSON.stringify(todo));
    todoLoop();

    undoBtn.classList.remove("undo");
    undoTimer.textContent = "";
    circle.style.strokeDashoffset = 0;
    lastDeleted = null;
  }, totalTime);
}

function todoEdit(index, btn) {
  const li = btn.closest("li");
  const text = li.querySelector(".todoCheck__text");
  const input = li.querySelector(".editInput");

  if (!li.classList.contains("editing")) {
    li.classList.add("editing");
    input.value = text.textContent;
    text.style.display = "none";
    input.style.display = "flex";
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    return;
  }

  if (input.value.trim()) {
    text.textContent = input.value;
    todo[index].value = input.value;
    localStorage.setItem("todo", JSON.stringify(todo));
  }

  li.classList.remove("editing");
  text.style.display = "flex";
  input.style.display = "none";
}

function cancelEdit(btn) {
  const li = btn.closest("li");
  const text = li.querySelector(".todoCheck__text");
  const input = li.querySelector(".editInput");

  input.value = text.textContent;
  li.classList.remove("editing");
  text.style.display = "flex";
  input.style.display = "none";
}

// =============== EVENT LISTENERS =============== //

// THEME
themeModeBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  body.classList.contains("dark")
    ? localStorage.setItem("themeMode", "dark")
    : localStorage.removeItem("themeMode");
  updateIcons();
});

// Modal
addTodoBtn.addEventListener("click", () => {
  overlay.style.display = "flex";
  modal.classList.add("openModal");
});

newNoteBtn.addEventListener("click", addTodoBtn.click);
overlay.addEventListener("click", hideModal);
cancelModalBtn.addEventListener("click", hideModal);

// Todo submit
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (todoInput.value.trim()) {
    todo.unshift({ value: todoInput.value, done: false });
    localStorage.setItem("todo", JSON.stringify(todo));
    todoLoop();
  }

  todoInput.value = "";
  hideModal();
});

// Undo
undoBtn.addEventListener("click", () => {
  if (!lastDeleted) return;

  clearTimeout(deleteTimer);
  cancelAnimationFrame(animationFrame);

  lastDeleted.element.style.display = "flex";
  undoBtn.classList.remove("undo");
  undoTimer.textContent = "";
  circle.style.strokeDashoffset = 75;
  lastDeleted = null;
});

// Search
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase();
  todoLoop();
});

// Filter buttons
document
  .getElementById("all_btn")
  .addEventListener("click", () => setFilter("all"));

document
  .getElementById("Complete_btn")
  .addEventListener("click", () => setFilter("complete"));

document
  .getElementById("Incomplete_btn")
  .addEventListener("click", () => setFilter("incomplete"));
