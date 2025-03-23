/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				orbitron: [
					'Orbitron',
					'sans-serif'
				]
			},
			colors: {
				customPrimary: {
					DEFAULT: '#2CB67D', // Vibrant green inspired by HackerRank
					dark: '#1B7F5A',    // Darker green for contrast
					hover: '#249E6A',   // Hover effect with a slightly lighter green
				},
				customSecondary: {
					DEFAULT: '#0F1F1F',  // A dark blue-green for the main background
					light: '#162A2A',    // A lighter blue-green for card backgrounds
					border: '#1E3A3A',   // A greenish-blue for borders
				},
				customMuted: {
					DEFAULT: '#6C6C6C',  // Slightly warmer gray for muted text
					dark: '#1A1A1A',     // Darker gray for contrast
				},
				customDanger: {
					DEFAULT: '#D72638',  // A vibrant red for errors or warnings
					dark: '#8B0000',     // A deeper red for better contrast
				},
				customSuccess: {
					DEFAULT: '#3CE7B2',  // A bright green for success messages
					dark: '#128C5C',     // Darker green for success highlights
				},
				customInfo: {
					DEFAULT: '#27A98B',  // A teal-like green for informational elements
				},
				customBackground: {
					DEFAULT: '#121212',  // Main background color
					card: '#1D1D1D',     // Card background color
				},
				customBorder: {
					DEFAULT: '#2C2C2C',  // Default border color
					hover: '#3A3A3A',    // Hover state for borders
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				editor: {
					bg: '#222222',
					darker: '#1E1E1E',
					line: '#333333',
					border: '#403E43',
					accent: '#10B981',
					accentLight: '#D1FAE5',
					text: '#C8C8C9',
					highlight: '#252525',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}