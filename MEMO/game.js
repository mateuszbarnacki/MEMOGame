document.addEventListener('DOMContentLoaded', () => {
	const grid = document.getElementById('grid');
	const button = document.getElementById('playAgainButton');
	const time = document.getElementById('time');
	const comparisons = document.getElementById('comparisons');
	// Licznik porównań
	var counter = 0;
	// Zmienna przechowująca liczby par
	var width = 10;
	// Służy do przechowywania kafelków
	var tiles = Array(width*2);
	// Służy do przechowywania cyferek znajdujących się na poszczególnych kafelkach.
	var tilesNums = Array(width*2);
	// Tablica do przechowywania odkrytych kafelków kafelków
	var choosenTiles = [];
	// Flaga służąca do funkcji obsługujących czasomierz
	var measureTime = false;
	// Zmienna licząca sekundy
	var clock = 0;
	// Zmienna potrzebna do rozpoczęcia mierzenia czasu
	var isFirstClick = true;
	// Zmienna potrzebna do sprawdzenia czy to nie koniec gry
	var isEnd = true;
	// Zmienna pomocnicza przy losowaniu liczb do gry
	var temp = -1;
	
	time.innerHTML = 'Czas: 0:00';
	comparisons.innerHTML = 'Liczba porównań: ' + counter;
	
	// Funkcja wyświetlająca zawartość kafelka po kliknięciu
	function showTile(e) {
			// Sprawdzamy czy to pierwsze kliknięcie w grze, jeżeli tak to zegar startuje
			if (isFirstClick) {
					isFirstClick = false;
					startTimer();
			}
			// Można pokazać co najwyżej dwa kafelki jednocześnie
			if (choosenTiles.length < 2) {
				// Pobranie identyfikatora kafelka
				var tmp = parseInt(e.target.getAttribute('id'));
				// Przypisanie liczby do div'a za pomocą innerHTML
				tiles[tmp].innerHTML = tilesNums[tmp];
				// Wyświetlenie zawartości znajdującej się pod kafelkiem
				if ((tmp+1)%5==0) tiles[tmp].setAttribute('style', `background-color: white; display: flex; align-items: center; justify-content: center; font-size: 24px;`);
				else tiles[tmp].setAttribute('style', `background-color: white; display: flex; align-items: center; justify-content: center; margin-right: 25px; font-size: 24px;`);
				
				// Jeżeli tablica przechowująca odsłonięte kafelki jest pusta dodajemy kafelek
				if (choosenTiles[0] === undefined) {
					choosenTiles.push(tiles[tmp]);
				} else {
					// Wiemy, że tablica zawiera jeden element. Sprawdzamy czy nie nastąpiło podwójne kliknięcie w ten sam element. Jeżeli do tego nie doszło, dodajemy do tablicy odsłoniętych kafelków drugi element.
					if (parseInt(choosenTiles[0].getAttribute('id')) != tmp) {
						choosenTiles.push(tiles[tmp]);
					}
				}
				if (choosenTiles.length == 2) {
					// Po odsłonięciu dwóch kafelków zwiększamy liczbę porównań
					counter++;
					// Odświeżenie licznika porównań
					refreshComparisons();
					// Wywołanie processClick po dwóch sekundach
					setTimeout(processClick, 2000);
				}
			}
	}
	
	/*
	Funkcja jest wykorzystywana, gdy mamy odkryte dwa kafelki. 
	*/
	function processClick() {
		var firstIdx = parseInt(choosenTiles[0].getAttribute('id'));
		var secondIdx = parseInt(choosenTiles[1].getAttribute('id'));
		// Spawdzamy czy na kafelkach są te same liczby i czy nie jest to ten sam kafelek (porównanie identyfikatorów)
		if (tilesNums[firstIdx] == tilesNums[secondIdx] && firstIdx != secondIdx) {
			temp = tilesNums[firstIdx];
			// Przeszukujemy całą tablicę, żeby 'wymazać' kafelki ze sparowaną liczbą
			for (let j = 0; j < 20; j++) {
				if (tilesNums[j] === temp) {
					// W tablicy z liczbami pola wymazane na stronie oznaczamy cyfrą 0
					tilesNums[j] = 0;
					tiles[j].innerHTML = '';
					// Wymazanie
					if ((j+1)%5==0) {
						tiles[j].setAttribute('style', `background-color: transparent;`);
					} else {
						tiles[j].setAttribute('style', `background-color: transparent; margin-right: 25px;`);
					}
					// Usunięcie event listener'ów z elementu, dzięki temu kafelek nie zareaguje na kliknięcie
					var clone = tiles[j].cloneNode(true);
					tiles[j].parentNode.replaceChild(clone, tiles[j]);
				}					
			}
		}
		// Jeżeli liczby na kafelkach nie są sobie równe to je ponownie zakrywamy
		for (let j = 0; j < 20; j++) {
			if (tilesNums[j] != 0) {
				tiles[j].innerHTML = '';
				if ((j+1)%5==0) tiles[j].setAttribute('style', `background-color: #bbf547;`);
				else tiles[j].setAttribute('style', `background-color: #bbf547; margin-right: 25px;`);
			}
		}
		// Wyczyszczenie tablicy przechowującej parę kafelków
		choosenTiles = [];
		// Sprawdzenie czy to jest koniec gry (koniec gry jest w momencie, gdy cała tablica jest wypełniona zerami)
		for (let i = 0; i < 2*width; i++) {
			if (tilesNums[i] != 0) {
				isEnd = false;
			}
		}
		if (isEnd) {
			stopTimer();
			// Przesłanie wyniku do bazy danych musi się odbyć z tego miejsca, stopTimer() jest wywoływany również w playAgain()
		} else {
			isEnd = true;
		}
	}
	
	/* 
	Uzupełniamy tablicę losowymi cyframi z zakresu 1-10 tak, aby były pary.
	*/
	function initialize() {
		var idx = 0;
		for (let i = 0; i < width*2; i++) {
			tilesNums[i] = -1;
		}
		for (let i = 0; i < width; i++) {
			for (let j = 0; j < 2; j++) {
				while (true) {
					idx = parseInt(Math.floor(Math.random()*20));
					if (tilesNums[idx] == -1) {
						tilesNums[idx] = parseInt(i)+1;
						break;
					}
				}
			}
		}
	}
	// Wywołanie funkcji
	initialize();
	
	/*
	Funkcja służy do przygotowania layout'u do prezentacji danych.
	Tworzone divy są zakrywane kolorem.
	Style div'ów są przypisywane w pliku js, ponieważ przy odkrywaniu kafelka
	zmieniamy styl div'a na białe tło z cyferką pośrodku.
	*/
	function createBoard() {
		for (let i = 0; i < 20; i++) {
			// Utworzenie kafelka
			const numLayout = document.createElement('div');
			// Przypisujemy atrybut, aby móc później zlokalizować odpowieni kafelek
			numLayout.setAttribute('id', i);
			// Zakrycie kafelka kolorem, if jest tylko dla wyśrodkowania kafelków
			if ((i+1)%5==0) numLayout.setAttribute('style', `background-color: #bbf547;`);
			else numLayout.setAttribute('style', `background-color: #bbf547; margin-right: 25px;`);
			// Ten event listener będzie się odbywał przed click, dlatego można tu dodać animację
			numLayout.addEventListener('mousedown', function(e) {
				// Tutaj można dodać animację obracania kafelka
			});
			// Reakcja div'ów na kliknięcie, w tym przypadku zmiana stylu wyświetlania diva
			numLayout.addEventListener('click', showTile, false);
			// Dodanie kafelków do głównego div'a board
			grid.appendChild(numLayout);
			// Przypisanie poszczególnego div'a do kolejnych elementów tablicy
			// Kolejność divów w tej tablicy odpowiada kolejności div'ów widocznych na stronie
			tiles[i] = numLayout;
		}
	}
	// Wywołanie funkcji
	createBoard();
	
	// Obsługa działania guzika ponownej gry
	function playAgain() {
		// Czyszczenie wszyskich koniecznych zmiennych/funkcji
		stopTimer();
		clock = 0;
		time.innerHTML = 'Czas: 0:00';
		isFirstClick = true;
		counter = 0;
		refreshComparisons();
		tiles = [];
		tiles = Array(2*width);
		tilesNums = [];
		tilesNums = Array(2*width);
		choosenTiles = [];
		temp = -1;
		while (grid.firstChild) {
			grid.removeChild(grid.lastChild);
		}
		initialize();
		createBoard();
	}
	button.onclick = playAgain;
	
	// Włączenie czasomierza
	function startTimer() {
		measureTime = true;
		refreshTimer();
	}
	
	// Działanie czasomierza
	function refreshTimer() {
		if (measureTime) {
			time.innerHTML = '';
			clock++;
			if (clock < 60) {
				if (clock < 10) {
					time.innerHTML = 'Czas: 0:0' + clock;
				} else {
					time.innerHTML = 'Czas: 0:' + clock;	
				}
			} else {
				var minutes = Math.floor(clock / 60);
				var seconds = clock % 60;
				
				if (seconds < 10) {
					time.innerHTML = 'Czas: ' + minutes + ':0' + seconds;
				} else {
					time.innerHTML = 'Czas: ' + minutes + ':' + seconds;
				}
			}
			setTimeout(refreshTimer, 1000);
		}
	}
	
	// Wyłączenie czasomierza
	function stopTimer() {
		measureTime = false;
	}
	
	// Odświeżenie liczby porównań
	function refreshComparisons() {
		comparisons.innerHTML = '';
		comparisons.innerHTML = 'Liczba porównań: ' + counter;
	}
});