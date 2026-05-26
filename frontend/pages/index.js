import UploadForm from '../components/UploadForm'

export default function Home() {
  return (
    <>
      <h1>devpilot — Subir repositorio</h1>
      <p>Sube un ZIP o pega una URL de GitHub para comenzar.</p>
      <UploadForm />
    </>
  )
}
