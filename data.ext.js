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
  if (exam) {
    if (1 === exam.length) {
      const time = exam[0].substring(27, 38),
        date = exam[0].substring(7, 17).replaceAll(".", "-");
      return ["exam", `${date},${time}`];
    }
    {
      const s = exam[0].split(" ")[1],
        day = s ? s + " شنبه" : "شنبه",
        time = exam[1];
      return [day, time];
    }
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
  let exam = listed_col.pop(),
    mapped_col = listed_col.map((item) =>
      item.map((el, index) => {
        if (0 === index) {
          const splitted = el.split(" ");
          return 1 === splitted.length ? "شنبه" : splitted[1] + " شنبه";
        }
        return el.substring(0, 11);
      })
    );
  diagnosed_exam = diagnose(exam);
  mapped_col.push(diagnosed_exam);
  mapped_col = mapped_col.map((line) => {
    return line.length
      ? line.map((item) => {
          if (item.includes("شنبه")) return item;
          if (item && item.length > 11)
            return /\d\d\:\d\d\-\d\d\:\d\d/.exec(item)[0];
          return item;
        })
      : line;
  });
  let out = {};
  return (
    mapped_col.forEach(
      (item) => (out = { ...out, ...(item ? { [item[0]]: item[1] } : {}) })
    ),
    out
  );
};
const _rows = rows;
_rows.forEach((row, index) => {
  let obj = schema.reduce((prev, current, j) => {
    return {
      ...prev,
      [current]:
        "زمان و مكان ارائه/ امتحان" === current ? getCol(row[j]) : row[j],
    };
  }, []);
  data = { ...data, [index]: obj };
});
const dayDictionary = {
  شنبه: "saturday",
  "يك شنبه": "sunday",
  "يک شنبه": "sunday",
  "دو شنبه": "monday",
  "سه شنبه": "tuesday",
  "چهار شنبه": "wednesday",
  "پنج شنبه": "thursday",
  جمعه: "friday",
};
const colNameDictionary = {
  "دانشكده درس": "college",
  "گروه آموزشي": "group",
  "شماره و گروه درس": "courseID",
  "نام درس": "courseName",
  کل: "totalUnit",
  ع: "practicalUnit",
  "ظر فيت": "capacity",
  "ثبت نام شده": "registeredCount",
  "تعداد ليست انتظار": "waitListCount",
  جنسيت: "gender",
  "نام استاد": "professor",
  "زمان و مكان ارائه/ امتحان": "dateAndTime",
  توضيحات: "description",
};
let newData = {};
for (const i in data) {
  newData[i] = {};
  for (const [key, value] of Object.entries(data[i]))
    if ("زمان و مكان ارائه/ امتحان" === key) {
      const newValue = {};
      for (const [k, v] of Object.entries(value)) {
        if ("exam" === k) {
          const temp = v.split(",");
          newValue[k] = { date: temp[0], time: temp[1] };
          continue;
        }
        const temp = v.split("-");
        newValue[dayDictionary[k]] = { from: temp[0], to: temp[1] };
      }
      newData[i][colNameDictionary[key]] = newValue;
    } else
      newData[i][colNameDictionary[key]] = value.replaceAll("<br>", "").trim();
}
newData = Object.values(newData);
for (const i in newData)
  (newData[i].totalUnit = +newData[i].totalUnit),
    (newData[i].practicalUnit = +newData[i].practicalUnit),
    (newData[i].capacity = +newData[i].capacity),
    (newData[i].registeredCount = +newData[i].registeredCount),
    (newData[i].waitListCount = +newData[i].waitListCount);
const CAMPUS_DICTIONARY = {
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
JSON_DATA = { [CAMPUS_DICTIONARY[newData[0].college]]: newData };
