
# Projekt zaliczeniowy z laboratorium "Szkielety programistyczne w aplikacjach internetowych"

## Tematyka projektu
Aplikacja do recenzji restauracji

## Autor
Hubert Szelepusta

## Funkcjonalności
- Logowanie
- Rejestracja
- Przeglądanie restauracji z opcją filtrowania
- Dodawanie restauracji z dołączonym zdjęciem restauracji
- Przeglądanie recenzji restauracji
- Przeglądanie moich recenzji
- Dodawanie recenzji z dołączonymi zdjęciami
- Edytowanie recenzji
- Usuwanie recenzji
- Wizualizacja średnich ocen restauracji
- Wizualizacja moich ocen zrecenzowanych przeze mnie restauracji
- Wizualizacja rozkładu ocen restauracji

## Narzędzia i technologie

### Frontend
- Node: v22.12.0
- @tailwindcss/vite: ^4.1.7
- axios: ^1.9.0
- chartjs: ^0.3.24
- react: ^19.1.0
- react-chartjs-2: ^5.3.0
- react-dom: ^19.1.0
- react-hot-toast: ^2.5.2
- react-router-dom: ^7.6.0
- tailwindcss: ^4.1.7

### Backend
- Node: v22.12.0
- bcryptjs: ^3.0.2
- cookie-parser: ~1.4.4
- cors: ^2.8.5
- debug: ~2.6.9
- dotenv: ^16.5.0
- express: ~4.16.1
- joi: ^17.13.3
- joi-password-complexity: ^5.2.0
- jsonwebtoken: ^9.0.2
- mongoose: ^8.15.0
- morgan: ~1.9.1
- multer: ^2.0.0
- nodemon: ^3.1.10

## Uruchomienie
1. Otwórz dwie konsole linii poleceń.
2. Wejdź do folderów aplikacji:
   - `restaurantReviewsApp_HS` (frontend)
   - `restaurantReviewsApp-HS-BE` (backend)
3. W każdej konsoli wpisz polecenia:
   ```
   npm install
   npm run dev
   ```
4. Otwórz przeglądarkę i przejdź pod adres:
   ```
   http://localhost:5173
   ```

## Uwagi
- Baza danych działa na MongoDB Atlas (chmura), więc nie ma potrzeby uruchamiania lokalnego kontenera z bazą.
- MongoDB Atlas w darmowym planie pozwala na połączenia tylko z autoryzowanych adresów IP. 
- Jeśli wybrano uruchomienie bazy lokalnie, użyj poniższego polecenia do uruchomienia kontenera Docker:

```bash
docker run -d \
  --name <nazwa_bazy> \
  -p 27017:27017 \
  -v mongodata:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=<login> \
  -e MONGO_INITDB_ROOT_PASSWORD=<haslo> \
  mongo:latest
```

- Użycie wolumenu `mongodata` pozwala zachować dane po usunięciu kontenera.
- Następnie w pliku `.env` zamień zmienną `DB` na:

```
mongodb://<login>:<haslo>@localhost:27017/<nazwa_bazy>
```
Projekt jest dostępny również na github pod adresami:
backend:
```
https://github.com/Hubi0295/restaurantReviewsApp-HS-BE
```
frontend:
```
https://github.com/Hubi0295/restaurantReviewsApp_HS
```
## Konta testowe
- **Hubert**
  - Login: `hubert@wp.pl`
  - Hasło: `P@ssw0rd`
