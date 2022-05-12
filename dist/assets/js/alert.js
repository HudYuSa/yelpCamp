const alertElement = document.querySelector(".alert");
if (alertElement) {
  if (alertElement) {
    alertElement.addEventListener("click", () => {
      alertElement.style.display = "none";
    });
  }
  setTimeout(() => {
    alertElement.classList.add("fade");
  }, 3000);
}
