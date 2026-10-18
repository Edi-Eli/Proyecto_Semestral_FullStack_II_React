export function requerido(valor) {
    return valor !== undefined && valor !== null && String(valor).trim() !== "";
}

export function maxCaracteres(valor, max) {
    if (valor === undefined || valor === null) return true;
    return String(valor).trim().length <= max;
}

export function minLength(valor, minimo) {
    return String(valor).trim().length >= minimo;
}

export function esCorreoValido(correo) {
    if (!requerido(correo)) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(correo.trim())) return false;
    const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
    return dominiosPermitidos.some((dominio) => correo.trim().toLowerCase().endsWith(dominio));
}

export function validarRun(run) {
    if (!requerido(run)) return false;

    run = String(run).trim().toUpperCase().replace(/[.\-]/g, "");

    if (run.length < 7 || run.length > 9) return false;
    if (!/^\d{7,8}[0-9K]$/.test(run)) return false;

    const cuerpo = run.slice(0, -1);
    const dvIngresado = run.slice(-1);

    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dvCalculado = 11 - resto;

    let dvEsperado;
    if (dvCalculado === 11) dvEsperado = "0";
    else if (dvCalculado === 10) dvEsperado = "K";
    else dvEsperado = String(dvCalculado);

    return dvIngresado === dvEsperado;
}

export function soloEnteros(valor) {
    return /^\d+$/.test(valor);
}

export function soloDecimales(valor) {
    return /^\d+(\.\d{1,2})?$/.test(valor.replace(",", "."));
}

export function minimoValor(valor, minimoAceptado) {
    return Number(valor.replace(",", ".")) >= minimoAceptado;
}