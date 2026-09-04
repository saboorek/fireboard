const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
    throw new Error(
        'VITE_API_URL nie jest zdefiniowane. Ustaw je w pliku .env / .env.production / .env.staging przed budowaniem aplikacji.'
    );
}

const config = {
    URL: apiUrl,
};

export default config;

