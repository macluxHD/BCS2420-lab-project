const dialog = document.querySelector("dialog");

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let formData = new FormData(this);
    let data = new URLSearchParams(formData);
    fetch("/login", {
      method: "POST",
      body: data,
    })
      .then((response) => response.text())
      .then((result) => {
        if (result === "Login admin") {
          // admin users
          window.location.href = "/admin";
        } else if (result === "Login successful") {
          // normal users
          window.location.href = "/chat";
        } else {
          // fail
          document.getElementById("user-feedback").innerHTML = result;
          dialog.showModal();
        }
      });
  });

const closeButton = document.querySelector("dialog button");

// "Close" button closes the dialog
closeButton.addEventListener("click", () => {
  dialog.close();
});
