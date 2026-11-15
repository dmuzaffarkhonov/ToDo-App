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

// Filter
const filter = document.querySelector(".filter");
const filterButton = document.querySelector(".filter__button");
const filterMenu = document.querySelector(".filter__menu");
const filterBtnText = document.querySelector(".filter__button__text");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Undo
const undoBtn = document.getElementById("undoBtn");
const undoTimer = document.getElementById("undoTimer");
const circle = document.querySelector(".undoCircle circle");

// STATE

let todo = JSON.parse(localStorage.getItem("todo") || "[]");

function createTodoId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

let migratedTodoIds = false;
const existingTodoIds = new Set();

todo.forEach((item) => {
  if (!item.id || existingTodoIds.has(item.id)) {
    item.id = createTodoId();
    migratedTodoIds = true;
  }
  existingTodoIds.add(item.id);
});

if (migratedTodoIds) {
  localStorage.setItem("todo", JSON.stringify(todo));
}

let currentFilter = localStorage.getItem("filterState") || "all";
let searchQuery = "";

let pendingDeletion = null;
let deleteTimer = null;
let animationFrame = null;

// INIT

setFilter(currentFilter);

if (localStorage.getItem("themeMode") === "dark") {
  body.classList.add("dark");
}

updateIcons();

// =============== FUNCTIONS =============== //

function updateIcons() {
  const isDark = body.classList.contains("dark");
  sun.style.display = isDark ? "flex" : "none";
  moon.style.display = isDark ? "none" : "flex";
  themeModeBtn.setAttribute("aria-pressed", String(isDark));
  themeModeBtn.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme"
  );
}

function hideModal() {
  overlay.style.display = "none";
  modal.classList.remove("openModal");
}

function closeFilterMenu() {
  filter.classList.remove("is-open");
  filterButton.setAttribute("aria-expanded", "false");
  filterMenu.setAttribute("aria-hidden", "true");
}

function setFilter(filter) {
  const validFilters = ["all", "complete", "incomplete"];
  if (!validFilters.includes(filter)) filter = "all";

  currentFilter = filter;
  localStorage.setItem("filterState", filter);

  searchQuery = "";
  searchInput.value = "";

  filterBtnText.textContent = filter;
  filterMenu.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
  });
  closeFilterMenu();
  todoLoop();
}

function todoLoop() {
  const visibleItems = [];
  let listMarkup = "";

  todo.forEach((item) => {
    if (searchQuery && !item.value.toLowerCase().includes(searchQuery)) return;

    if (
      (currentFilter === "complete" && !item.done) ||
      (currentFilter === "incomplete" && item.done)
    ) {
      return;
    }

    visibleItems.push(item);
    listMarkup += `
      <li>
        <label class="todoCheck ${item.done ? "todoCheck__checked" : ""}">
          <input 
            type="checkbox" 
            class="todoCheck__input" 
            ${item.done ? "checked" : ""} 
          />

          <span class="todoCheck__box">
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.94975 8.48527L13.435 -8.28505e-06L14.8492 1.41421L4.94975 11.3137L0 6.36395L1.41421 4.94974L4.94975 8.48527Z" fill="#F7F7F7"/>
            </svg>
          </span>

          <p class="todoCheck__text"></p>
        </label>

        <input type="text" class="editInput" aria-label="Edit task" />

        <div class="actions">
          <button class="editBtn" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.17272 3.49106L0.5 10.1637V13.5H3.83636L10.5091 6.82736M7.17272 3.49106L9.5654 1.09837L9.5669 1.09695C9.8962 0.767585 10.0612 0.602613 10.2514 0.540824C10.4189 0.486392 10.5993 0.486392 10.7669 0.540824C10.9569 0.602571 11.1217 0.767352 11.4506 1.09625L12.9018 2.54738C13.2321 2.87769 13.3973 3.04292 13.4592 3.23337C13.5136 3.40088 13.5136 3.58133 13.4592 3.74885C13.3974 3.93916 13.2324 4.10414 12.9025 4.43398L12.9018 4.43468L10.5091 6.82736M7.17272 3.49106L10.5091 6.82736" stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="removeBtn" type="button">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.87426 7.61505C3.80724 6.74386 4.49607 6 5.36983 6H12.6302C13.504 6 14.1928 6.74385 14.1258 7.61505L13.6065 14.365C13.5464 15.1465 12.8948 15.75 12.1109 15.75H5.88907C5.10526 15.75 4.4536 15.1465 4.39348 14.365L3.87426 7.61505Z" stroke="#CDCDCD"/>
              <path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round"/>
              <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"/>
              <path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
              <path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
            </svg>
          </button>

          <button class="saveBtn" type="button" aria-label="Save task">
            <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.94975 7.77818L12.7279 7.7486e-06L14.8492 2.12133L4.94975 12.0208L0 7.07108L2.12132 4.94976L4.94975 7.77818Z" fill="#6C63FF"/>
            </svg>
          </button>

          <button class="cancelBtn" type="button" aria-label="Cancel editing">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.4355 2.12109L8.83887 6.7168L13.4355 11.3135L11.3145 13.4355L6.71777 8.83887L2.12109 13.4355L0 11.3145L4.5957 6.7168L0 2.12109L2.12207 0L6.71777 4.5957L11.3135 0L13.4355 2.12109Z" fill="#E50000"/>
            </svg>
          </button>
        </div>
      </li>
    `;

  });

  todoList.innerHTML = listMarkup;

  todoList.querySelectorAll("li").forEach((li, index) => {
    const item = visibleItems[index];
    li.dataset.id = item.id;
    li.querySelector(".todoCheck__text").textContent = item.value;
    li.querySelector(".editInput").value = item.value;
    li.querySelector(".editBtn").setAttribute(
      "aria-label",
      `Edit task: ${item.value}`
    );
    li.querySelector(".removeBtn").setAttribute(
      "aria-label",
      `Delete task: ${item.value}`
    );
  });

  emptyState.style.display = visibleItems.length ? "none" : "flex";
}

function saveTodos() {
  localStorage.setItem("todo", JSON.stringify(todo));
}

function toggleDone(id, checkbox) {
  const item = todo.find((task) => task.id === id);
  if (!item) return;

  item.done = checkbox.checked;
  saveTodos();
  checkbox.parentElement.classList.toggle("todoCheck__checked", checkbox.checked);
}

function clearUndoState() {
  if (deleteTimer !== null) clearTimeout(deleteTimer);
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);

  deleteTimer = null;
  animationFrame = null;
  pendingDeletion = null;
  undoBtn.classList.remove("undo");
  undoBtn.disabled = true;
  undoTimer.textContent = "";
  circle.style.strokeDashoffset = 75;
}

function removeTodo(id) {
  const index = todo.findIndex((item) => item.id === id);
  if (index === -1) return;

  clearUndoState();
  const [task] = todo.splice(index, 1);
  pendingDeletion = { task, index };
  saveTodos();
  todoLoop();

  undoBtn.disabled = false;
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

  deleteTimer = setTimeout(clearUndoState, totalTime);
}

function todoEdit(id, btn) {
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
    const item = todo.find((task) => task.id === id);
    if (item) {
      item.value = input.value;
      saveTodos();
    }
  }

  todoLoop();
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

todoList.addEventListener("change", (e) => {
  if (!e.target.matches(".todoCheck__input")) return;
  const li = e.target.closest("li");
  toggleDone(li.dataset.id, e.target);
});

todoList.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const li = button.closest("li");
  if (!li) return;

  const id = li.dataset.id;
  if (button.classList.contains("editBtn") || button.classList.contains("saveBtn")) {
    todoEdit(id, button);
  } else if (button.classList.contains("removeBtn")) {
    removeTodo(id);
  } else if (button.classList.contains("cancelBtn")) {
    cancelEdit(button);
  }
});

todoList.addEventListener("keydown", (e) => {
  if (!e.target.matches(".editInput")) return;

  const li = e.target.closest("li");
  if (e.key === "Enter") {
    e.preventDefault();
    todoEdit(li.dataset.id, li.querySelector(".saveBtn"));
  } else if (e.key === "Escape") {
    cancelEdit(li.querySelector(".cancelBtn"));
  }
});

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

newNoteBtn.addEventListener("click", () => addTodoBtn.click());
overlay.addEventListener("click", hideModal);
cancelModalBtn.addEventListener("click", hideModal);

// Todo submit
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (todoInput.value.trim()) {
    todo.unshift({ id: createTodoId(), value: todoInput.value, done: false });
    saveTodos();
    todoLoop();
  }

  todoInput.value = "";
  hideModal();
});

// Undo
undoBtn.addEventListener("click", () => {
  if (!pendingDeletion) return;

  const { task, index } = pendingDeletion;
  clearUndoState();
  if (!todo.some((item) => item.id === task.id)) {
    todo.splice(Math.min(index, todo.length), 0, task);
  }
  saveTodos();
  todoLoop();
});

// Search
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase();
  todoLoop();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

searchBtn.addEventListener("click", () => searchInput.focus());

filterButton.addEventListener("click", () => {
  const isOpen = filter.classList.toggle("is-open");
  filterButton.setAttribute("aria-expanded", String(isOpen));
  filterMenu.setAttribute("aria-hidden", String(!isOpen));
});

filterMenu.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-filter]");
  if (button) setFilter(button.dataset.filter);
});

document.addEventListener("click", (e) => {
  if (!filter.contains(e.target)) closeFilterMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && filter.classList.contains("is-open")) {
    closeFilterMenu();
    filterButton.focus();
  }
});
