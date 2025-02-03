const defaultTheme = require("tailwindcss/defaultTheme");

function withOpacity(variableName) {
    return `rgb(var(${variableName}) / <alpha-value>)`;
}

const themeColors = {
    background: withOpacity("--color-background"),
    primary: withOpacity("--color-primary"),
    "primary-foreground": withOpacity("--color-primary-foreground"),
    secondary: withOpacity("--color-secondary"),
    "secondary-foreground": withOpacity("--color-secondary-foreground"),
    accent: withOpacity("--color-accent"),
    text: withOpacity("--color-text"),
    header: withOpacity("--color-header"),
    "header-foreground": withOpacity("--color-header-foreground"),
    heading: withOpacity("--color-heading"),
    link: withOpacity("--color-link"),

    "background-dark": withOpacity("--color-background-dark"),
    "primary-dark": withOpacity("--color-primary-dark"),
    "primary-foreground-dark": withOpacity("--color-primary-foreground-dark"),
    "secondary-dark": withOpacity("--color-secondary-dark"),
    "secondary-foreground-dark": withOpacity(
        "--color-secondary-foreground-dark"
    ),
    "accent-dark": withOpacity("--color-accent-dark"),
    "text-dark": withOpacity("--color-text-dark"),
    "header-dark": withOpacity("--color-header-dark"),
    "header-foreground-dark": withOpacity("--color-header-foreground-dark"),
    "heading-dark": withOpacity("--color-heading-dark"),
    "link-dark": withOpacity("--color-link-dark"),

    "holoen-red": withOpacity("--color-holoen-red"),
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', "[class~='dark']"], // See https://github.com/tailwindlabs/tailwindcss/discussions/2917
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-nunito)", ...defaultTheme.fontFamily.sans],
                // irys: ["Jura", ...defaultTheme.fontFamily.sans],
            },
            maxWidth: {
                "1/12": "8.333333%",
                "2/12": "16.666667%",
                "3/12": "25%",
                "4/12": "33.333333%",
                "5/12": "41.666667%",
                "6/12": "50%",
                "7/12": "58.333333%",
                "8/12": "66.666667%",
                "9/12": "75%",
                "10/12": "83.333333%",
                "11/12": "91.666667%",
            },
            gridTemplateColumns: {
                submissionGrid: "100px auto",
            },
            textColor: {
                skin: themeColors,
            },
            backgroundColor: {
                skin: themeColors,
            },
            fill: {
                skin: themeColors,
            },
            borderColor: {
                skin: themeColors,
            },
            stroke: {
                skin: themeColors,
            },
            zIndex: {
                "-1": "-1",
            },
        },
    },
    variants: {
        extend: {},
    },
    daisyui: {
        themes: [
            "light",
            "dark",
        ],
    },
};
