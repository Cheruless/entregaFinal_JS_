class listaUsuarios{
  constructor() {
    this.listUsers = [];
  }

  agregarUsuario(user) {
    this.listUsers.push(user);
  }
}

class User {
  constructor(pass, persona) {
    this.username = persona.calcularUsername();
    this.password = pass;
    this.Persona = persona;
  }
}

class Persona {
  constructor(nombre, apellido, dni) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.Trabajo = undefined;
  }

  asignarTrabajo(trabajo){
    this.Trabajo = trabajo;
  }

  calcularSueldo(){
    if(this.Trabajo)
      return (this.Trabajo.horasTrabajo * 4) * this.Trabajo.pagoPorHora;
    return 0;
  }

  calcularUsername() {
    const nombreInicial = this.nombre.charAt(0).toLowerCase();
    const apellidoMinusculas = this.apellido.toLowerCase();
    return nombreInicial + apellidoMinusculas;
  }
}

class Trabajos {
  constructor() {
    this.listaTrabajos = [];
  }

  agregarTrabajo(trabajo){
    this.listaTrabajos.push(trabajo);
  }
}

class Trabajo {
  constructor(seccion, horasTrabajo) {
    this.seccion = seccion;
    this.horasTrabajo = horasTrabajo;
    this.pagoPorHora = 2700;
  }

  get tipoContrato() {
    return this.horasTrabajo <= 20 ? "Part-time" : "Full-time";
  }
}

// ----------- FUNCIONES
function cargarUsuariosDesdeLocalStorage() {
  const usuariosJSON = localStorage.getItem('usuarios');
  if (usuariosJSON) {
    const usuariosGuardados = JSON.parse(usuariosJSON);
    if (Array.isArray(usuariosGuardados)) {
      usuarios.listUsers = usuariosGuardados;
    }
  }
}

// Almacenar usuarios en el almacenamiento local
function guardarUsuariosEnLocalStorage(usuarios) {
  const usuariosJSON = JSON.stringify(usuarios);
  localStorage.setItem('usuarios', usuariosJSON);
}

// Verifica el inicio de sesión
function loginUser(username, password) {
  // Buscar el usuario por su nombre de usuario
  const user = usuarios.listUsers.find(user => user.username === username);

  if (user && user.password === password) {
    return user.Persona;
  }
  return null;
}

// Función para mostrar los datos de la persona
function mostrarDatosUsuario(persona) {
  userNameElement.textContent = persona.nombre;
  userLastnameElement.textContent = persona.apellido;
  userDniElement.textContent = persona.dni;
  userJobElement.textContent = persona.Trabajo.seccion;
  userContractTypeElement.textContent = persona.Trabajo.tipoContrato;
  userWorkHoursElement.textContent = persona.Trabajo.horasTrabajo;
  userSalaryElement.textContent = persona.calcularSueldo();
}


function mostrarDatosUsuarioNuevo(newUser) {
  registroExitoso.innerHTML = `
    <h2><strong>Registro exitoso</strong></h2>
    <p>Tus datos de ingreso son:</p>
    <p>Usuario: ${newUser.username}</p>
    <p>Contraseña: ${newUser.password}</p>
    <button id="back-login">Iniciar Sesión</button>
  `;

  const backButton = document.getElementById("back-login");
  backButton.addEventListener("click", () =>{
    dataContainer.style.display = "none";
    registroExitoso.style.display = "none";
    loginContainer.style.display = "block";

  });

}

// ----------- SIMULADOR

const usuarios = new listaUsuarios();

async function cargarUsuariosDesdeJSON() {
  try {
    const response = await fetch('./js/usuarios.json');
    const data = await response.json();

    data.forEach(userJSON => {
      // se crea una variable de la clase Persona utilizando los datos del JSON.
      const persona = new Persona(userJSON.Persona.nombre, userJSON.Persona.apellido, userJSON.Persona.dni);

      // se le da un trabajo a la persona utilizando los datos del JSON.
      persona.asignarTrabajo(new Trabajo(userJSON.Persona.Trabajo.seccion, userJSON.Persona.Trabajo.horasTrabajo));

      // y esto para usar la variable persona.calcularUsername lptm que estresssss
      const newUser = new User(userJSON.password, persona);

      // agregamos el nuevo usuario a la lista de usuarios.
      usuarios.agregarUsuario(newUser);
    });

  } catch (error) {
    console.error('Error al cargar usuarios desde usuarios.json:', error);
  }
}

// Llama a esta función al inicio de tu aplicación
cargarUsuariosDesdeLocalStorage();
cargarUsuariosDesdeJSON();

console.log(usuarios.listUsers);

// INICIO

// Obtener elementos del DOM
const loginContainer = document.getElementById("login-container");
const dataContainer = document.getElementById("data-container");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const userNameElement = document.getElementById("user-name");
const userLastnameElement = document.getElementById("user-lastname");
const userDniElement = document.getElementById("user-dni");
const userJobElement = document.getElementById("user-job");
const userContractTypeElement = document.getElementById("user-contract-type");
const userWorkHoursElement = document.getElementById("user-work-hours");
const userSalaryElement = document.getElementById("user-salary");

// Función para manejar el evento de inicio de sesión

loginButton.addEventListener("click", () => {
  const username = usernameInput.value;
  const password = passwordInput.value;
  const persona = loginUser(username, password);

  if (persona) {
    // Si el inicio de sesión es válido, oculta el contenedor de inicio de sesión y muestra los datos del usuario
    loginContainer.style.display = "none";
    dataContainer.style.display = "block";
    Toastify({
      text: "Inicio Exitoso",
      duration: 3000, // Duración en milisegundos
      close: true, // Mostrar el botón de cierre
      gravity: "top", // Posición de la notificación
      position: "right", // Posición en el centro
      backgroundColor: "green", // Color de fondo
    }).showToast();
    mostrarDatosUsuario(persona);
  } else {
    // Si el inicio de sesión no es válido, muestra un mensaje de error
    Swal.fire({
      icon: 'warning',
      title: 'Ups...',
      text: 'Nombre de usuario y/o contraseña incorrectos.',
      confirmButtonText: 'Reintentar'
    })
  }
});

// Función para manejar el evento de cierre de sesión
logoutButton.addEventListener("click", () => {
  // Mostrar SweetAlert para confirmar el cierre de sesión
  Swal.fire({
    title: "¿Estás seguro de cerrar sesión?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, cerrar sesión",
    cancelButtonText: "No, cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      // El usuario ha confirmado cerrar sesión
      // Limpia los campos y muestra el contenedor de inicio de sesión
      usernameInput.value = "";
      passwordInput.value = "";
      loginContainer.style.display = "block";
      dataContainer.style.display = "none";

      Toastify({
        text: "Sesión cerrada con éxito.",
        backgroundColor: "green",
        close: true,
      }).showToast();

    }
  });
});

// REGISTRO
// Obtener elementos del DOM
const registrationForm = document.getElementById("registration-form");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const dniInput = document.getElementById("dni");
const seccionSelect = document.getElementById("seccion");
const tipoContratoSelect = document.getElementById("tipo-contrato");
const registrarButton = document.getElementById("registrar-button");
const registroExitoso = document.getElementById("registro-exitoso");

// Obtener el botón "Registrarse"
const registerButton = document.getElementById("register-button");

// Obtener los elementos de los formularios de inicio de sesión y registro

// Agregar un evento de clic al botón "Registrarse"
registerButton.addEventListener("click", () => {
  // Ocultar el formulario de inicio de sesión
  loginContainer.style.display = "none";
  // Mostrar el formulario de registro
  registrationForm.style.display = "block";
});

// maneja el evento de registro
registrarButton.addEventListener("click", () => {
  // Obtener los valores ingresados por el usuario
  const nombre = nombreInput.value.charAt(0).toUpperCase() + nombreInput.value.slice(1).toLowerCase();
  const apellido = apellidoInput.value.charAt(0).toUpperCase() + apellidoInput.value.slice(1).toLowerCase();
  const dni = dniInput.value;
  const seccion = seccionSelect.value;
  const tipoContrato = tipoContratoSelect.value;
  const horas = tipoContrato === "Part-time" ? 20 : 42;

  // Validar que se hayan ingresado todos los datos
  if (nombre && apellido && dni && seccion && tipoContrato) {
    const persona = new Persona(nombre, apellido, dni);
    const trabajo = new Trabajo(seccion, horas);
    persona.asignarTrabajo(trabajo);

    const newUser = new User("password", persona);

    // Agregar el nuevo usuario a la lista de usuarios
    usuarios.agregarUsuario(newUser);
    guardarUsuariosEnLocalStorage(usuarios);

    // Mostrar los datos de la nueva persona
    mostrarDatosUsuario(newUser);

    // Mostrar un mensaje de registro exitoso y ocultar el formulario
    registroExitoso.style.display = "block";
    registrationForm.style.display = "none";

  } else {
    alert("Por favor, complete todos los campos.");
  }
});