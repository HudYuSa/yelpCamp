const upload = document.querySelector("#image");
const fileSelected = document.querySelector(".file-selected");
upload.addEventListener("change", (e) => {
  const path = e.target.value.split("\\");
  const fileCount = upload.files.length;
  if (fileCount > 1) {
    fileSelected.textContent = fileCount + " files selected";
  } else if (fileCount === 1) {
    fileSelected.textContent = path[path.length - 1];
  } else {
    fileSelected.textContent = "no files chosen";
  }
});
