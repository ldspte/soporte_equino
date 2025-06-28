import { useState } from 'react';
import '../Styles/modal.css'; 



const LoginModal = ({ isOpen, onClose , onLoginSuccess}) => {
    if (!isOpen) return null;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try{
          const response = await fetch('http://localhost:3001/api/login/',{
            method: 'POST',
            headers:{
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Correo: email,
              Contraseña: password
            },)
          },)
          const data = await response.json();
          if (response.ok){
            setSuccess(true);
            await localStorage.setItem('token', data.token);
            await localStorage.setItem('veterinario', JSON.stringify(data));
            await localStorage.getItem(data);
            console.log(data);
            // onLoginSuccess()
            setTimeout(()=>{
              window.location.href = '/home';

            }, 1000)
          }else{
            setError(data.message || 'Error al iniciar sesión');
          }
        } catch (err){
            setError('Error de conexión con el servidor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Iniciar Sesión</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">¡Login exitoso! Redirigiendo...</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Usuario:</label>
                        <br />
                        <input type="text" id="username" value={email} required onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="password">Contraseña:</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading}>Iniciar Sesión</button>
                    <button type="button" onClick={onClose}>Cerrar</button>
                </form>
            </div>
        </div>
    )
};

export default LoginModal;
