const jsonDataContainer = document.getElementById("json-data-container")

const init = () => {
  jsonDataContainer.innerText = ``
}

const root = document.getElementById("root");

const examsRoot = document.getElementById("exams-root");
const classesRoot = document.getElementById("classes-root");

const examInterferences = JSONData["تداخل امتحانات"];
const classInterferences = JSONData["تداخل کلاس ها"];

const render = (obj, root, criteria = "") => {
  root.innerHTML = "";
  for (const key of Object.keys(obj).filter((item) =>
    item.includes(criteria)
  )) {
    const ul = document.createElement("ul");
    ul.innerHTML = key;
    ul.style =
      "cursor: pointer; display: flex; flex-direction: column; padding-top: 10px;";
    ul.classList.add("key");
    for (const interferer of obj[key]) {
      const li = document.createElement("li");
      li.innerHTML = interferer;
      li.classList.add("interferer");
      li.style =
        "display: none; margin-top: 10px; transition: all 0.3s ease-in-out;";
      ul.appendChild(li);
    }
    ul.addEventListener("click", (e) => {
      for (const child of [].concat(...ul.children)) {
        child.style = `display: ${
          child.style.display === "none" ? "unset" : "none"
        };`;
      }
    });
    root.appendChild(ul);
  }
};

render(examInterferences, examsRoot);
render(classInterferences, classesRoot);

const input = document.getElementById("search");

const events = {
  criteria: "",
};

input.addEventListener("keyup", (e) => {
  const value = [...e.target.value]
    .map((char) => (char === "ی" ? "ي" : char))
    .map((char) => (char === "ک" ? "ك" : char))
    .join("");
  events.criteria = value === "undefined" ? "" : value;
  render(examInterferences, examsRoot, events.criteria.trim());
  render(classInterferences, classesRoot, events.criteria.trim());
});
