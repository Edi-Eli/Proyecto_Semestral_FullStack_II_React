export const regiones = [
  { id: 1, nombre: 'Región de Arica y Parinacota', comunas: ['Arica', 'Camarones', 'Putre', 'General Lagos'] },
  { id: 2, nombre: 'Región de Tarapacá', comunas: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Huara', 'Pica'] },
  { id: 3, nombre: 'Región de Antofagasta', comunas: ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'] },
  { id: 4, nombre: 'Región de Atacama', comunas: ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Vallenar', 'Chañaral', 'Diego de Almagro', 'Alto del Carmen', 'Freirina', 'Huasco'] },
  { id: 5, nombre: 'Región de Coquimbo', comunas: ['La Serena', 'Coquimbo', 'Andacollo', 'Vicuña', 'Illapel', 'Los Vilos', 'Salamanca', 'Ovalle', 'Monte Patria', 'Punitaqui', 'Combarbalá', 'Canela', 'La Higuera'] },
  { id: 6, nombre: 'Región de Valparaíso', comunas: ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'Quillota', 'La Calera', 'Los Andes', 'San Felipe', 'San Antonio', 'Casablanca', 'La Ligua'] },
  { id: 7, nombre: 'Región Metropolitana de Santiago', comunas: ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'Puente Alto', 'San Bernardo', 'La Florida', 'Peñalolén', 'La Pintana', 'Colina', 'Melipilla'] },
  { id: 8, nombre: "Región del Libertador Gral. Bernardo O'Higgins", comunas: ['Rancagua', 'Machalí', 'San Fernando', 'Rengo', 'Santa Cruz', 'Pichilemu', 'Graneros', 'Codegua', 'San Vicente', 'Las Cabras'] },
  { id: 9, nombre: 'Región del Maule', comunas: ['Talca', 'Curicó', 'Linares', 'Constitución', 'Parral', 'Cauquenes', 'Molina', 'San Javier', 'Maule', 'Teno', 'Romeral'] },
  { id: 10, nombre: 'Región de Ñuble', comunas: ['Chillán', 'Chillán Viejo', 'San Carlos', 'Coihueco', 'Yungay', 'Quirihue', 'Bulnes', 'Pemuco'] },
  { id: 11, nombre: 'Región del Biobío', comunas: ['Concepción', 'Talcahuano', 'Hualqui', 'Chiguayante', 'Los Ángeles', 'Coronel', 'San Pedro de la Paz', 'Lota', 'Lebu', 'Tomé', 'Santa Bárbara', 'Yumbel'] },
  { id: 12, nombre: 'Región de la Araucanía', comunas: ['Temuco', 'Villarrica', 'Angol', 'Victoria', 'Pucón', 'Lautaro', 'Nueva Imperial', 'Padre Las Casas', 'Collipulli', 'Curacautín'] },
  { id: 13, nombre: 'Región de los Ríos', comunas: ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Lanco', 'Futrono', 'Los Lagos', 'Máfil'] },
  { id: 14, nombre: 'Región de los Lagos', comunas: ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas', 'Calbuco', 'Llanquihue', 'Frutillar', 'Chonchi', 'Quellón'] },
  { id: 15, nombre: 'Región de Aysén del Gral. Carlos Ibáñez del Campo', comunas: ['Coyhaique', 'Aysén', 'Puerto Cisnes', 'Chile Chico', 'Cochrane', 'Tortel'] },
  { id: 16, nombre: 'Región de Magallanes y de la Antártica Chilena', comunas: ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Puerto Williams', 'Cerro Castillo'] },
];

export function getComunas(idRegion) {
  const region = regiones.find((r) => r.id === parseInt(idRegion, 10));
  return region ? region.comunas : [];
}

export function getRegionById(idRegion) {
  return regiones.find((r) => r.id === parseInt(idRegion, 10)) || null;
}