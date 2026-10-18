const integrantes = [
  {
    inicial: 'Z',
    nombre: 'Zeus',
    rol: 'Tienda principal + Carrito',
    descripcion:
      'Responsable del home, la vista de productos, el detalle de producto y la lógica del carrito de compras con localStorage.',
  },
  {
    inicial: 'E',
    nombre: 'Edixon',
    rol: 'Tienda: formularios + contenido',
    descripcion:
      'Responsable del registro de usuario, inicio de sesión, contacto, nosotros y los blogs, junto con las validaciones de formularios.',
  },
  {
    inicial: 'S',
    nombre: 'Sebastián',
    rol: 'Administrador',
    descripcion:
      'Responsable del sistema administrativo: home del admin, mantenedor de productos y mantenedor de usuarios.',
  },
]

function Nosotros() {
  return (
    <main>
      <h2 className="titulo-pagina">Nosotros</h2>

      <section className="nosotros-contenido">
        <article className="nosotros-historia">
          <img src="/assets/images/nosotros.svg" alt="Ferretería Los Maestros" />
          <div>
            <h2 className="ti-pro">¿Quiénes somos?</h2>
            <p>
              Ferretería Los Maestros nació en 2010 con un objetivo claro: entregar a los hogares
              y talleres de Chile herramientas, materiales y asesoría de calidad al mejor precio.
              Desde entonces hemos crecido hasta convertirnos en una ferretería de confianza,
              acompañando a nuestros clientes en cada uno de sus proyectos, desde una pequeña
              reparación del hogar hasta grandes obras de construcción.
            </p>
            <p>
              Nuestro compromiso es simple: productos confiables, precios justos y un equipo
              dispuesto a orientarte antes y después de tu compra. Porque detrás de cada proyecto
              hay una persona que confía en nosotros.
            </p>
          </div>
        </article>

        <h2 className="ti-pro">Equipo de Desarrollo</h2>
        <div className="conte-integrantes">
          {integrantes.map((integrante) => (
            <article key={integrante.nombre} className="tarjeta-integrante">
              <div className="avatar">{integrante.inicial}</div>
              <h3>{integrante.nombre}</h3>
              <p className="rol">{integrante.rol}</p>
              <p>{integrante.descripcion}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Nosotros