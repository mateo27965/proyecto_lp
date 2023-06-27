import * as readline from 'readline';
import * as fs from 'fs';


const usuariosRegistrados = [
  { usuario: 'pepito', contraseña: 'pepe123' },
  { usuario: 'dota2', contraseña: 'xdd22' },
];

let busquedaTexto: string[] = [];
let busquedaPalabra: [string, number, number][] = [];
let nombreLIBRO: [string, string][] = [];

function leerNumero(): Promise<number> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('', (respuesta: string) => {
      rl.close();
      const numero = parseFloat(respuesta); // Convertir la respuesta a número
      resolve(numero);
    });
  });
}
function leerString(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('', (respuesta: string) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

function Verificar(usuario, contraseña) {
  for (let i = 0; i < usuariosRegistrados.length; i++) {
    if (usuariosRegistrados[i].usuario === usuario && usuariosRegistrados[i].contraseña === contraseña) {
      return true;
    }
  }
  return false;
}

async function IngresarAlSistema() {
  console.log("Ingrese el usuario: ");
  let usuario = await leerString();
  console.log("Ingrese la contraseña: ");
  let contraseña = await leerString();
  if (Verificar(usuario, contraseña)) {
        console.log("Bienvenido...");
        menu();
  } 
  else {
   console.log("No existe ningún usuario");
    IngresarAlSistema();
  }
}

async function menu() {
  console.log("---------------MENU------------");
  console.log("1) Registrar un texto.");
  console.log("2) Buscar una palabra");
  console.log("3) Ver historial de búsquedas.");
  console.log("4) Salir");
  console.log("Seleccione opcion: ");
  let opcion = await leerString();
    if (opcion === '1'){
      let cantidadDeLibro = 0;
      registroTexto();
    } else if (opcion === '2') {
      console.log("Seleccione una opción: ");
      console.log("1) Mostrar cantidad de apariciones: ");
      console.log("2) Ver apariciones");
      let opcion2 = await leerNumero();
      if(opcion2 === 1){
        console.log("Por favor seleccionar un algoritmo para la búsqueda, digite en número");
        console.log("->1) Fuerza Bruta");
        console.log("->2) KMP");
        console.log("->3) Boyer-Moore");
        let algoritmo = await leerNumero();
        if(algoritmo===1){
          cantidadAparicionesFB();
        }
        else if(algoritmo===2){
          cantidadAparicionesKMP();
        }
        else if(algoritmo===3){
          cantidadAparicionesBM();
        }
        else{
          console.log("El numero digitado no es válido,  Regresando...");
          menu();
        }
      }
      else if(opcion2 === 2){
        console.log("Por favor seleccionar un algoritmo para la búsqueda, digite en número");
        console.log("->1) Fuerza Bruta");
        console.log("->2) KMP");
        console.log("->3) Boyer-Moore");
        let algoritmo = await leerNumero();
        if(algoritmo===1){
          AparicionesFB();
        }
        else if(algoritmo===2){
          AparicionesKMP();
        }
        else if(algoritmo===3){
          AparicionesBM();
        }
        else{
          console.log("El numero digitado no es válido,  Regresando...");
          menu();
        }
      }
      else{
        console.log("El numero digitado no es válido,  Regresando...");
        menu();
      }
    } else if (opcion ==='3') {
      historial();
    } else {
      console.log("Saliendo..");
    }
}

async function registroTexto() {
  console.log("Por favor indique el nombre del texto: ");
  let nombre = await leerString();
  console.log("Por favor copie la ruta de su texto de esta forma: ./{nombre_del_texto}.txt ");
  let filePath = await leerString();
//existsSync: Se utiliza para comprabar la existencia de un archivo txt
  let libro1: string;
  if (fs.existsSync(filePath)) {
    libro1 = fs.readFileSync(filePath, 'utf-8');
    nombreLIBRO.push([nombre, libro1]);
    console.log("Texto registrado correctamente!");
    menu();
  } 
  else {
    console.log("El archivo no existe.");
    console.log("Por favor intentelo de nuevo\n\n");
    await registroTexto(); 
  }
}

//Algortimo FuerzaBruta
async function AparicionesFB() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < nombreLIBRO.length; i++) {
    console.log((i + 1) + ") " + nombreLIBRO[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < nombreLIBRO.length; i++) {
    if (nombredelibro === nombreLIBRO[i][0]) {
      libro = nombreLIBRO[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === nombreLIBRO.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = new Date().getTime();
    let apariciones = FB(libro, palabra);
    let final = new Date().getTime();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES:");
    for (let i = 0; i < apariciones.length; i++) {
      let inicio = apariciones[i];
      let fin = inicio + palabra.length;
      let contexto = libro.substring(inicio - 10, fin + 10);
      console.log(contexto + "\n");
    }
    busquedaPalabra.push([palabra,apariciones.length,(tiempotranscurrido/1000.0)]);
    menu();
  }
}

async function cantidadAparicionesFB() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < nombreLIBRO.length; i++) {
    console.log((i + 1) + ") " + nombreLIBRO[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < nombreLIBRO.length; i++) {
    if (nombredelibro === nombreLIBRO[i][0]) {
      libro = nombreLIBRO[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === nombreLIBRO.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = new Date().getTime();
    let apariciones = FB(libro, palabra);
    let final = new Date().getTime();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES");
    console.log(apariciones.length);
    busquedaPalabra.push([palabra,apariciones.length,(tiempotranscurrido/1000.0)]);
    menu();
  }
}
function FB(texto, patron) {
  let inicial = new Date().getTime();
  const apariciones = [];
  for (let i = 0; i <= texto.length - patron.length; i++) {
    let j;
    for (j = 0; j < patron.length; j++) {
      if (texto[i + j] !== patron[j]) {
        break;
      }
    }
    if (j === patron.length) {
      apariciones.push(i);
    }
  }
  let final = new Date().getTime();
  let tiempotranscurrido = final - inicial;
  return apariciones;
}





//algortimo KMP
async function AparicionesKMP() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < nombreLIBRO.length; i++) {
    console.log((i + 1) + ") " + nombreLIBRO[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < nombreLIBRO.length; i++) {
    if (nombredelibro === nombreLIBRO[i][0]) {
      libro = nombreLIBRO[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === nombreLIBRO.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = new Date().getTime();
    let apariciones = KMP(libro, palabra);
    let final = new Date().getTime();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES:");
    for (let i = 0; i < apariciones.length; i++) {
      let inicio = apariciones[i];
      let fin = inicio + palabra.length;
      let contexto = libro.substring(inicio - 10, fin + 10);
      console.log(contexto + "\n");
    }
    busquedaPalabra.push([palabra,apariciones.length,(tiempotranscurrido/1000.0)]);
    menu();
  }
}
async function cantidadAparicionesKMP() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < nombreLIBRO.length; i++) {
    console.log((i + 1) + ") " + nombreLIBRO[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < nombreLIBRO.length; i++) {
    if (nombredelibro === nombreLIBRO[i][0]) {
      libro = nombreLIBRO[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === nombreLIBRO.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = new Date().getTime();
    let apariciones = KMP(libro, palabra);
    let final = new Date().getTime();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES");
    console.log(apariciones.length);
    busquedaPalabra.push([palabra,apariciones.length,(tiempotranscurrido/1000.0)]);
    menu();
  }
}
function KMP(texto: string, patron: string): number[] {
  let inicial = new Date().getTime();
  const lps = calcularLPS(patron);
  const apariciones: number[] = [];

  let i = 0;
  let j = 0;
  while (i < texto.length) {
    if (texto[i] === patron[j]) {
      i++;
      j++;
    }

    if (j === patron.length) {
      apariciones.push(i - j);
      j = lps[j - 1];
    } else if (i < texto.length && texto[i] !== patron[j]) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }
  let final = new Date().getTime();
  let tiempotranscurrido = final - inicial;
  return apariciones;
}

function calcularLPS(patron: string): number[] {
  const lps: number[] = [];
  let len = 0;
  let i = 1;

  lps[0] = 0;
  while (i < patron.length) {
    if (patron[i] === patron[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }

  return lps;
}





//ALGORITMO DE BOOYER-MORE
async function AparicionesBM() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < nombreLIBRO.length; i++) {
    console.log((i + 1) + ") " + nombreLIBRO[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < nombreLIBRO.length; i++) {
    if (nombredelibro === nombreLIBRO[i][0]) {
      libro = nombreLIBRO[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === nombreLIBRO.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = new Date().getTime();
    let apariciones = BM(libro, palabra);
    let final = new Date().getTime();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES:");
    for (let i = 0; i < apariciones.length; i++) {
      let inicio = apariciones[i];
      let fin = inicio + palabra.length;
      let contexto = libro.substring(inicio - 10, fin + 10);
      console.log(contexto + "\n");
    }
    busquedaPalabra.push([palabra,apariciones.length,(tiempotranscurrido/1000.0)]);
    menu();
  }
}

async function cantidadAparicionesBM() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < nombreLIBRO.length; i++) {
    console.log((i + 1) + ") " + nombreLIBRO[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < nombreLIBRO.length; i++) {
    if (nombredelibro === nombreLIBRO[i][0]) {
      libro = nombreLIBRO[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === nombreLIBRO.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = new Date().getTime();
    let apariciones = BM(libro, palabra);
    let final = new Date().getTime();
    let tiempotranscurrido = final - inicial;

    console.log("\n\nAPARICIONES");
    console.log(apariciones.length);
    busquedaPalabra.push([palabra,apariciones.length,(tiempotranscurrido/1000.0)]);
    menu();
  }
}

function BM(texto: string, patron: string): number[] {
  const apariciones: number[] = [];
  const m = patron.length;
  const n = texto.length;
  const last = calcularLast(patron);

  let i = m - 1;
  let j = m - 1;

  while (i < n) {
    if (texto[i] === patron[j]) {
      if (j === 0) {
        apariciones.push(i);
        i = i + m;
        j = m - 1;
      } else {
        i--;
        j--;
      }
    } else {
      i = i + m - Math.min(j, 1 + last[texto.charCodeAt(i)]);
      j = m - 1;
    }
  }
  return apariciones;
}

function calcularLast(patron: string): number[] {
  const last: number[] = [];
  const m = patron.length;
  const maxChar = 256;

  for (let i = 0; i < maxChar; i++) {
    last[i] = -1;
  }

  for (let i = 0; i < m; i++) {
    last[patron.charCodeAt(i)] = i;
  }

  return last;
}
async function historial(){
  console.log("\nREGISTRO DE BUSQUEDAS DE LIBROS");
  for(let i=0; i<busquedaTexto.length;i++){
    console.log(busquedaTexto[i]);
  }
  console.log("\nREGISTRO DE BUSQUEDAS DE PALABRAS");
  for(let i=0; i<busquedaPalabra.length;i++){
    for(let j=0; j<(busquedaPalabra.length -1);j++){
      if(busquedaPalabra[j][1] < busquedaPalabra[j+1][1]){
        let aux = busquedaPalabra[j];
        busquedaPalabra[j] = busquedaPalabra[j+1];
        busquedaPalabra[j+1] = aux;
      }
    }
  }
  console.log("Palabra \tCantidadApariciones \tDuracionBusqueda(segundos)");
  for(let i=0; i<busquedaPalabra.length;i++){
    console.log(busquedaPalabra[i][0] + "\t\t\t" + busquedaPalabra[i][1] + "\t\t\t\t\t" + busquedaPalabra[i][2]);
  }
  menu();
}

IngresarAlSistema();