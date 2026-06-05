# Raport Końcowy z Projektu
**Przedmiot:** Integracja Systemów Informatycznych
**Nazwa Projektu:** Platforma e-learningowa CodeCodex
**Skład Zespołu:** Jakub Brzozowski

---

## 1. Opis Projektu
Strona internetowa full-stack, umożliwiająca rejestrację użytkownika, oraz kupowanie kursów. 

## 2. Architektura Systemu
- **Backend:** .NET ASP Core
- **Baza danych:**  PostgreSQL 
- **Konteneryzacja:** Docker 
- **Wdrożenie:**  Render.com / Vercel.com

## 3. Realizacja CI/CD
### GitHub Actions (CI)

action.yml automatyzuje porces budowania i testowania aplikacji(frontend) przy każdym pushu lub pull request do gałęzi main. Przed samymi testami uruchomiony zostaje `eslint`. Sprawdza czy w kodzie nie ma błędów, problemów stylowych, oraz czy nie są łamane zasady czystego kodu.
```yaml
# Fragment pliku .github/workflows/action.yml
name: Node.js CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [22.x]

    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
    - run: rm -f package-lock.json
    - run: npm install

    - name: Run lint
      run: npm run lint
        
    - name: Run tests
      run: npm run test:ci

    - name: Build
      run: npm run build

```


### Deployment (CD)
dotnet.yml obsługuje proces budowania i wdrażania aplikacji przy zmianach na gałęzi main. Uzywa `DEPLOY_HOOK` do wywołania deployu na Renderze. Akcja `Format` sprawdza, czy kod jest zgodny z regułami formatowania z `.editorconfig`

```yaml
# Fragment pliku .github/workflows/dotnet.yml
# This workflow will build a .NET project
# For more information see: https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-net

name: .NET

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    environment: DeployHookRender
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: 8.0.x
    - name: Restore
      run: dotnet restore ./CodeCodexBackend/CodeCodexBackend/CodeCodexBackend.csproj
    - name: Format
      run: dotnet format ./CodeCodexBackend/CodeCodexBackend/CodeCodexBackend.csproj --verify-no-changes  
    - name: Build
      run: dotnet build ./CodeCodexBackend/CodeCodexBackend/CodeCodexBackend.csproj --configuration Release --no-restore
    - name: Test
      run: dotnet test ./CodeCodexBackend/CodeCodexBackend/CodeCodexBackend.csproj --configuration Release --no-build
      
    - name: Deploy
      env:
        DEPLOY_HOOK: ${{ secrets.DEPLOY_HOOK }}
      run: curl -X POST "$DEPLOY_HOOK"

```

## 4. Zarządzanie Projektem (Git/GitHub)
- **Zastosowany Workflow:** GitHub Flow
- **Statystyki PR:** Ilość Pull Requestów: 8; sposób ich review: Nie dotyczy
- **Link do repozytorium:** [Link](https://github.com/Lisek324/CodeCodexProjekt)

## 5. Dokumentacja Techniczna (Markdown)

- Opis projektu
- Proces uruchamiania
- Stos technologiczny 
- Schemat bazy
- Wersje Live
- Dokumentacja w Swagger

## 6. Podsumowanie i Wnioski
Dużo problemów sprawiła mi integracja google, stripe, oraz tokenu JWT, ze względu na to że są to rzeczy, które robiłem po raz pierwszy. Bugfixowanie endpointów, czy logiki frontednu zabierały dużo czasu. Jeśli chodzi o rozówj to przede wszytkim potrzebny jest refactor kodu - są sytuacjie gdzie kod można uprościć (np. deklaracjia kilku dbcontext'ów w JEDNYM kontrolerze. Również można byłoby stworzyć kilka klas kontrolerów, aby poprawić czytelność projektu). Miałem plan dodać moduły do każdego dostępnego kursu, ale na planowaniu się zakończyło. Frontend korzysta z bootstrapa co w sam sobie nie jest zły, natomiast użycie Angular materials mogłoby poprawić stan wizualny witryny, oraz dodanie animacji, aby strona była przyjemniejsza dla oka.
