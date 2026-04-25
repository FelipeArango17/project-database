// Función que se ejecuta cuando el usuario intenta iniciar sesión
async function login() {

    // Se obtienen los valores de los inputs
    const server = document.getElementById('server').value;
    const database = document.getElementById('database').value;
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;

    // Se envían los datos al backend
    const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server, database, user, password })
    });

    // Se obtiene la respuesta del servidor
    const data = await res.json();

    const result = document.getElementById('result');

    // Si el login es correcto
    if (data.success) {

        result.innerText = "Login correcto";
        
        // Se guardan los datos en localStorage (simulación de sesión)
        localStorage.setItem("user", user);
        localStorage.setItem("password", password);
        localStorage.setItem("server", server);
        localStorage.setItem("database", database);

        // Redirección a la segunda interfaz
        window.location.href = "test.html";

    } else {

        // Mostrar error
        result.innerText = "Error: " + data.message;
    }
}