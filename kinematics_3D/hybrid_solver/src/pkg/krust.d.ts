/* tslint:disable */
/* eslint-disable */
/**
* @param {Array<any>} target_array
* @param {Array<any>} origin_array
* @param {Array<any>} angles_array
* @param {Array<any>} axes_array
* @param {Array<any>} radii_array
* @returns {Float32Array}
*/
export function solve_gd(target_array: Array<any>, origin_array: Array<any>, angles_array: Array<any>, axes_array: Array<any>, radii_array: Array<any>): Float32Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly solve_gd: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbindgen_export_0: (a: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
