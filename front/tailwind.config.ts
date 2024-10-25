import type {Config} from 'tailwindcss'

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            keyframes: {
                'slide-up': {
                    '0%': {transform: 'translateY(10px)', opacity: '0'},
                    '100%': {transform: 'translateY(0)', opacity: '1'},
                },
                'slide-in': {
                    '0%': {transform: 'translateX(100%)', opacity: '0'},
                    '100%': {transform: 'translateX(0)', opacity: '1'},
                },
                'notification': {
                    '0%': {transform: 'translateX(100%)', opacity: '0'},
                    '5%': {transform: 'translateX(0)', opacity: '1'},
                    '95%': {transform: 'translateX(0)', opacity: '1'},
                    '100%': {transform: 'translateX(100%)', opacity: '0'},
                },
                'progress': {
                    '0%': {width: '100%'},
                    '100%': {width: '0%'},
                },
            },
            animation: {
                'slide-up': 'slide-up 0.3s ease-out',
                'slide-in': 'slide-in 0.3s ease-out',
                'notification': 'notification 5s ease-in-out forwards',
                'progress': 'progress 5s linear forwards',
            },
        },
    },
    plugins: [],
}

export default config
