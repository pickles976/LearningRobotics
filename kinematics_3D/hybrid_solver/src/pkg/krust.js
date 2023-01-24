
let wasm;

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
/**
*/
export class InverseKinematics {

    static __wrap(ptr) {
        const obj = Object.create(InverseKinematics.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_inversekinematics_free(ptr);
    }
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
    static new(origin_str, thetas_str, axes_str, radii_str, arm_colliders, arm_offsets, world_colliders, world_offsets) {
        const ptr0 = passStringToWasm0(origin_str, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(thetas_str, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(axes_str, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(radii_str, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(arm_colliders, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passStringToWasm0(arm_offsets, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passStringToWasm0(world_colliders, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passStringToWasm0(world_offsets, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len7 = WASM_VECTOR_LEN;
        const ret = wasm.inversekinematics_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7);
        return InverseKinematics.__wrap(ret);
    }
    /**
    * @param {string} target_str
    * @param {number} thresh
    * @returns {string}
    */
    solve(target_str, thresh) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(target_str, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            wasm.inversekinematics_solve(retptr, this.ptr, ptr0, len0, thresh);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(r0, r1);
        }
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedInt32Memory0 = new Int32Array();
    cachedUint8Memory0 = new Uint8Array();


    return wasm;
}

function initSync(module) {
    const imports = getImports();

    initMemory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('krust_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}

export { initSync }
export default init;
