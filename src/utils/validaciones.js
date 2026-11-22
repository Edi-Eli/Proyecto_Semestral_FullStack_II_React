function requerido(valor) {
  return valor !== undefined && valor !== null && String(valor).trim() !== '';
}

function maxCaracteres(valor, max) {
  if (valor === undefined || valor === null) return true;
  return String(valor).trim().length <= max;
}

function esCorreoValido(correo) {
  if (!requerido(correo)) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(correo.trim())) return false;
  const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
  return dominiosPermitidos.some((dominio) =>
    correo.trim().toLowerCase().endsWith(dominio),
  );
}

function validarRun(run) {
  if (!requerido(run)) return false;

  const runLimpio = String(run)
    .trim()
    .toUpperCase()
    .replace(/[.-]/g, '');

  if (runLimpio.length < 7 || runLimpio.length > 9) return false;
  if (!/^\d{7,8}[0-9K]$/.test(runLimpio)) return false;

  const cuerpo = runLimpio.slice(0, -1);
  const dvIngresado = runLimpio.slice(-1);

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dvCalculado = 11 - resto;

  let dvEsperado;
  if (dvCalculado === 11) dvEsperado = '0';
  else if (dvCalculado === 10) dvEsperado = 'K';
  else dvEsperado = String(dvCalculado);

  return dvIngresado === dvEsperado;
}

function validarContrasena(contrasena) {
  if (!requerido(contrasena)) return false;
  return String(contrasena).length >= 4 && String(contrasena).length <= 10;
}

function soloEnteros(valor) {
  return /^\d+$/.test(valor);
}

function soloDecimales(valor) {
  return /^\d+(\.\d{1,2})?$/.test(String(valor).replace(',', '.'));
}

export {
  requerido,
  maxCaracteres,
  esCorreoValido,
  validarRun,
  validarContrasena,
  soloEnteros,
  soloDecimales,
};