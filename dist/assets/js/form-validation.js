const form = document.querySelector(".validate-form");
if (form) {
  const formSections = form.querySelectorAll("section");
  const errorLists = document.querySelectorAll(".validation-error-list");
  const allInputWrapper = document.querySelectorAll(".input-wrapper");
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      formSections.forEach((section) => {
        if (
          !section.classList.contains("validation-error") &&
          !section.classList.contains("validation-success")
        ) {
          section.classList.add("validation-error");
          errorLists.forEach((list) => {
            if (
              list.parentElement.parentElement.classList.contains(
                "validation-error"
              )
            ) {
              if (list.children.length === 0) addError(list);
            }
          });
        }
      });
    }
  });
  allInputWrapper.forEach((inputWrapper) => {
    const input = inputWrapper.querySelector(".input");
    const textArea = inputWrapper.querySelector("textarea");
    const errorList = inputWrapper.querySelector(".validation-error-list");
    if (input) {
      input.addEventListener("focusout", () => {
        checkLength(input, inputWrapper, errorList);
      });
      input.addEventListener("keyup", () => {
        checkLength(input, inputWrapper, errorList);
      });
    } else {
      textArea.addEventListener("focusout", () => {
        checkLength(textArea, inputWrapper, errorList);
      });
      textArea.addEventListener("keyup", () => {
        checkLength(textArea, inputWrapper, errorList);
      });
    }
  });
  function checkLength(input, parent, list) {
    if (input.value.length === 0) {
      // console.log("not valid");
      parent.parentElement.classList.add("validation-error");
      parent.parentElement.classList.remove("validation-success");
      if (list.children.length === 0) addError(list);
    } else {
      // console.log("valid");
      parent.parentElement.classList.remove("validation-error");
      parent.parentElement.classList.add("validation-success");
      if (list.children.length > 0) {
        const li = list.children[0];
        list.removeChild(li);
      }
    }
  }
  function addError(list) {
    const li = document.createElement("li");
    li.setAttribute("class", "w-full block");
    li.style.textAlign = "right";
    const liText = document.createTextNode("Not Valid");
    li.append(liText);
    list.append(li);
  }
}
