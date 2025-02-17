const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";
const URL_OBJETOS = "https://collectionapi.metmuseum.org/public/collection/v1/objects";
const URL_OBJETO = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;
const URL_SEARCH_HASIMAGE = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true`;
const URL_SEARCH= `https://collectionapi.metmuseum.org/public/collection/v1/search`;
const URL_TRADUCIR = "/api/traducir";//esto se hizo para que funcione en vercel sino se usaria const URL_TRADUCIR = "/traducir";

const itemsPerPage = 20; 

function fetchDepartamentos() {
  fetch(URL_DEPARTAMENTOS)
    .then((response) => response.json())
    .then((data) => {
      //cargar select de departamentos
      const departamentoSelect = document.getElementById("departamento");
      data.departments.forEach((departamento) => {
        const option = document.createElement("option");
        option.value = departamento.departmentId;
        option.textContent = departamento.displayName;
        departamentoSelect.appendChild(option);
      });
    });
}






//PRUEBA DE CODIGOS





function fetchObjetos(objectIDs) {
  let objetosHtml = "";

  objectIDs.forEach(objectId => {
      fetch(URL_OBJETO + objectId)
      .then((response) => {
        if (!response.ok) {
          console.error(`Error al obtener objeto con ID ${objectId}: ${response.statusText}`);
          return null;
        }
        return response.json();
      })
      
          .then((data) => {
              if (!data) return;

          
              console.log("Datos del objeto:", data);

              
              const objectDate = data.objectDate ? data.objectDate : "Fecha no disponible";

              
              traducirObjeto(data, (dataTraducido) => {
               
                  objetosHtml += `
                      <div class="objeto">
                          <img src="${data.primaryImageSmall || "sin imagen.jpg"}" alt="${dataTraducido.titulo}" />
                          <div class="tooltip" data-tooltip="Fecha aproximada: ${objectDate}">
                              <span class="tooltip-content">
                                  ${objectDate} <br>
                                  </span>
                          </div>
                          <h4 class="titulo">${dataTraducido.titulo || "Sin Título"}</h4>
                          <h6 class="cultura">${dataTraducido.cultura || "Sin Datos"}</h6>
                          <h6 class="dinastia">${dataTraducido.dinastia || "Sin Datos"}</h6>

                          ${data.additionalImages && data.additionalImages.length > 0
                              ? `<button onclick="verMasImagenes(${objectId})">Ver más</button>`
                              : ""}
                      </div>`;

                  // Actualizamos el contenido de la grilla
                  document.getElementById("grilla").innerHTML = objetosHtml;
              });
          })
          .catch((error) => {
              console.error("Error al obtener objeto:", error);
          });
  });
}



function fetchObjetosWithPagination(page = 1) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage; 
  const paginatedObjectIDs = objectIDsGlobal.slice(start, end); 

  fetchObjetos(paginatedObjectIDs); 
}





function setupPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage); 
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; 

  
  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");
    button.textContent = page;
    button.classList.add("pagination-button");
    if (page === currentPage) {
      button.classList.add("active");
    }

   
    button.addEventListener("click", () => {
      currentPage = page;
      fetchObjetosWithPagination(currentPage); 
      setupPagination(totalItems); 
    });

    paginationContainer.appendChild(button);
  }
}







function verMasImagenes(objectId) {
  window.location.href = `verImagenes.html?objectId=${objectId}`;
}

function buildImageElement(imgUrl) {
  const image = document.createElement("img");
  image.src = imgUrl;
  image.alt = "Imagen adicional";
  return image;
}

function displayImages(data) {
  const galeria = document.getElementById("galeria");
  galeria.innerHTML = `<h2>${data.title}</h2>`;

  if (data.additionalImages.length === 0) {
    galeria.innerHTML += `<p>No hay imágenes adicionales disponibles.</p>`;
  } else {
    data.additionalImages.forEach((imgUrl) => {
      galeria.appendChild(buildImageElement(imgUrl));
    });
  }
}

function cargarImagenesAdicionales() {
  const urlParams = new URLSearchParams(window.location.search);
  const objectId = urlParams.get("objectId");

  fetch(URL_OBJETO + objectId)
    .then((response) => response.json())
    .then((data) => displayImages(data))
    .catch((error) => {
      console.error("Error:", error);
      
    });
}

if (window.location.pathname.includes("/verImagenes.html")) {
  cargarImagenesAdicionales();
}


function traducirObjeto(data, callback) {
  const { title, culture, dynasty } = data;

  console.log("Enviando datos para traducir:", { titulo: title, cultura: culture, dinastia: dynasty });

  fetch(URL_TRADUCIR, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: title, cultura: culture, dinastia: dynasty })
  })
    .then((response) => {
      if (!response.ok) throw new Error("Error en la solicitud de traducción");
      return response.json();
    })
    .then((dataTraducido) => {
      console.log("Datos traducidos recibidos:", dataTraducido);
      callback(dataTraducido);
    })
    .catch((error) => {
      console.error("Error en la traducción:", error);
      callback({
        titulo: title || "Sin Título",
        cultura: culture || "Sin Datos",
        dinastia: dynasty || "Sin Datos",
      });
    });
}

//PRUEBA DE CODIGOS


fetchDepartamentos();

fetch(URL_SEARCH_HASIMAGE).then((response)=> response.json()).then((data)=>{
  fetchObjetos(data.objectIDs.slice(0, 59));
})

document.getElementById("buscar").addEventListener("click", (event) => {
  event.preventDefault();


  const departamento = document.getElementById("departamento").value;
  const keyword = document.getElementById("keyword").value;
  const localizacion = document.getElementById("localizacion").value;


  if (!departamento && !keyword && !localizacion) {
    alert("Debe ingresar al menos un criterio de búsqueda");
    return;
  }

  
  const url = new URL(URL_SEARCH);  
  url.searchParams.set("hasImages", true);  
  if (keyword) url.searchParams.set("q", keyword);  
  if (departamento) url.searchParams.set("departmentId", departamento);  
  if (localizacion) url.searchParams.set("geoLocation", localizacion);  
 
  if (!keyword) {
    alert("Por favor, ingrese una palabra clave para la búsqueda.");
    return; 
  }

  
  if (!departamento && !localizacion) {
    alert("Debe ingresar al menos un criterio de búsqueda adicional (departamento o localización)");
    return;
  }
  // Ejecutar la búsqueda
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data.objectIDs || data.objectIDs.length === 0) {
        alert("No se encontraron objetos");
        return;
      }

      objectIDsGlobal = data.objectIDs; 
      currentPage = 1; 
      fetchObjetosWithPagination(currentPage); 
      setupPagination(objectIDsGlobal.length); 
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Se ha producido un error al realizar la búsqueda");
    });
});
