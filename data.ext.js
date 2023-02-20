const tbody = document.getElementsByTagName("tbody")[0];

const rows = []
  .concat(...tbody.children)
  .slice(1)
  .map((tr) => [].concat(...tr.children).map((td) => td.innerHTML.trim()));

const schema = [
  "collegeID",
  "collegeName",
  "groupID",
  "groupName",
  "courseID",
  "courseName",
  "totalUnit",
  "practicalUnit",
  "capacity",
  "registeredCount",
  "waitListCount",
  "gender",
  "professor",
  "dateAndTime",
  "description",
];

const COLLEGE_DICTIONARY = {
  "كليه دانشكده ها": "00",
  "علوم پايه": "11",
  "مهندسي برق و كامپيوتر": "12",
  "مهندسي مكانيك": "13",
  "مهندسي عمران": "14",
  "مهندسي شيمي": "15",
  معارف: "16",
  مهمان: "17",
  "تربيت دبير فني": "18",
  "پرديس بين الملل": "19",
  "م.ص": "20",
  "مهندسي مواد و صنايع": "21",
  "اداره تربيت بدني": "29",
  نامشخص: "90",
};

let JSON_DATA = {};

Object.values(COLLEGE_DICTIONARY).forEach((value) => {
  JSON_DATA[value] = [];
});

const DAY_DICTIONARY = {
  شنبه: "saturday",
  "يك شنبه": "sunday",
  "يک شنبه": "sunday",
  "دو شنبه": "monday",
  "سه شنبه": "tuesday",
  "چهار شنبه": "wednesday",
  "پنج شنبه": "thursday",
  جمعه: "friday",
};

let data = [];

for (let i = 0; i < rows.length; i++) {
  let obj = {};
  let collegeID;
  for (let j = 0; j < rows[i].length; j++)
    if (j >= 6 && j <= 10) obj[schema[j]] = +rows[i][j];
    else {
      if (schema[j] === "collegeID") {
        collegeID = rows[i][j];
        obj[schema[j]] = collegeID;
      } else if (schema[j] === "professor")
        obj[schema[j]] = rows[i][j]
          .split("<br>")
          .filter((name) => name)
          .join(", ");
      else if (schema[j] === "dateAndTime")
        obj[schema[j]] = getExamAndClassTimes(rows[i][j]);
      else obj[schema[j]] = rows[i][j];
    }

  JSON_DATA[collegeID].push(obj);
}

function getExamAndClassTimes(dateAndTime) {
  const dateAndTimes = dateAndTime
    .split("<br>")
    .map((line) => line.trim())
    .filter((item) => item);

  const obj = {};

  for (const line of dateAndTimes) {
    if (line.includes("درس")) {
      let classTime = /\d\d\:\d\d\-\d\d\:\d\d/.exec(line)[0];
      let classDay =
        DAY_DICTIONARY[
          line
            .split(classTime)[0]
            .split(/\(.{1}\)/)
            .filter((item) => item !== "درس")
            .map((item) => item.replace(":", ""))[0]
            .trim()
        ] || "unknown";
      const [from, to] = classTime.split("-");
      obj[classDay] = { from, to };
    } else {
      let examDate = /\d\d\d\d\.\d\d\.\d\d/.exec(line)[0];
      let examTime = /\d\d\:\d\d\-\d\d\:\d\d/.exec(line)[0];
      obj["exam"] = { date: examDate, time: examTime };
    }
  }

  return obj;
}
