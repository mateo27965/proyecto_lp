package main

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"strings"
	"time"
)

// devuelve en una lista palabra por palabra
func ReadWordsFromFile(filename string) ([]string, error) {
	// Abrir el archivo de texto
	file, err := os.Open(filename)
	if err != nil {
		return nil, fmt.Errorf("error al abrir el archivo: %s", err)
	}
	defer file.Close()

	// Crear un escáner para leer el archivo
	scanner := bufio.NewScanner(file)

	// Leer las palabras del archivo y almacenarlas en una lista
	var words []string
	for scanner.Scan() {
		word := scanner.Text()
		words = append(words, word)
	}

	// Verificar si hubo algún error durante la lectura del archivo
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error al leer el archivo: %s", err)
	}

	return words, nil
}

type Usuarios struct {
	usuario                 string
	constraseña             string
	registroTexto           []string
	registroBusqueda        []string
	registroTiempo          []float64
	registroCantApariciones []int
	registroAlgoritmo       []string
}

type busqueda struct {
	textos        string
	contraseñas   map[string]string
	UsuarioActual *Usuarios
}

// Boyer-Moore
const alphabetSize = 256

func longestSuffixLength(pattern string, p int) int {
	length := 0
	i, j := p, len(pattern)-1

	for i >= 0 && pattern[i] == pattern[j] {
		length++
		i--
		j--
	}

	return length
}

func makeBadCharTable(pattern string) []int {
	table := make([]int, alphabetSize)

	for i := range table {
		table[i] = -1
	}

	for i, ch := range pattern {
		table[ch] = i
	}

	return table
}

func makeGoodSuffixTable(pattern string) []int {
	m := len(pattern)
	goodSuffixShift := make([]int, m)

	for i := range goodSuffixShift {
		goodSuffixShift[i] = m
	}

	lastPrefixPosition := m

	for i := m - 1; i >= 0; i-- {
		if lastPrefixPosition <= i+1 {
			lastPrefixPosition = i + 1
			for j := 0; j < m-i-1; j++ {
				if goodSuffixShift[j] == m {
					goodSuffixShift[j] = m - i - 1
				}
			}
		}
	}

	for i := 0; i < m-1; i++ {
		length := longestSuffixLength(pattern, i)
		goodSuffixShift[m-length-1] = m - i - 1
	}

	return goodSuffixShift
}

func searchBoyerMoore(text, pattern string) []string {
	n := len(text)
	m := len(pattern)
	positions := make([]string, 0)

	goodSuffixShift := makeGoodSuffixTable(pattern)
	badCharShift := makeBadCharTable(pattern)

	i := 0
	for i <= n-m {
		j := m - 1
		for j >= 0 && pattern[j] == text[i+j] {
			j--
		}

		if j < 0 {
			start := max(i-100, 0)
			end := min(i+m+100, n)
			positions = append(positions, text[start:end])

			if i+m < n {
				i += m - badCharShift[text[i+m]]
			} else {
				i += 1
			}
		} else {
			goodSuffixShiftValue := goodSuffixShift[j]
			badCharShiftValue := j - badCharShift[text[i+j]]
			i += max(goodSuffixShiftValue, badCharShiftValue)
		}
	}

	return positions
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Knuth-Morris-Pratt
func computeLPS(pattern string) []int {
	length := len(pattern)
	lps := make([]int, length)

	l := 0
	i := 1

	for i < length {
		if pattern[i] == pattern[l] {
			l++
			lps[i] = l
			i++
		} else {
			if l != 0 {
				l = lps[l-1]
			} else {
				lps[i] = 0
				i++
			}
		}
	}

	return lps
}

func KMP(text string, pattern string) []string {
	n := len(text)
	m := len(pattern)

	lps := computeLPS(pattern)

	result := []string{}
	i := 0
	j := 0

	for i < n {
		if pattern[j] == text[i] {
			i++
			j++
		}

		if j == m {
			startIndex := int(math.Max(float64(i-j-100), 0))
			endIndex := int(math.Min(float64(i+100), float64(n)))
			match := text[startIndex:endIndex]
			result = append(result, match)
			j = lps[j-1]
		} else if i < n && pattern[j] != text[i] {
			if j != 0 {
				j = lps[j-1]
			} else {
				i++
			}
		}
	}

	return result
}

// Fuerza bruta: Buscar la palabra(target) en textos
func FuerzaBruta(target string, textos string) []string {
	resultados := []byte(textos)

	results := []string{}
	index := -1

	for {
		index = strings.Index(string(resultados), target)
		if index == -1 {
			break
		}

		startIdx := index - 100
		if startIdx < 0 {
			startIdx = 0
		}

		endIdx := index + len(target) + 100
		if endIdx > len(resultados) {
			endIdx = len(resultados)
		}

		result := string(resultados[startIdx:endIdx])
		results = append(results, result)

		resultados = resultados[index+len(target):]
	}

	return results
}

// Función para registrar usuarios
func (s *busqueda) registrarUsuario(usuario, contraseña string) {
	s.contraseñas[usuario] = contraseña
}

// funcion para ingresar sesion
func (se *busqueda) IngresarSesion(usuario, contraseña string) bool {
	password := se.contraseñas[usuario]
	validar := password != "" && password == contraseña
	if validar {
		user := Usuarios{
			usuario:          usuario,
			constraseña:      contraseña,
			registroBusqueda: []string{},
		}
		se.UsuarioActual = &user
		return true
	}
	return false
}

func (se *busqueda) almacenarHistorial(consulta string, tiempo float64, cantApariciones int, algoritmo string, texto string) {
	se.UsuarioActual.registroBusqueda = append(se.UsuarioActual.registroBusqueda, consulta)
	se.UsuarioActual.registroAlgoritmo = append(se.UsuarioActual.registroAlgoritmo, algoritmo)
	se.UsuarioActual.registroCantApariciones = append(se.UsuarioActual.registroCantApariciones, cantApariciones)
	se.UsuarioActual.registroTexto = append(se.UsuarioActual.registroTexto, texto)
	se.UsuarioActual.registroTiempo = append(se.UsuarioActual.registroTiempo, tiempo)

}

// ORDENAR DE MAYOR A MENOR
type RegistroBusqueda struct {
	Texto           string
	Palabra         string
	Duracion        float64
	CantApariciones int
	Algoritmo       string
}

func burbuja(registros []RegistroBusqueda) {
	n := len(registros)
	aux := RegistroBusqueda{}
	for i := 0; i < n-1; i++ {
		for j := 0; j < n-i-1; j++ {
			if registros[j].CantApariciones < registros[j+1].CantApariciones {
				aux = registros[j]
				registros[j] = registros[j+1]
				registros[j+1] = aux
			}
		}
	}
}

func (se *busqueda) verHistorialBusqueda() {
	if se.UsuarioActual != nil {
		fmt.Printf("Historial de búsquedas para el usuario %s:\n", se.UsuarioActual.usuario)
		fmt.Printf("%-40s || %-30s || %-20s || %-25s || %-15s\n", " Texto elegido", "Palabra/oracion Busqueda", "Tiempo de duración", "Cantidad apariciones", "Algoritmo")

		registros := make([]RegistroBusqueda, len(se.UsuarioActual.registroBusqueda))
		for i := range se.UsuarioActual.registroBusqueda {
			registros[i] = RegistroBusqueda{
				Texto:           se.UsuarioActual.registroTexto[i],
				Palabra:         se.UsuarioActual.registroBusqueda[i],
				Duracion:        se.UsuarioActual.registroTiempo[i],
				CantApariciones: se.UsuarioActual.registroCantApariciones[i],
				Algoritmo:       se.UsuarioActual.registroAlgoritmo[i],
			}
		}

		burbuja(registros)

		for _, registro := range registros {
			fmt.Printf("%-40s || %-30s || %-20s || %-25d || %-15s\n", registro.Texto, registro.Palabra, fmt.Sprintf("%.2f s", registro.Duracion), registro.CantApariciones, registro.Algoritmo)
		}
	} else {
		fmt.Println("No se ha iniciado sesión.")
	}
}

func main() {

	buscador := busqueda{
		textos:        "",
		contraseñas:   map[string]string{},
		UsuarioActual: nil,
	}

	buscador.registrarUsuario("mateo123", "mateo000")
	buscador.registrarUsuario("cesar", "cesar123")
	buscador.registrarUsuario("arturo", "arturo123")
	buscador.registrarUsuario("javier", "javier123")
	buscador.registrarUsuario("usuario000", "user98")

	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Println("=== Inicio de sesión ===")
		fmt.Print("Usuario: ")
		usuario, _ := reader.ReadString('\n')
		usuario = strings.TrimSpace(usuario)

		fmt.Print("Contraseña: ")
		contraseña, _ := reader.ReadString('\n')
		contraseña = strings.TrimSpace(contraseña)

		if buscador.IngresarSesion(usuario, contraseña) {
			fmt.Printf("Inicio de sesión exitoso. ¡Bienvenido, %s!\n", usuario)
			break
		} else {
			fmt.Println("Usuario o contraseña incorrectos. Inténtelo nuevamente.")
		}
	}

	var texto string

	for {
		fmt.Println("\n=== Menú ===")
		fmt.Println("1. Libros")
		fmt.Println("2. Algoritmo Fuerza Bruta")
		fmt.Println("3. Algoritmo Knuth-Morris-Pratt")
		fmt.Println("4. Algoritmo Boyer-Moore")
		fmt.Println("5. Ver historial de búsquedas")
		fmt.Println("6. Salir")

		fmt.Print("Ingrese la opción: ")
		opcion, _ := reader.ReadString('\n')
		opcion = strings.TrimSpace(opcion)

		switch opcion {
		case "1":
			fmt.Println("\n=== Libros ===")
			fmt.Println("1. The Unhallowed Harvest")
			fmt.Println("2. Charmes")
			fmt.Println("3. Mary Rose a play in three acts")
			fmt.Println("4. Natalika")
			fmt.Println("5. The rambler club on the texas border")
			fmt.Println("6. El Quijote Apócrifo")
			fmt.Println("7. Salir al menú")
			fmt.Print("Ingrese la opción: ")
			libro, _ := reader.ReadString('\n')
			libro = strings.TrimSpace(libro)
			if libro == "1" {
				texto = "The Unhallowed Harvest"
			} else if libro == "2" {
				texto = "Charmes"
			} else if libro == "3" {
				texto = "Mary Rose a play in three acts"
			} else if libro == "4" {
				texto = "Natalika"
			} else if libro == "5" {
				texto = "The rambler club on the texas border"
			} else if libro == "6" {
				texto = "El Quijote Apócrifo"
			} else if libro == "7" {
				continue
			} else {
				fmt.Println("Opción inválida")
				continue
			}
			switch libro {
			case "1":
				filename := "the_unhallowed_harvest.txt"
				words, err := ReadWordsFromFile(filename)
				if err != nil {
					fmt.Println("Error:", err)
					return
				}
				cadena := strings.Join(words, " ")
				buscador.textos = cadena
				fmt.Println(cadena)

			case "2":
				filename := "charmes.txt"
				words, err := ReadWordsFromFile(filename)
				if err != nil {
					fmt.Println("Error:", err)
					return
				}
				cadena := strings.Join(words, " ")
				buscador.textos = cadena
				fmt.Println(cadena)

			case "3":
				filename := "mary_rose.txt"
				words, err := ReadWordsFromFile(filename)
				if err != nil {
					fmt.Println("Error:", err)
					return
				}
				cadena := strings.Join(words, " ")
				buscador.textos = cadena
				fmt.Println(cadena)
			case "4":
				filename := "natalika.txt"
				words, err := ReadWordsFromFile(filename)
				if err != nil {
					fmt.Println("Error:", err)
					return
				}
				cadena := strings.Join(words, " ")
				buscador.textos = cadena
				fmt.Println(cadena)
			case "5":
				filename := "the_rambler_club_on_the_texas_border.txt"
				words, err := ReadWordsFromFile(filename)
				if err != nil {
					fmt.Println("Error:", err)
					return
				}
				cadena := strings.Join(words, " ")
				buscador.textos = cadena
				fmt.Println(cadena)
			case "6":
				filename := "el_quijote_apocrifo.txt"
				words, err := ReadWordsFromFile(filename)
				if err != nil {
					fmt.Println("Error:", err)
					return
				}
				cadena := strings.Join(words, " ")
				buscador.textos = cadena
				fmt.Println(cadena)
			case "7":
				fmt.Println("Saliendo al menú...")
			default:
				fmt.Print("Ingrese una opción válida.")
			}

		case "2":
			algoritmo := "Fuerza Bruta"
			fmt.Print("Ingrese la palabra / oración a buscar: ")
			consulta, _ := reader.ReadString('\n')
			consulta = strings.TrimSpace(consulta)
			resultados := buscador.textos
			coincidencias := len(FuerzaBruta(consulta, resultados))
			tiempoTotal := 0.0
			startTime := time.Now()
			if coincidencias > 0 {
				bruteForceResults := FuerzaBruta(consulta, resultados)
				fmt.Println("1. Mostrar apariciones")
				fmt.Println("2. Ver apariciones")
				fmt.Println("3. Cancelar")
				fmt.Print("Ingrese la opción: ")
				opcions, _ := reader.ReadString('\n')
				opcions = strings.TrimSpace(opcions)
				switch opcions {
				case "1":
					fmt.Printf("Se encontraron %d resultado(s)\n", coincidencias)
					elapsedTime := time.Since(startTime)
					fmt.Println("Tiempo de ejecución de Algoritmo Fuerza Bruta:", elapsedTime)
					tiempoTotal = float64(elapsedTime) / 1000000000
				case "2":
					fmt.Println("Resultados de la búsqueda con fuerza bruta:")
					cancelarBusqueda := false
					posicionActual := 0
					continuarBucle := false // Variable para controlar si se debe continuar el bucle
					for !cancelarBusqueda {
						if continuarBucle {
							continuarBucle = false
						} else {
							fmt.Println("1. Siguiente")
							fmt.Println("2. Anterior")
							fmt.Println("3. Cancelar")
							fmt.Print("Ingrese la opción: ")
							apar, _ := reader.ReadString('\n')
							apar = strings.TrimSpace(apar)
							switch apar {
							case "1":
								if posicionActual < len(bruteForceResults) {
									fmt.Println()
									fmt.Println(bruteForceResults[posicionActual])
									fmt.Println()
									posicionActual++
									continuarBucle = true // Se permite continuar el bucle
								} else {
									fmt.Println("No hay más resultados.")
								}
							case "2":

								if posicionActual >= 0 {
									posicionActual--
									valido := posicionActual - 1
									if valido >= 0 {
										fmt.Println()
										fmt.Println(bruteForceResults[valido])
										fmt.Println()
										continuarBucle = true // Se permite continuar el bucle
									} else {
										fmt.Println("No es posible ver el anterior.")
										posicionActual++
									}
								} else {
									fmt.Println("No es posible ver el anterior.")
								}
							case "3":
								fmt.Println("Búsqueda cancelada")
								fmt.Println("Saliendo al menú...")
								cancelarBusqueda = true
							default:
								fmt.Println("Ingrese una opción válida.")
							}
						}
					}
				case "3":
					fmt.Println("Saliendo al menú...")
				default:
					fmt.Print("Ingrese una opción válida.")
				}
			} else {
				fmt.Println("No se encontraron resultados.")
				elapsedTime := time.Since(startTime)
				fmt.Println("Tiempo de ejecución de Algoritmo Fuerza Bruta:", elapsedTime)
			}
			buscador.almacenarHistorial(consulta, tiempoTotal, coincidencias, algoritmo, texto)
		case "3":
			algoritmo := "Knuth Morris Pratt"
			fmt.Print("Ingrese la palabra / oración a buscar: ")
			consulta, _ := reader.ReadString('\n')
			consulta = strings.TrimSpace(consulta)
			resultados := buscador.textos
			tiempoTotal := 0.0
			coincidencias := len(KMP(resultados, consulta))
			startTime := time.Now()
			if coincidencias > 0 {
				KMPResults := KMP(resultados, consulta)
				fmt.Println("1. Mostrar apariciones")
				fmt.Println("2. Ver apariciones")
				fmt.Println("3. Cancelar")
				fmt.Print("Ingrese la opción: ")
				opcions, _ := reader.ReadString('\n')
				opcions = strings.TrimSpace(opcions)
				switch opcions {
				case "1":
					fmt.Printf("Se encontraron %d resultado(s)\n", coincidencias)
					elapsedTime := time.Since(startTime)
					fmt.Println("Tiempo de ejecución de Algoritmo Knuth Morris Pratt:", elapsedTime)
					tiempoTotal = float64(elapsedTime) / 1000000000

				case "2":
					fmt.Println("Resultados de la búsqueda con Knuth Morris Pratt:")
					cancelarBusqueda := false
					posicionActual := 0
					continuarBucle := false // Variable para controlar si se debe continuar el bucle
					for !cancelarBusqueda {
						if continuarBucle {
							continuarBucle = false
						} else {
							fmt.Println("1. Siguiente")
							fmt.Println("2. Anterior")
							fmt.Println("3. Cancelar")
							fmt.Print("Ingrese la opción: ")
							apar, _ := reader.ReadString('\n')
							apar = strings.TrimSpace(apar)
							switch apar {
							case "1":
								if posicionActual < len(KMPResults) {
									fmt.Println()
									fmt.Println(KMPResults[posicionActual])
									fmt.Println()
									posicionActual++
									continuarBucle = true // Se permite continuar el bucle
								} else {
									fmt.Println("No hay más resultados.")
								}
							case "2":

								if posicionActual >= 0 {
									posicionActual--
									valido := posicionActual - 1
									if valido >= 0 {
										fmt.Println()
										fmt.Println(KMPResults[valido])
										fmt.Println()
										continuarBucle = true // Se permite continuar el bucle
									} else {
										fmt.Println("No es posible ver el anterior.")
										posicionActual++
									}
								} else {
									fmt.Println("No es posible ver el anterior.")
								}
							case "3":
								fmt.Println("Búsqueda cancelada")
								fmt.Println("Saliendo al menú...")
								cancelarBusqueda = true
							default:
								fmt.Println("Ingrese una opción válida.")
							}
						}
					}
				case "3":
					fmt.Println("Saliendo al menú...")
				default:
					fmt.Print("Ingrese una opción válida.")
				}
			} else {
				fmt.Println("No se encontraron resultados.")
				elapsedTime := time.Since(startTime)
				fmt.Println("Tiempo de ejecución de Algoritmo Knuth Morris Pratt:", elapsedTime)
			}
			buscador.almacenarHistorial(consulta, tiempoTotal, coincidencias, algoritmo, texto)
		case "4":
			algoritmo := "Boyer Moore"
			fmt.Print("Ingrese la palabra / oración a buscar: ")
			consulta, _ := reader.ReadString('\n')
			consulta = strings.TrimSpace(consulta)
			resultados := buscador.textos
			tiempoTotal := 0.0
			coincidencias := len(searchBoyerMoore(resultados, consulta))
			startTime := time.Now()
			if coincidencias > 0 {
				BoyerMooreResults := searchBoyerMoore(resultados, consulta)
				fmt.Println("1. Mostrar apariciones")
				fmt.Println("2. Ver apariciones")
				fmt.Println("3. Cancelar")
				fmt.Print("Ingrese la opción: ")
				opcions, _ := reader.ReadString('\n')
				opcions = strings.TrimSpace(opcions)
				switch opcions {
				case "1":
					fmt.Printf("Se encontraron %d resultado(s)\n", coincidencias)
					elapsedTime := time.Since(startTime)
					fmt.Println("Tiempo de ejecución de Algoritmo Boyer Moore:", elapsedTime)
					tiempoTotal = float64(elapsedTime) / 1000000000

				case "2":
					fmt.Println("Resultados de la búsqueda con Boyer Moore:")
					cancelarBusqueda := false
					posicionActual := 0
					continuarBucle := false // Variable para controlar si se debe continuar el bucle
					for !cancelarBusqueda {
						if continuarBucle {
							continuarBucle = false
						} else {
							fmt.Println("1. Siguiente")
							fmt.Println("2. Anterior")
							fmt.Println("3. Cancelar")
							fmt.Print("Ingrese la opción: ")
							apar, _ := reader.ReadString('\n')
							apar = strings.TrimSpace(apar)
							switch apar {
							case "1":
								if posicionActual < len(BoyerMooreResults) {
									fmt.Println()
									fmt.Println(BoyerMooreResults[posicionActual])
									fmt.Println()
									posicionActual++
									continuarBucle = true // Se permite continuar el bucle
								} else {
									fmt.Println("No hay más resultados.")
								}
							case "2":

								if posicionActual >= 0 {
									posicionActual--
									valido := posicionActual - 1
									if valido >= 0 {
										fmt.Println()
										fmt.Println(BoyerMooreResults[valido])
										fmt.Println()
										continuarBucle = true // Se permite continuar el bucle
									} else {
										fmt.Println("No es posible ver el anterior.")
										posicionActual++
									}
								} else {
									fmt.Println("No es posible ver el anterior.")
								}
							case "3":
								fmt.Println("Búsqueda cancelada")
								fmt.Println("Saliendo al menú...")
								cancelarBusqueda = true
							default:
								fmt.Println("Ingrese una opción válida.")
							}
						}
					}

				case "3":
					fmt.Println("Saliendo al menú...")
				default:
					fmt.Print("Ingrese una opción válida.")
				}
			} else {
				fmt.Println("No se encontraron resultados.")
				elapsedTime := time.Since(startTime)
				fmt.Println("Tiempo de ejecución de Algoritmo Boyer Moore:", elapsedTime)
			}
			buscador.almacenarHistorial(consulta, tiempoTotal, coincidencias, algoritmo, texto)

		case "5":
			buscador.verHistorialBusqueda()
		case "6":
			fmt.Println("¡Hasta luego!")
			return
		default:
			fmt.Println("Opción inválida. Inténtelo nuevamente.")
		}
	}
}
