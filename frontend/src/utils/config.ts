const config = {
    development: {
        URL: 'http://localhost:5000',
    },
    production: {
        URL: 'https://lscofd.sbrkcode.pl:5000',
    },
};

const getEnvironment = () => {
    if (window.location.hostname === 'localhost') {
        return 'development';
    }
    return 'production';
};

const currentConfig = config[getEnvironment()];

export default currentConfig;