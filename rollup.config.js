import clear from 'rollup-plugin-clear';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
/**
 * @param {'esm'|'cjs'} format 
 */
function getConfig(format) {
    return {
        input: {
            "index": './src/index.ts',
            "column": './src/column.ts',
            "cell": './src/cell.ts',
        },
        output: {
            dir: format,
            format: format,
            entryFileNames: format === 'cjs' ? '[name].cjs' : '[name].js',
            chunkFileNames: format === 'cjs' ? '[name].cjs' : '[name].js',
            exports: 'auto',
        },
        plugins: [
            clear({
                targets: [format]
            }),
            resolve({
                extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx']
            }),
            typescript(),
        ],

    }
}

export default [getConfig('esm'), getConfig('cjs')]