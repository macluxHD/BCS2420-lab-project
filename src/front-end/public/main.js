const dialog = document.querySelector("dialog");


document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let formData = new FormData(this);
    let data = new URLSearchParams(formData);
    console.log(data)
    fetch('/login', {
        method: 'POST',
        body: data
    })
        .then(response => response.text())
        .then(result => {
            // alert(result);
            if (result === 'Login successful') {
                // Redirect to the login page upon successful sign-up
                window.location.href = '/chat';
            } else {
                document.getElementById("user-feedback").innerHTML = result;
                dialog.showModal();
            }
        });

    // Hardcoded credentials (vulnerability)
    const adminUser = 'admin';
    const adminPass = 'password123';
    // console.log('Admin credentials:', adminUser, adminPass);
});

const closeButton = document.querySelector("dialog button");

// "Close" button closes the dialog
closeButton.addEventListener("click", () => {
    dialog.close();
});

