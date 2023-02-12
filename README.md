- run the code below in the console (which is opened in the `golestan`'s window) :

```js
fetch(
  "https://raw.githubusercontent.com/alirezazahiri/chart-scrapper/master/dist/main.min.js",
  {
    method: "GET",
    redirect: "follow",
  }
)
  .then((response) => response.text())
  .then((result) => {
    var textArea = document.createElement("textarea");
    textArea.value = result;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      console.log(successful ? "successful" : "unsuccessful");
    } catch (err) {
      console.error("unable to copy!", err);
    }
    document.body.removeChild(textArea);
  })
  .catch((error) => console.log("error", error));
```

- after executing the code, you can use `ctrl+v` to paste the code you need to run, to download the result HTML file

- then hit the `ENTER` and open the downloaded HTML file!

<hr>

- or if you want to just extract all the table data in json format, just use the code below :

```js
fetch(
  "https://raw.githubusercontent.com/alirezazahiri/chart-scrapper/master/dist/data.ext.min.js",
  {
    method: "GET",
    redirect: "follow",
  }
)
  .then((response) => response.text())
  .then((result) => {
    var textArea = document.createElement("textarea");
    textArea.value = result;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      console.log(successful ? "successful" : "unsuccessful");
    } catch (err) {
      console.error("unable to copy!", err);
    }
    document.body.removeChild(textArea);
  })
  .catch((error) => console.log("error", error));
```

- and you can have the data stored in `JSON_DATA` variable!

