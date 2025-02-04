document.getElementById('adminForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let formData = new FormData(this);
    let data = new URLSearchParams(formData);
    console.log(data)
    fetch('/admin', {
        method: 'POST',
        body: data
    })
    .then(response => response.text())
    .then(result => alert(result));
});