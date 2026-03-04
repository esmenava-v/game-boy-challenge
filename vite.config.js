import glsl from 'vite-plugin-glsl';

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env
const isRailway = 'RAILWAY_ENVIRONMENT' in process.env

export default {
    publicDir: './public/',
    base: './',
    server:
    {
        host: true,
        open: !isCodeSandbox && !isRailway
    },
    preview:
    {
        open: !isRailway
    },
    build:
    {
        outDir: './dist',
        emptyOutDir: true,
        sourcemap: true,
    },
    plugins: [glsl()],
}
