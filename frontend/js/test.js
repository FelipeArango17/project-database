// Se obtienen los datos guardados en el login
const user = localStorage.getItem("user");
const password = localStorage.getItem("password");
const database = localStorage.getItem("database");

// Se muestra el usuario en pantalla
document.getElementById("userInfo").innerText = "Usuario: " + user;


// Definición de permisos (solo visual, no afecta backend)
const permisos = {

    // Usuario administrador (todos los permisos)
    AdminLogin: {
        Deportistas: ["SELECT", "INSERT", "UPDATE", "DELETE"],
        Asistencia: ["SELECT", "INSERT", "UPDATE", "DELETE"],
        Entrenador: ["SELECT", "INSERT", "UPDATE", "DELETE"]
    },

    // Usuario entrenador (permisos limitados)
    EntrenadorLogin: {
        Deportistas: ["SELECT"],
        Asistencia: ["SELECT", "INSERT"],
        Entrenador: []
    }
};


// Función que construye la tabla visual de permisos
function renderPermisos() {

    const tbody = document.getElementById("permBody");

    // Limpiar contenido anterior
    tbody.innerHTML = "";

    const tablas = ["Deportistas", "Asistencia", "Entrenador"];
    const acciones = ["SELECT", "INSERT", "UPDATE", "DELETE"];

    // Recorrer cada tabla
    tablas.forEach(tabla => {

        let row = `<tr><td>${tabla}</td>`;

        // Recorrer cada tipo de acción
        acciones.forEach(acc => {

            // Verificar si el usuario tiene ese permiso
            const permitido = permisos[user]?.[tabla]?.includes(acc);

            // Si tiene permiso
            if (permitido) {
                row += `<td class="allowed">✔</td>`;
            } else {
                row += `<td class="denied">✖</td>`;
            }
        });

        row += "</tr>";

        // Agregar fila a la tabla
        tbody.innerHTML += row;
    });
}

// Se ejecuta al cargar la página
renderPermisos();


// Función para ejecutar consultas SQL escritas por el usuario
async function runCustomQuery() {

    // Obtener la consulta escrita
    const query = document.getElementById("queryInput").value;

    const result = document.getElementById("result");
    const table = document.getElementById("tableResult");

    // Limpiar resultados anteriores
    table.innerHTML = "";

    // Validar que no esté vacío
    if (!query.trim()) {
        result.style.color = "orange";
        result.innerText = "Escribe una consulta";
        return;
    }

    try {
        // Enviar consulta al backend
        const res = await fetch('http://localhost:3000/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user,
                password,
                database,
                query
            })
        });

        const data = await res.json();

        // Si la consulta se ejecuta correctamente
        if (data.success) {

            result.style.color = "green";
            result.innerText = "Consulta ejecutada correctamente";

            // Si hay datos (caso SELECT)
            if (data.data && data.data.length > 0) {

                const headers = Object.keys(data.data[0]);

                let html = "<tr>";

                // Crear encabezados de tabla
                headers.forEach(h => html += `<th>${h}</th>`);
                html += "</tr>";

                // Crear filas con datos
                data.data.forEach(row => {
                    html += "<tr>";
                    headers.forEach(h => {
                        html += `<td>${row[h]}</td>`;
                    });
                    html += "</tr>";
                });

                table.innerHTML = html;
            }

        } else {

            result.style.color = "red";

            // Mostrar tipo de error
            if (data.type === "permission") {
                result.innerText = "Permiso denegado";
            } else if (data.type === "syntax") {
                result.innerText = "Error de sintaxis SQL";
            } else {
                result.innerText = "Error: " + data.message;
            }
        }

    } catch (err) {

        // Error si no conecta con el servidor
        result.style.color = "red";
        result.innerText = "Error de conexión";
    }
}

// Manejo del Tab dentro del textarea
document.getElementById("queryInput").addEventListener("keydown", function(e) {
    if (e.key === "Tab") {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
    }
});