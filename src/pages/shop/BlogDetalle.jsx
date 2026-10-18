import { useParams, Link } from 'react-router-dom'
import { blogsIniciales } from '../../data/db.js'

function BlogDetalle() {
  const { id } = useParams()
  const blog = blogsIniciales.find((b) => b.id === Number(id))

  return (
    <main>
      <div className="blog-detalle">
        {blog ? (
          <>
            <h2>{blog.titulo}</h2>
            <img src={blog.imagen} alt={blog.titulo} />
            <p className="blog-texto">{blog.descripcionLarga}</p>
            <Link to="/blogs" className="btn-volver">
              Volver a Blogs
            </Link>
          </>
        ) : (
          <div className="blog-no-encontrado">
            <h2>Artículo no encontrado</h2>
            <p>El artículo que buscas no existe o fue eliminado.</p>
            <Link to="/blogs" className="btn-volver">
              Volver a Blogs
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default BlogDetalle