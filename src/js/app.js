///app.js con login ok 1. CONFIGURACIÓN DE MSAL (Con tus keys de Azure)
const msalConfig = { 
    auth: {
        clientId: "3de98641-e79b-4a89-81bc-5a8337583693",
        authority: "https://login.microsoftonline.com/5cbe96fb-af7c-4e01-8b05-41ee77638192",
        redirectUri: "http://localhost:8080" // Tu URI de redirección
    },
    cache: {
        cacheLocation: "sessionStorage"
    }
};

// 2. CONFIGURACIÓN DE LA API (Scopes)
// ATENCIÓN: Necesitarás el scope de la API de David.
// Este es un EJEMPLO del código que me pasaste.
const loginRequest = {
    scopes: ["api://3ca1fcd6-1f8a-4a5e-9223-8e4ae7a39f34/access_as_user", "user.read"]
};

// 3. CREAR LA INSTANCIA DE MSAL
// Usamos 'msal' (del script) en lugar de 'msalBrowser'
const msalInstance = new msal.PublicClientApplication(msalConfig);

// 4. OBTENER REFERENCIAS A LOS ELEMENTOS DEL HTML
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const getServicesBtn = document.getElementById("getServicesBtn");
const loginSection = document.getElementById("login-section");
const userSection = document.getElementById("user-section");
const welcome = document.getElementById("welcome");
const apiResponse = document.getElementById("apiResponse");

// 5. LÓGICA DE LOS BOTONES
// (Solo se ejecutan si los botones existen en la página)
if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            // Usamos loginPopup para no salir de la página
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            const account = loginResponse.account;
            msalInstance.setActiveAccount(account);
            showUser(account);
        } catch (err) {
            console.error(err); // Muestra el error en la consola F12
        }
    };
}

if (logoutBtn) {
    logoutBtn.onclick = () => {
        msalInstance.logoutPopup().then(() => {
            showLogin();
        });
    };
}

if (getServicesBtn) {
    getServicesBtn.onclick = async () => {
        const account = msalInstance.getActiveAccount();
        if (!account) return alert("Debes iniciar sesión primero.");

        let tokenResponse;
        try {
            // Intenta obtener el token silenciosamente
            tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
        } catch (error) {
            // Si falla (ej. expiró), pide login de nuevo
            console.warn("Fallo de token silencioso, pidiendo con popup");
            tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
        }
        
        const token = tokenResponse.accessToken;
        apiResponse.textContent = "Obteniendo token... llamando a la API...";

        // ¡ATENCIÓN! Esta es la URL de la API de ejemplo.
        // Debes reemplazarla por la URL de la API de David.
        try {
            const response = await fetch(
                "http://localhost:8080/management/service/get?id=51325f6a-6188-4a7c-8c1e-045c41ceedd7", 
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                apiResponse.textContent = `Error: ${response.status} ${errorText}`;
            } else {
                const data = await response.json();
                apiResponse.textContent = JSON.stringify(data, null, 2);
            }
        } catch (err) {
            apiResponse.textContent = `Error al llamar a la API: ${err.message}`;
        }
    };
}

// CÓDIGO DENTRO DE app.js

// ...

// 6. FUNCIONES PARA MOSTRAR/OCULTAR SECCIONES
function showUser(account) {
    // welcome (ID del h1) mostrará el nombre del usuario
    welcome.textContent = `Bienvenido, ${account.name}`; 
    
    // Ocultamos el formulario de login (que ahora está en loginSection)
    loginSection.classList.add("hidden"); 
    
    // Mostramos el formulario de reservas (userSection)
    userSection.classList.remove("hidden");
}

// ...