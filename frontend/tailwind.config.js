export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                "light-grey": "#f3f4f6",
                "dark-grey": "#1f2937",
                "bright-orange": "#f97316",
                "fresh-green": "#22c55e",
                "rich-indigo-blue": "#1E40AF",
            },
        },
    },
    plugins: [require("daisyui")], // Ensure DaisyUI is added properly
    daisyui: {
        themes: ["bumblebee"], // Define themes here
    },
};

