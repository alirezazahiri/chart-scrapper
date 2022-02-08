const table = document.getElementsByClassName("DTitle")[0];
const tbody = document.getElementsByTagName("tbody")[0];

const keys = [].concat(...table.children).map((td) => td.innerHTML.trim());
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
        [`${data[i]["شماره و گروه درس"]}|${data[i]["نام درس"]}|${data[i]["نام استاد"]}`]: [
          ...prevMasterRelations,
          newInterferer,
        ],
      };
    }
  }
}

const dayDictionary = {
  شنبه: "saturday",
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
    (r2[1] > r1[0] && r2[1] < r1[1])
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

console.log({
  "تداخل کلاس ها": session_interfers,
  "تداخل امتحانات": examInterferences,
});

