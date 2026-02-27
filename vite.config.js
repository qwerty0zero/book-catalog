import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2015',
        minify: 'esbuild',
        cssCodeSplit: false,
        rollupOptions: {
            input: 'index.html',
            output: {
                entryFileNames: 'bundle.js',
                chunkFileNames: 'bundle.js',
                assetFileNames: 'assets/[name].[ext]'
            },
        },
    },
    esbuild: {
        drop: ['console', 'debugger'],
    },
    server: {
        open: true,
        port: 3000,
    },
    css: {
        devSourcemap: true,
    }
});