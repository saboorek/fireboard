# Wdrożenie (Staging + Produkcja) — instrukcja

Ten dokument opisuje, jak skonfigurować automatyczny deploy z GitHub Actions na VPS
dla dwóch niezależnych środowisk: **staging-lscofd** i **lscofd** (produkcja), tak
aby nigdy się ze sobą nie mieszały.

## 1. Struktura katalogów na VPS

Utwórz DWA osobne, w pełni niezależne klony repozytorium:

```
/var/www/lscofd            # produkcja (gałąź master)
/var/www/staging-lscofd    # staging (dowolna inna gałąź)
```

W każdym z nich:

```bash
git clone git@github.com:<user>/fireboard.git /var/www/lscofd
cd /var/www/lscofd
git checkout master

git clone git@github.com:<user>/fireboard.git /var/www/staging-lscofd
cd /var/www/staging-lscofd
git checkout <nazwa-gałęzi-staging>
```

W każdym katalogu ręcznie utwórz pliki `.env` (na podstawie `.env.example`):

- `backend/.env` — **z innym** `MONGO_URL`, `FRONTEND_URL`, `DISCORD_CALLBACK_URL`, `PORT` dla staging i produkcji.
- `frontend/.env` — z innym `VITE_API_URL` (używanym tylko w momencie builda przez `vite build`).

`.env` jest w `.gitignore`, więc `git reset --hard` wykonywany przez workflow **nigdy go nie nadpisze ani nie usunie**.

## 2. Osobne bazy danych

Utwórz dwie oddzielne bazy MongoDB (np. dwie różne bazy w tym samym klastrze Atlas):

- `fireboard_staging`
- `fireboard_prod`

Nigdy nie używaj tej samej bazy dla obu środowisk — inaczej dane (sesje, użytkownicy, sprawy) będą się mieszać.

## 3. Discord OAuth — dwa callback URL

W Discord Developer Portal, w zakładce OAuth2 tej samej aplikacji, dodaj **oba** redirecty:

```
https://staging-lscofd.sbrkcode.pl/api/auth/discord/callback
https://lscofd.sbrkcode.pl/api/auth/discord/callback
```

I ustaw odpowiednio `DISCORD_CALLBACK_URL` w każdym `backend/.env`.

## 4. PM2 — dwa niezależne procesy

```bash
cd /var/www/lscofd/backend
pm2 start dist/index.js --name fireboard-prod

cd /var/www/staging-lscofd/backend
pm2 start dist/index.js --name fireboard-staging

pm2 save
pm2 startup   # aby PM2 wstawał razem z serwerem
```

Nazwy procesów (`fireboard-prod`, `fireboard-staging`) muszą odpowiadać sekretom
`PROD_PM2_NAME` / `STAGING_PM2_NAME` opisanym niżej.

## 5. Nginx — dwie oddzielne domeny/subdomeny

```nginx
# lscofd.sbrkcode.pl (produkcja)
server {
    server_name lscofd.sbrkcode.pl;
    root /var/www/lscofd/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri /index.html;
    }
}

# staging-lscofd.sbrkcode.pl
server {
    server_name staging-lscofd.sbrkcode.pl;
    root /var/www/staging-lscofd/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

Backend produkcyjny i stagingowy muszą nasłuchiwać na **różnych portach** (`PORT` w `.env`,
np. `5000` prod / `5001` staging), żeby Nginx mógł je jednoznacznie rozróżnić.

Włącz HTTPS (certbot) na obu domenach — cookie sesji ma `secure: true` w produkcji/staging
z `NODE_ENV=production`, więc bez HTTPS logowanie przez Discord nie zadziała.

## 6. Klucz SSH dla GitHub Actions

### 6a. (Zalecane) Dedykowany użytkownik do deployu

Zamiast logować się jako `root`, utwórz osobnego użytkownika systemowego tylko do
automatyzacji (mniejsze ryzyko w razie wycieku klucza):

```bash
adduser deploy
usermod -aG sudo deploy          # opcjonalnie, jeśli deploy ma czasem potrzebować sudo
```

`VPS_USER` to wtedy `deploy` (albo `root`/`ubuntu`/inny istniejący użytkownik, jeśli
już masz taki skonfigurowany — sprawdzisz go komendą `whoami` po zalogowaniu przez SSH,
lub spójrz jakiej nazwy używasz w swoim obecnym poleceniu `ssh <user>@<host>`).

Upewnij się, że ten użytkownik jest właścicielem katalogów `/var/www/lscofd` i
`/var/www/staging-lscofd` (albo ma do nich prawa zapisu):

```bash
sudo chown -R deploy:deploy /var/www/lscofd /var/www/staging-lscofd
```

### 6b. Generowanie klucza SSH

Na VPS wygeneruj dedykowaną parę kluczy tylko do deployu (zalogowany jako `deploy`,
lub jako `root`/inny użytkownik — wtedy klucz trafi do jego `~/.ssh`):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gh-deploy -N ""
cat ~/.ssh/gh-deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/gh-deploy   # <- to trafia do sekretu VPS_SSH_KEY
```

Upewnij się, że użytkownik SSH ma prawo uruchamiać `git`, `npm` i `pm2` bez `sudo`
(oraz że `node`, `npm` i `pm2` są dostępne w jego `PATH` — zainstaluj je na koncie
`deploy`, a nie tylko globalnie/na koncie `root`, jeśli używasz nvm).

> **`VPS_HOST`** (sekret używany w workflow) to statyczne IP Twojego serwera (np. `123.45.67.89`)
> lub domena/subdomena wskazująca na ten serwer w DNS. To ten sam adres, po którym normalnie
> łączysz się przez `ssh user@<VPS_HOST>`.

## 7. Konfiguracja GitHub — Environments i Secrets

W repozytorium: **Settings → Environments** utwórz dwa środowiska: `staging` i `production`.
Dla `production` możesz dodatkowo włączyć "Required reviewers", aby wdrożenie wymagało
ręcznej akceptacji.

Dla **każdego** środowiska dodaj osobne sekrety (Settings → Environments → [nazwa] → Secrets):

| Sekret            | production                  | staging                             |
|-------------------|------------------------------|--------------------------------------|
| `VPS_HOST`        | statyczne IP VPS (lub domena wskazująca na VPS, np. `123.45.67.89`) | to samo (zwykle ten sam VPS dla obu środowisk) |
| `VPS_USER`        | użytkownik SSH                | użytkownik SSH                       |
| `VPS_SSH_KEY`      | klucz prywatny z kroku 6      | klucz prywatny z kroku 6             |
| `VPS_PORT`        | port SSH (domyślnie 22)      | port SSH (domyślnie 22)              |
| `PROD_PATH`        | `/var/www/lscofd`             | *(niepotrzebne)*                     |
| `PROD_PM2_NAME`    | `fireboard-prod`              | *(niepotrzebne)*                     |
| `STAGING_PATH`     | *(niepotrzebne)*              | `/var/www/staging-lscofd`            |
| `STAGING_PM2_NAME` | *(niepotrzebne)*              | `fireboard-staging`                  |

Workflow `deploy-production.yml` używa środowiska `production`, a `deploy-staging.yml`
środowiska `staging` — dzięki temu sekrety **nigdy się nie mieszają** między środowiskami.

## 8. Jak działa automatyzacja

- Push na gałąź **`master`** → uruchamia `.github/workflows/deploy-production.yml`
  → SSH do `PROD_PATH`, `git reset --hard origin/master`, build, restart PM2 produkcyjnego.
- Push na **dowolną inną gałąź** → uruchamia `.github/workflows/deploy-staging.yml`
  → SSH do `STAGING_PATH`, `git reset --hard origin/<gałąź>`, build, restart PM2 stagingowego.

Oba workflow można też uruchomić ręcznie z zakładki Actions (`workflow_dispatch`).

## 9. Bezpieczeństwo — WAŻNE

Podczas audytu w repozytorium znaleziono **prawdziwe sekrety w plikach `.env`**
(Discord client secret, bot token, hasło do MongoDB oraz token GitHub PAT wbudowany
w bundle frontendu). Jeśli te wartości były kiedykolwiek widoczne poza Twoim
lokalnym środowiskiem (np. wklejone na czacie, w zrzucie ekranu, w publicznym repo),
**musisz je natychmiast zrotować**:

- Discord Developer Portal → Reset Secret (client secret) i Regenerate Token (bot token).
- MongoDB Atlas → zmień hasło użytkownika bazy.
- GitHub → Settings → Developer settings → Personal access tokens → usuń stary token,
  wygeneruj nowy z minimalnym zakresem uprawnień (`public_repo`/`contents:read`) i trzymaj
  go wyłącznie w `backend/.env` (już nigdy w `frontend/.env`, bo Vite wbudowuje wszystkie
  zmienne z prefiksem `VITE_` do publicznego kodu JS widocznego dla każdego użytkownika).

