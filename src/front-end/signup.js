document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let formData = new FormData(this);
    let data = new URLSearchParams(formData);
    console.log(data)
    fetch('/signup', {
        method: 'POST',
        body: data
    })
    .then(response => response.text())
    .then(result => alert(result));
    
    // Hardcoded credentials (vulnerability)
    const adminUser = 'admin';
    const adminPass = 'password123';
});