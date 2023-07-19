import * as readline from 'readline';
import * as fs from 'fs';
const Table = require('cli-table3');

const usuariosRegistrados = [
  { usuario: 'cesar', contraseña: 'cesar123' },
  { usuario: 'mateo', contraseña: 'mateo123' },
  { usuario: 'javier', contraseña: 'javier123' },
  { usuario: 'arturo', contraseña: 'arturo123' },
];

let busquedaTexto: string[] = [];
let busquedaPalabra: [string, number, number, string][] = [];
let Biblioteca: [string, string][] = [];

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

function Verificar(usuario: string, contraseña: string) {
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
  console.log("===============MENU===============");
  console.log("1) Registrar un texto");
  console.log("2) Buscar una palabra");
  console.log("3) Ver historial de búsquedas");
  console.log("4) Salir");
  console.log("==================================")
  console.log("Seleccione opcion: ");
  let opcion = await leerString();
  if (opcion === '1') {
    registroTexto();
  } else if (opcion === '2') {
    console.log("Seleccione una opción: ");
    console.log("1) Mostrar cantidad de apariciones ");
    console.log("2) Ver apariciones");
    let opcion2 = await leerNumero();
    if (opcion2 === 1) {
      console.log("Por favor seleccionar un algoritmo para la búsqueda, digite en número");
      console.log("1) Fuerza Bruta");
      console.log("2) KMP");
      console.log("3) Boyer-Moore");
      let algoritmo = await leerNumero();
      if (algoritmo === 1) {
        cantidadAparicionesFB();
      }
      else if (algoritmo === 2) {
        cantidadAparicionesKMP();
      }
      else if (algoritmo === 3) {
        cantidadAparicionesBM();
      }
      else {
        console.log("El numero digitado no es válido,  Regresando...");
        menu();
      }
    }
    else if (opcion2 === 2) {
      console.log("Por favor seleccionar un algoritmo para la búsqueda, digite en número");
      console.log("1) Fuerza Bruta");
      console.log("2) KMP");
      console.log("3) Boyer-Moore");
      let algoritmo = await leerNumero();
      if (algoritmo === 1) {
        AparicionesFB();
      }
      else if (algoritmo === 2) {
        AparicionesKMP();
      }
      else if (algoritmo === 3) {
        AparicionesBM();
      }
      else {
        console.log("El numero digitado no es válido,  Regresando...");
        menu();
      }
    }
    else {
      console.log("El numero digitado no es válido,  Regresando...");
      menu();
    }
  } else if (opcion === '3') {
    historial();
  } else {
    console.log("Saliendo..");
  }
}

async function registroTexto() {
  console.log("Por favor indique el nombre del texto: ");
  let nombre = await leerString();
  console.log("Por favor copie la ruta de su texto iniciando con: ./");
  let filePath = await leerString();
  //existsSync: Se utiliza para comprabar la existencia de un archivo txt
  let libro1: string;
  if (fs.existsSync(filePath)) {
    libro1 = fs.readFileSync(filePath, 'utf-8');
    Biblioteca.push([nombre, libro1]);
    console.log("Texto registrado correctamente!");
    menu();
  }
  else {
    console.log("El archivo no existe.");
    console.log("Regresando....\n\n");
    menu();
  }
}

//Algortimo FuerzaBruta
async function AparicionesFB() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < Biblioteca.length; i++) {
    console.log((i + 1) + ") " + Biblioteca[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < Biblioteca.length; i++) {
    if (nombredelibro === Biblioteca[i][0]) {
      libro = Biblioteca[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === Biblioteca.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
     console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = performance.now();
    let apariciones = KMP(libro, palabra);
    let final = performance.now();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES:");
    let aparicionesString: string[] = [];
    for(let i=0; i<apariciones.length;i++){
      let registro = "";
        if(apariciones[i] <= 100){
          for(let j = 0; j < apariciones[i] + 100; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          }    
        }else if( apariciones[i] + palabra.length >= libro.length - 100){
          for(let j = apariciones[i] - 100; j < libro.length; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          } 
        } else{
          for(let j = apariciones[i] - 100; j < apariciones[i] + 100; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          } 
        }
      aparicionesString.push(registro);
    }
    if(apariciones.length === 0){
      console.log("No se encontró apariciones. ")
    }else{    
      let i = 0;
      while(i!=aparicionesString.length){
        console.log("------------------------------------------------------------------------");
        console.log(aparicionesString[i]);
        console.log("------------------------------------------------------------------------");
        if(i===0){
          console.log("Digite una opcion: ");
          console.log("1) Siguiente");
          console.log("2) Salir");
          let opcion1_1 = await leerNumero();
          if(opcion1_1 === 1){
            i++;
          }else if(opcion1_1 === 2){
            console.log("Saliendo...");
            break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }else if(i===((aparicionesString.length)-1)){
          console.log("Digite una opcion: ");
          console.log("1) Anterior");
          console.log("2) Salir");
          let opcion1_2 = await leerNumero();
          if(opcion1_2 === 1){
            i--;
          }else if(opcion1_2 === 2){
            console.log("Saliendo...");
            break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }else{
          console.log("Digite una opcion: ");
          console.log("1) Siguiente");
          console.log("2) Anterior");
          console.log("3) Salir")
          let opcion1_3 = await leerNumero();
          if(opcion1_3 === 1){
            i++;
          }else if(opcion1_3 === 2){
            i--;
          }else if(opcion1_3 === 3){
              console.log("Saliendo...");
              break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }
      }
      busquedaPalabra.push([palabra, apariciones.length, tiempotranscurrido/1000.0, "Fuerza bruta"]);
    }
    menu();
  }
}

async function cantidadAparicionesFB() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < Biblioteca.length; i++) {
    console.log((i + 1) + ") " + Biblioteca[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < Biblioteca.length; i++) {
    if (nombredelibro === Biblioteca[i][0]) {
      libro = Biblioteca[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === Biblioteca.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = performance.now();
    let apariciones = FB(libro, palabra);
    let final = performance.now();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES");
    console.log(apariciones.length);
    console.log("Tiempo de busqueda en segundos");
    console.log(tiempotranscurrido/1000.0);
    busquedaPalabra.push([palabra, apariciones.length, tiempotranscurrido/1000.0, "Fuerza Bruta"]);
    menu();
  }
}
function FB(texto: string, patron: string) {
  let inicial = new Date().getTime();
  const apariciones = [];
  for (let i = 0; i <= texto.length - patron.length; i++) {
    let m=0;
    for (let j = 0; j < patron.length; j++) {
      if (texto[i + j] !== patron[j]) {
        break;
      }
      m++;
    }
    if (m === patron.length) {
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
  for (let i = 0; i < Biblioteca.length; i++) {
    console.log((i + 1) + ") " + Biblioteca[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < Biblioteca.length; i++) {
    if (nombredelibro === Biblioteca[i][0]) {
      libro = Biblioteca[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === Biblioteca.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = performance.now();
    let apariciones = KMP(libro, palabra);
    let final = performance.now();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES:");
    let aparicionesString: string[] = [];
    for(let i=0; i<apariciones.length;i++){
      let registro = "";
        if(apariciones[i] <= 100){
          for(let j = 0; j < apariciones[i] + 100; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          }    
        }else if( apariciones[i] + palabra.length >= libro.length - 100){
          for(let j = apariciones[i] - 100; j < libro.length; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          } 
        } else{
          for(let j = apariciones[i] - 100; j < apariciones[i] + 100; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          } 
        }
      aparicionesString.push(registro);
    }
      
  
    if(apariciones.length === 0){
      console.log("No se encontró apariciones. ")
    }else{    
      let i = 0;
      while(i!=aparicionesString.length){
        console.log("------------------------------------------------------------------------");
        console.log(aparicionesString[i]);
        console.log("------------------------------------------------------------------------");
        if(i===0){
          console.log("Digite una opcion: ");
          console.log("1) Siguiente");
          console.log("2) Salir");
          let opcion1_1 = await leerNumero();
          if(opcion1_1 === 1){
            i++;
          }else if(opcion1_1 === 2){
            console.log("Saliendo...");
            break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }else if(i===((aparicionesString.length)-1)){
          console.log("Digite una opcion: ");
          console.log("1) Anterior");
          console.log("2) Salir");
          let opcion1_2 = await leerNumero();
          if(opcion1_2 === 1){
            i--;
          }else if(opcion1_2 === 2){
            console.log("Saliendo...");
            break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }else{
          console.log("Digite una opcion: ");
          console.log("1) Siguiente");
          console.log("2) Anterior");
          console.log("3) Salir")
          let opcion1_3 = await leerNumero();
          if(opcion1_3 === 1){
            i++;
          }else if(opcion1_3 === 2){
            i--;
          }else if(opcion1_3 === 3){
              console.log("Saliendo...");
              break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }
      }
      busquedaPalabra.push([palabra, apariciones.length, tiempotranscurrido/1000.0, "KMP"]);
    }
    
    menu();
  }
}
async function cantidadAparicionesKMP() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < Biblioteca.length; i++) {
    console.log((i + 1) + ") " + Biblioteca[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < Biblioteca.length; i++) {
    if (nombredelibro === Biblioteca[i][0]) {
      libro = Biblioteca[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === Biblioteca.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = performance.now();
    let apariciones = KMP(libro, palabra);
    let final = performance.now();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES");
    console.log(apariciones.length);
    console.log("Tiempo de busqueda en segundos");
    console.log(tiempotranscurrido/1000.0);
    busquedaPalabra.push([palabra, apariciones.length, tiempotranscurrido/1000., "KMP"]);
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
  for (let i = 0; i < Biblioteca.length; i++) {
    console.log((i + 1) + ") " + Biblioteca[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < Biblioteca.length; i++) {
    if (nombredelibro === Biblioteca[i][0]) {
      libro = Biblioteca[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === Biblioteca.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
     console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = performance.now();
    let apariciones = KMP(libro, palabra);
    let final = performance.now();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES:");
    let aparicionesString: string[] = [];
    for(let i=0; i<apariciones.length;i++){
      let registro = "";
        if(apariciones[i] <= 100){
          for(let j = 0; j < apariciones[i] + 100; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          }    
        }else if( apariciones[i] + palabra.length >= libro.length - 100){
          for(let j = apariciones[i] - 100; j < libro.length; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          } 
        } else{
          for(let j = apariciones[i] - 100; j < apariciones[i] + 100; j++){
            if(j == apariciones[i]-1){
                registro = registro +  libro[j] + "(" ;
            }else if(j ==  apariciones[i] + palabra.length){
                registro = registro + ")" + libro[j] ;
            }else{
                registro = registro + libro[j];
            }
          } 
        }
      aparicionesString.push(registro);
    }
    if(apariciones.length === 0){
      console.log("No se encontró apariciones. ")
    }else{    
      let i = 0;
      while(i!=aparicionesString.length){
        console.log("------------------------------------------------------------------------");
        console.log(aparicionesString[i]);
        console.log("------------------------------------------------------------------------");
        if(i===0){
          console.log("Digite una opcion: ");
          console.log("1) Siguiente");
          console.log("2) Salir");
          let opcion1_1 = await leerNumero();
          if(opcion1_1 === 1){
            i++;
          }else if(opcion1_1 === 2){
            console.log("Saliendo...");
            break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }else if(i===((aparicionesString.length)-1)){
          console.log("Digite una opcion: ");
          console.log("1) Anterior");
          console.log("2) Salir");
          let opcion1_2 = await leerNumero();
          if(opcion1_2 === 1){
            i--;
          }else if(opcion1_2 === 2){
            console.log("Saliendo...");
            break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }else{
          console.log("Digite una opcion: ");
          console.log("1) Siguiente");
          console.log("2) Anterior");
          console.log("3) Salir")
          let opcion1_3 = await leerNumero();
          if(opcion1_3 === 1){
            i++;
          }else if(opcion1_3 === 2){
            i--;
          }else if(opcion1_3 === 3){
              console.log("Saliendo...");
              break;
          }else{
            console.log("Numero incorrecto, regresando..");
            break;
          }
        }
      }
      busquedaPalabra.push([palabra, apariciones.length, tiempotranscurrido/1000.0, "B-M"]);
    }
    menu();
  }
}

async function cantidadAparicionesBM() {
  console.log("Por favor, digite el nombre del libro!\n");
  console.log("Libros registrados en el sistema:");
  for (let i = 0; i < Biblioteca.length; i++) {
    console.log((i + 1) + ") " + Biblioteca[i][0]);
  }
  console.log(" ");
  let nombredelibro = await leerString();
  busquedaTexto.push(nombredelibro);
  let libro = "";
  let validar = 0;
  for (let i = 0; i < Biblioteca.length; i++) {
    if (nombredelibro === Biblioteca[i][0]) {
      libro = Biblioteca[i][1];
      break;
    }
    validar = validar + 1;
  }
  if (validar === Biblioteca.length) {
    console.log("No se encontró el libro: ");
    menu();
  } else {
    console.log("¿Qué palabra buscas?: ");
    let palabra = await leerString();
    let inicial = performance.now();
    let apariciones = BoyerMoore(libro, palabra);
    let final = performance.now();
    let tiempotranscurrido = final - inicial;
    console.log("\n\nAPARICIONES");
    console.log(apariciones.length);
    console.log("Tiempo de busqueda en segundos");
    console.log(tiempotranscurrido/1000.0);
    busquedaPalabra.push([palabra, apariciones.length, tiempotranscurrido/1000.0,"B-M"]);
    menu();
  }
}

function BoyerMoore(texto: string, patron: string): number[] {
  const lastOccurrence = buildLastOccurrence(patron, texto);
  const apariciones: number[] = [];

  let i = 0;
  while (i <= texto.length - patron.length) {
    let j = patron.length - 1;

    while (j >= 0 && texto[i + j] === patron[j]) {
      j--;
    }

    if (j === -1) {
      apariciones.push(i);
      i++;
    } else {
      const last = lastOccurrence[texto[i + j].charCodeAt(0)];
      i += Math.max(1, j - last);
    }
  }
  return apariciones;
}

function buildLastOccurrence(patron: string, texto: string): number[] {
  const lastOccurrence: number[] = new Array(texto.length).fill(-1);
  for (let i = 0; i < patron.length; i++) {
    lastOccurrence[patron[i].charCodeAt(0)] = i;
  }
  return lastOccurrence;
}


async function historial() {
  console.log("\nREGISTRO DE BUSQUEDAS DE LIBROS");
  
  // Crear tabla para el registro de búsquedas de libros
  const tableLibros = new Table({
    head: ['Búsqueda de Libros'],
    colWidths: [50],
  });

  for (let i = 0; i < busquedaTexto.length; i++) {
    tableLibros.push([busquedaTexto[i]]);
  }
  
  console.log(tableLibros.toString()); // Mostrar la tabla

  console.log("\nREGISTRO DE BUSQUEDAS DE PALABRAS(Palabra,CantidadApariciones,DuracionBusqueda(segundos),Algoritmo)");

  // Ordenar el arreglo de busquedaPalabra por cantidad de apariciones (según tu código original)
  for (let i = 0; i < busquedaPalabra.length; i++) {
    for (let j = 0; j < (busquedaPalabra.length - 1); j++) {
      if (busquedaPalabra[j][1] < busquedaPalabra[j + 1][1]) {
        let aux = busquedaPalabra[j];
        busquedaPalabra[j] = busquedaPalabra[j + 1];
        busquedaPalabra[j + 1] = aux;
      }
    }
  }

  // Crear tabla para el registro de búsquedas de palabras
  const tablePalabras = new Table({
    head: ['Palabra', 'Cantidad de Apariciones', 'Duración de Búsqueda (segundos)', 'Algoritmo'],
    colWidths: [15, 25, 30, 20],
  });

  for (let i = 0; i < busquedaPalabra.length; i++) {
    tablePalabras.push([busquedaPalabra[i][0], busquedaPalabra[i][1], busquedaPalabra[i][2], busquedaPalabra[i][3]]);
  }
  
  console.log(tablePalabras.toString()); // Mostrar la tabla

  menu();
}

IngresarAlSistema();
