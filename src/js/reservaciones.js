

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


async function loadAll() {
    const token = localStorage.getItem("token");
    try {

        const services = await loadService(token);
        const selectService = document.getElementById("service");
        const barbers = await loadBarber(token);
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