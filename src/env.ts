
// Remember, Vite statically replaces import.meta.env with the environment variables at build time.
// Need to define each as a separate const
export const apiUrl = import.meta.env.VITE_APP_API;

if (!apiUrl) {
    console.error('VITE_APP_API ENV variable is not defined!!');
}
