/* tslint:disable */
/* eslint-disable */
/**
*/
export class InverseKinematics {
  free(): void;
/**
* @param {string} origin_str
* @param {string} thetas_str
* @param {string} axes_str
* @param {string} radii_str
* @param {string} arm_colliders
* @param {string} arm_offsets
* @param {string} world_colliders
* @param {string} world_offsets
* @returns {InverseKinematics}
*/
  static new(origin_str: string, thetas_str: string, axes_str: string, radii_str: string, arm_colliders: string, arm_offsets: string, world_colliders: string, world_offsets: string): InverseKinematics;
/**
* @param {string} target_str
* @param {number} thresh
* @returns {string}
*/
  solve(target_str: string, thresh: number): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_inversekinematics_free: (a: number) => void;
  readonly inversekinematics_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => number;
  readonly inversekinematics_solve: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_export_0: (a: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_2: (a: number, b: number) => void;
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
