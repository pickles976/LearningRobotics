/* tslint:disable */
/* eslint-disable */
/**
*/
export class InverseKinematics {
  free(): void;
/**
* @param {Array<any>} origin_array
* @param {Array<any>} angles_array
* @param {Array<any>} axes_array
* @param {Array<any>} radii_array
* @returns {InverseKinematics}
*/
  static new(origin_array: Array<any>, angles_array: Array<any>, axes_array: Array<any>, radii_array: Array<any>): InverseKinematics;
/**
* @param {Array<any>} target_array
* @param {number} thresh
* @returns {Float32Array}
*/
  solve(target_array: Array<any>, thresh: number): Float32Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_inversekinematics_free: (a: number) => void;
  readonly inversekinematics_new: (a: number, b: number, c: number, d: number) => number;
  readonly inversekinematics_solve: (a: number, b: number, c: number) => number;
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
