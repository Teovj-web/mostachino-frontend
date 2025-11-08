const msalConfig = {
    auth: {
        clientId: "3de98641-e79b-4a89-81bc-5a8337583693",
        authority: "https://login.microsoftonline.com/5cbe96fb-af7c-4e01-8b05-41ee77638192",
        redirectUri: "http://localhost:5500",
    },
};

const loginRequest = {
    scopes: ["api://3ca1fcd6-1f8a-4a5e-9223-8e4ae7a39f34/access_as_user"]
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// 4. OBTENER REFERENCIAS A LOS ELEMENTOS DEL HTML
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
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

// 6. FUNCIONES PARA MOSTRAR/OCULTAR SECCIONES
function showUser(account) {
    welcome.textContent = `Bienvenido, ${account.name}`;
    loginSection.classList.add("hidden");
    userSection.classList.remove("hidden");

    loadServices();
}

async function loadBarber(token){
    
    const response = await fetch("http://localhost:8080/management/barber/list", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
    return response.json();
}

async function loadService(token){
    
    const response = await fetch("http://localhost:8080/management/service/list", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
    return response.json();
}
async function loadServices() {
    const account = msalInstance.getActiveAccount();
    if (!account) return console.warn("No account active.");

    let tokenResponse;
    try {
        // Try to get a valid token
        tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
    } catch (error) {
        console.warn("Silent token failed, acquiring via popup");
        tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
    }

    const tkn = tokenResponse.accessToken;


    try {

        // if (!response.ok) {
        //     const errorText = await response.text();
        //     console.error(`Error: ${response.status} ${errorText}`);
        //     return;
        // }

        const services = await loadService(tkn);
        const selectService = document.getElementById("service");
        const barbers = await loadBarber(tkn);
        const selectBarber = document.getElementById("barber");

        // Reset the select
        selectService.innerHTML = '<option value="">Selecciona un servicio...</option>';
        selectBarber.innerHTML = '<option value="">Selecciona un barbero...</option>';

        

        // Fill it dynamically
        services.forEach(service => {
            const option = document.createElement("option");
            option.value = service.id;
            option.textContent = `${service.description}`;
            selectService.appendChild(option);
        });

        barbers.forEach(barber => {
            const option = document.createElement("option");
            option.value = barber.id;
            option.textContent = `${barber.fullName}`;
            selectBarber.appendChild(option);
        });

        console.log("Servicios cargados correctamente.");
        console.log("Barberos cargados correctamente.");


    } catch (err) {
        console.error("Error al obtener servicios:", err);
    }
}
