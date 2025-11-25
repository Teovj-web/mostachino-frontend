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
            localStorage.setItem("token", getToken());
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
}

async function getToken() {
    
    const account = msalInstance.getActiveAccount();
    if (!account) return console.warn("No account active.");
    
    let tokenResponse;
    try {
        // Try to get a valid token
        tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
        return tokenResponse;
    } catch (error) {
        console.warn("Silent token failed, acquiring via popup");
        tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
        return tokenResponse;
    }
}
