import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Home() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />

            <main className="flex-grow-1">
                <section className="bg-light py-5">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-md-8 mx-auto text-center">
                                <h1 className="display-4 fw-bold">
                                    Descubrí proyectos profesionales
                                </h1>

                                <p className="lead my-4">
                                    Explorá proyectos, estudios y trabajos profesionales
                                    en un solo lugar.
                                </p>

                                <button className="btn btn-primary btn-lg">
                                    Explorar proyectos
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-5">
                    <div className="container">
                        <div className="text-center mb-5">
                            <h2 className="fw-bold">Proyectos destacados</h2>

                            <p className="text-muted">
                                Conocé algunos de los proyectos que forman parte de nuestra plataforma.
                            </p>
                        </div>

                        <div className="row g-4">
                            <div className="col-12 col-md-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">Proyecto Arquitectura</h5>

                                        <p className="card-text">
                                            Diseño y desarrollo de un proyecto arquitectónico moderno.
                                        </p>

                                        <button className="btn btn-outline-primary">
                                            Ver proyecto
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">Estudio Creativo</h5>

                                        <p className="card-text">
                                            Propuesta creativa desarrollada por un estudio profesional.
                                        </p>

                                        <button className="btn btn-outline-primary">
                                            Ver proyecto
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">Diseño Interior</h5>

                                        <p className="card-text">
                                            Proyecto de diseño interior con una propuesta contemporánea.
                                        </p>

                                        <button className="btn btn-outline-primary">
                                            Ver proyecto
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Home
