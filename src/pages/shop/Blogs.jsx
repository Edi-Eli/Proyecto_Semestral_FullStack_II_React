import { Link } from 'react-router-dom'
import { blogsIniciales } from '../../data/db.js'

function Blogs() {
  return (
    <main>
      <h2 className="titulo-pagina">Nuestro Blog</h2>

      <section className="seccion-pro">
        <div className="conte-blogs">
          {blogsIniciales.map((blog) => (
            <article key={blog.id} className="tarjeta-blog">
              <img src={blog.imagen} alt={blog.titulo} />
              <h3>{blog.titulo}</h3>
              <p>{blog.descripcionCorta}</p>
              <Link to={`/blogs/${blog.id}`} className="btn-blog text-center">
                Leer más
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Blogs