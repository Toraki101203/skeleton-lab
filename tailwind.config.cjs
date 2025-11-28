/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#869ABE',
                accent: '#00A95F',
                attention: '#F39800',
            },
        },
    },
    plugins: [],
}
