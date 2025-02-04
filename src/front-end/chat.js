document.getElementById('chatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let formData = new FormData(this);
    let data = new URLSearchParams(formData);
    console.log(data)
    fetch('/chat', {
        method: 'POST',
        body: data
    })
    .then(response => response.text())
    .then(result => alert(result));
});