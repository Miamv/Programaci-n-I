export default function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-muted" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
}
