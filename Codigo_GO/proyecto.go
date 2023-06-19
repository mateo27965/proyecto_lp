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
	usuario          string
	constraseña      string
	registroBusqueda []string
}

type busqueda struct {
	// si queremos agregar varios libros, podemos poner una cadena de string o sea []string
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
			badCharShiftValue := badCharShift[text[i+j]] - m + 1 + j
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

// funcio para ingresar sesion
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

func (se *busqueda) almacenarHistorial(consulta string) {
	se.UsuarioActual.registroBusqueda = append(se.UsuarioActual.registroBusqueda, consulta)

}

// concatenar si es que lo ponemos en lista
/*
func (se *busqueda) concatenarPalabras(consulta string) string {
	resultadoss := ""

	for _, texto := range se.textos {
		resultadoss += texto + " "
	}
	se.UsuarioActual.registroBusqueda = append(se.UsuarioActual.registroBusqueda, consulta)

	return resultadoss
}
*/

func (se *busqueda) verHistorialBusqueda() {
	if se.UsuarioActual != nil {
		fmt.Printf("Historial de búsquedas para el usuario %s:\n", se.UsuarioActual.usuario)

		for _, consulta := range se.UsuarioActual.registroBusqueda {
			fmt.Println(consulta)
		}
	} else {
		fmt.Println("No se ha iniciado sesión.")
	}

}

func main() {
	filename := "gutenberg.org_cache_epub_70967_pg70967.txt"
	words, err := ReadWordsFromFile(filename)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	buscador := busqueda{
		textos:        "",
		contraseñas:   map[string]string{},
		UsuarioActual: nil,
	}

	buscador.registrarUsuario("mateo123", "mateo000")
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

	for {
		fmt.Println("\n=== Menú ===")
		fmt.Println("1. Texto")
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
			cadena := strings.Join(words, " ")
			buscador.textos = cadena
			fmt.Println(cadena)
		case "2":
			fmt.Print("Ingrese la palabra / oración a buscar: ")
			consulta, _ := reader.ReadString('\n')
			consulta = strings.TrimSpace(consulta)
			resultados := buscador.textos
			buscador.almacenarHistorial(consulta)
			coincidencias := len(FuerzaBruta(consulta, resultados))
			startTime := time.Now()
			if coincidencias > 0 {

				bruteForceResults := FuerzaBruta(consulta, resultados)
				fmt.Println("Resultados de la búsqueda con fuerza bruta:")
				for _, result := range bruteForceResults {
					fmt.Println(result)
					fmt.Println()
				}
			} else {
				fmt.Println("No se encontraron resultados.")
			}
			elapsedTime := time.Since(startTime)
			fmt.Printf("Se encontraron %d resultado(s)\n", coincidencias)
			fmt.Println("Tiempo de ejecución de Algoritmo Fuerza Bruta:", elapsedTime)
		case "3":
			fmt.Print("Ingrese la palabra / oración a buscar: ")
			consulta, _ := reader.ReadString('\n')
			consulta = strings.TrimSpace(consulta)
			resultados := buscador.textos
			buscador.almacenarHistorial(consulta)
			coincidencias := len(KMP(resultados, consulta))
			startTime := time.Now()
			if coincidencias > 0 {
				KMPResults := KMP(resultados, consulta)
				fmt.Println("Resultados de la busqueda con KMP: ")
				for _, result := range KMPResults {
					fmt.Println(result)
					fmt.Println()
				}
			} else {
				fmt.Println("No se encontraron resultados.")
			}
			elapsedTime := time.Since(startTime)
			fmt.Printf("Se encontraron %d resultado(s)\n", coincidencias)
			fmt.Println("Tiempo de ejecución de Algoritmo KMP:", elapsedTime)
		case "4":
			fmt.Print("Ingrese la palabra / oración a buscar: ")
			consulta, _ := reader.ReadString('\n')
			consulta = strings.TrimSpace(consulta)
			resultados := buscador.textos
			buscador.almacenarHistorial(consulta)
			coincidencias := len(searchBoyerMoore(resultados, consulta))
			startTime := time.Now()
			if coincidencias > 0 {
				BoyerMooreResults := searchBoyerMoore(resultados, consulta)
				fmt.Println("Resultados de la busqueda con Boyer Moore: ")
				for _, result := range BoyerMooreResults {
					fmt.Println(result)
					fmt.Println()
				}
			} else {
				fmt.Println("No se encontraron resultados.")
			}
			elapsedTime := time.Since(startTime)
			fmt.Printf("Se encontraron %d resultado(s)\n", coincidencias)
			fmt.Println("Tiempo de ejecución de Algoritmo Boyer-Moore:", elapsedTime)

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