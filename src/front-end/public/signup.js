document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let formData = new FormData(this);
    let data = new URLSearchParams(formData);
    console.log('Signup credentials:', data.get('username'), data.get('password'));
    console.log(data)
    fetch('/signup', {
        method: 'POST',
        body: data
    })
    .then(response => response.text())
    .then(result => {
        alert(result);
        if (result === 'Sign-up successful') {
            // Redirect to the login page upon successful sign-up
            window.location.href = '/';
        }
    });
    
});