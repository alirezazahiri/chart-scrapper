const tbody = document.getElementsByTagName("tbody")[0];

const rows = []
  .concat(...tbody.children)
  .slice(1)
  .map((tr) => [].concat(...tr.children).map((td) => td.innerHTML.trim()));

const schema = [
  "دانشكده درس",
  "دانشكده درس",
  "گروه آموزشي",
  "گروه آموزشي",
  "شماره و گروه درس",
  "نام درس",
  "کل",
  "ع",
  "ظر فيت",
  "ثبت نام شده",
  "تعداد ليست انتظار",
  "جنسيت",
  "نام استاد",
  "زمان و مكان ارائه/ امتحان",
  "توضيحات",
];

let data = {};

const diagnose = (exam) => {
  if (exam)
    if (exam.length === 1) {
      const time = exam[0].substring(27, 38);
      const date = exam[0].substring(7, 17).replaceAll(".", "-");
      return ["exam", `${date},${time}`];
    } else {
      const s = exam[0].split(" ")[1];
      const day = s ? s + " شنبه" : "شنبه";
      const time = exam[1];
      return [day, time];
    }
  return "";
};

const getCol = (col) => {
  let listed_col = col.split("<br>").map((item) =>
    item
      .trim()
      .split("شنبه")
      .map((item) => item.trim())
  );
  listed_col = listed_col.slice(0, listed_col.length - 1);
  const exam = listed_col.pop();
  const mapped_col = listed_col.map((item) => {
    return item.map((el, index) => {
      if (index === 0) {
        const splitted = el.split(" ");
        if (splitted.length === 1) {
          return "شنبه";
        }
        return splitted[1] + " شنبه";
      }
      return el.substring(0, 11);
    });
  });
  const diagnosed_exam = diagnose(exam);
  mapped_col.push(diagnosed_exam);

  let out = {};
  mapped_col.forEach(
    (item) => (out = { ...out, ...(item ? { [item[0]]: item[1] } : {}) })
  );
  return out;
};
const _rows = rows.filter(
  (row) => row[3] === "مهندسي برق و كامپيوتر" || row[3] === "كامپيوتر"
);
_rows.forEach((row, index) => {
  let obj = schema.reduce((prev, current, j) => {
    return {
      ...prev,
      [current]:
        current === "زمان و مكان ارائه/ امتحان" ? getCol(row[j]) : row[j],
    };
  }, []);
  data = { ...data, [index]: obj };
});

let examInterferences = {};

for (let i = 0; i < _rows.length; i++) {
  const master = data[i]["زمان و مكان ارائه/ امتحان"]["exam"];
  for (let j = 0; j < _rows.length; j++) {
    if (j === i) continue;
    const slave = data[j]["زمان و مكان ارائه/ امتحان"]["exam"];
    if (slave && master && master === slave) {
      const newInterferer = `${data[j]["شماره و گروه درس"]}|${data[j]["نام درس"]}|${data[j]["نام استاد"]}`;
      const prevMasterRelations = Object.keys(examInterferences).includes(
        `${data[i]["شماره و گروه درس"]}|${data[i]["نام درس"]}|${data[i]["نام استاد"]}`
      )
        ? [
            ...examInterferences[
              `${data[i]["شماره و گروه درس"]}|${data[i]["نام درس"]}|${data[i]["نام استاد"]}`
            ],
          ]
        : [];
      examInterferences = {
        ...examInterferences,
        [`${data[i]["شماره و گروه درس"]}|${data[i]["نام درس"]}|${data[i]["نام استاد"]}`]:
          [...prevMasterRelations, newInterferer],
      };
    }
  }
}

const dayDictionary = {
  "شنبه": "saturday",
  "يك شنبه": "sunday",
  "يک شنبه": "sunday",
  "دو شنبه": "monday",
  "سه شنبه": "tuesday",
  "چهار شنبه": "wednesday",
};

const getRange = (s) => {
  const splitted = s.split("-").map((time) => {
    return time.split(":").map((part) => Number(part));
  });

  return [
    splitted[0][0] + splitted[0][1] * 0.01,
    splitted[1][0] + splitted[1][1] * 0.01,
  ];
};

const isRangeInterrupted = (r1, r2) => {
  if (
    (r1[0] > r2[0] && r1[0] < r2[1]) ||
    (r1[1] > r2[0] && r1[1] < r2[1]) ||
    (r2[0] > r1[0] && r2[0] < r1[1]) ||
    (r2[1] > r1[0] && r2[1] < r1[1]) || 
    (r1[0] == r2[0])
  ) {
    return true;
  }
  return false;
};

const ses_int = [];

const getNeeds = (obj) => {
  const first = Object.keys(obj).filter((key) => key !== "exam");
  const second = first.map((key) => [
    `${dayDictionary[key]}`,
    getRange(obj[key]),
  ]);

  return second;
};

for (let i = 0; i < _rows.length; i++) {
  const masterObj = data[i]["زمان و مكان ارائه/ امتحان"];
  const masterSessions = getNeeds(masterObj);

  for (let j = 0; j < _rows.length; j++) {
    if (j === i) continue;
    const slaveObj = data[j]["زمان و مكان ارائه/ امتحان"];
    const slaveSessions = getNeeds(slaveObj);
    for (const ms of masterSessions) {
      for (const ss of slaveSessions) {
        if (ms[0] === ss[0]) {
          if (isRangeInterrupted(ms[1], ss[1])) {
            ses_int.push({
              [`${data[i]["شماره و گروه درس"]}|${data[i]["نام درس"]}|${data[i]["نام استاد"]}`]: `${data[j]["شماره و گروه درس"]}|${data[j]["نام درس"]}|${data[j]["نام استاد"]}`,
            });
          }
        }
      }
    }
  }
}

let session_interfers = {};

ses_int.forEach((item, index) => {
  const history = session_interfers[Object.keys(item)[0]];
  const prev = history ? [...history] : [];
  session_interfers = {
    ...session_interfers,
    [Object.keys(item)[0]]: [...prev, item[Object.keys(item)[0]]],
  };
});

(function (console) {
  console.save = function (data, filename) {
    if (!data) {
      console.error("Console.save: No data");
      return;
    }

    if (!filename) filename = "console.json";

    if (typeof data === "object") {
      data = JSON.stringify(data, undefined, 4);
    }

    var blob = new Blob([data], { type: "text/json" }),
      e = document.createEvent("MouseEvents"),
      a = document.createElement("a");

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
    e.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    a.dispatchEvent(e);
  };
})(console);

const JSONData = JSON.stringify({
  "تداخل کلاس ها": session_interfers,
  "تداخل امتحانات": examInterferences,
});

const HTML_CODE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body id="root">
    <style lang="css">
      html {
        scroll-behavior: smooth;
        font-size: 62.5%;
      }

      body {
        padding: 20px 10px;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      h1 {
        font-size: 3rem;
        font-weight: 600;
        text-align: center;
        margin-top: 50px;
        padding-top: 50px;
        border-top: 1px solid black;
      }

      #classes-root {
        margin-top: 30px;
        padding-top: 10px;
      }

      .key {
        font-size: 2rem;
        font-weight: 600;
        color: rgb(28, 92, 92);
        padding-left: 5px;
      }

      .interferer {
        color: rgb(219, 78, 78);
        padding-left: 10px;
        padding: 10px 15px 0;
      }

      #search {
        left: 10px;
        right: 10px;
        width: 98%;
        line-height: 30px;
        position: fixed;
        padding-left: 3px;
        font-size: 2rem;
      }
    </style>
    <input id="search" type="text" />
    <h1>تداخل امتحانات</h1>
    <div id="exams-root"></div>
    <h1>تداخل کلاس ها</h1>
    <div id="classes-root"></div>
    <script type="text/javascript" id="json-data-container"></script>
      
    <script>const JSONData = ${JSONData}</script>
    <script>
    const jsonDataContainer = document.getElementById("json-data-container")

    const init = () => {
      jsonDataContainer.innerText = ""
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
            child.style = "display:" + " " + child.style.display === "none" ? "unset" : "none";
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
    </script>
  </body>
</html>
`;

console.save(HTML_CODE, "index.html");
