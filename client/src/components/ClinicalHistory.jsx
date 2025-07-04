import {useState, useEffect, useCallback} from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge, Alert } from 'react-bootstrap';

function ClinicalHistory() {
    const [clinical, setClinical] = useState([]);
    const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

    // EStado Modales
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [showNewClinicalModal, setShowNewClinicalModal] = useState(false);
  const [showEditClinicalModal, setShowEditClinicalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


    // Estados de validación
  const [validated, setValidated] = useState(false);
  const [editValidated, setEditValidated] = useState(false);

  

  const normalizeClinicalData = useCallback((clinical) => {
    return{
    veterinario: clinical.veterinario  || '',
    paciente: clinical.paciente  || '',
    vacunas: clinical.vacunas  || '',
    enfermedades: clinical.enfermedades  || '',
    temperatura: clinical.temperatura  || '',
    pulso: clinical.piel  || '',
    frecuencia_cardiaca: clinical.frecuencia_cardiaca  || '',
    llenado_capilar: clinical.llenado_capilar  || '',
    mucosas: clinical.mucosas  || '',
    pulso_digital: clinical.pulso_digital  || '',
    aspecto: clinical.aspecto  || '',
    locomotor: clinical.locomotor  || '',
    respiratorio: clinical.respiratorio  || '',
    circulatorio: clinical.circulatorio  || '',
    digestivo: clinical.digestivo  || '',
    genitourinario: clinical.genitourinario  || '',
    sis_nervioso: clinical.sis_nervioso  || '',
    oidos: clinical.oidos  || '',
    glangios_linfaticos: clinical.glangios_linfaticos  || '',
    piel: clinical.piel  || '',
    diagnostico_integral: clinical.diagnostico_integral  || '',
    tratamiento: clinical.tratamiento  || '',
    prescripcion: clinical.prescripcion  || '',
    observaciones: clinical.observaciones  || ''
  };
}, []);


    const [newClinical, setNewClinical] = useState(initialCLinicalState);
  const [editClinical, setEditClinical] = useState(initialCLinicalState);

  // Estados para alertas y mensajes de éxito
  const [showSendingAlert, setShowSendingAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubMessage, setSuccessSubMessage] = useState('');


  useEffect(() => {
      const fetchData = () => {
        const userStorage = localStorage.getItem('veterinario');
        if (userStorage) {
          setUser(JSON.parse(userStorage));
        }
      };
      fetchData();
    }, []);

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem('token');
        console.log(token ? `Bearer ${token}` : "XXXX")
        return token ? `Bearer ${token}` : null;
    }, []);

    const fetchClinical = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            if (!token) {
              setError('No hay token de autenticación');
              setLoading(false);
              return;
            }
            const response = await fetch('http://localhost:3001/api/insumos',
            {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok){
                const errorText = await response.text();
                if (response.status === 401 || response.status === 403){
                    localStorage.removeItem('token');
                    setError('Sesion expirada. Por favor, inicie sesión nuevamente');
                    return;
                }
                throw new Error(errorText || 'Error al obtener las historias clinicas')
            }

            const data = await response.json();
            const processedData = Array.isArray(data) ? data.map(normalizeClinicalData) : [normalizeClinicalData(data)];

            if (!processedData.length){
                setError('No se encontraron Historias Clinicas');
            }

            setClinical(processedData);

        } catch (error) {
            console.error('Error encontrando Historias Clinicas: ', error);
            setError(`Error al cargar Historias Clinicas:  ${error.message}`);
            setClinical([]);
        } finally{
            setLoading(false);
        }

    }, [getAuthToken, normalizeClinicalData])

  const initialCLinicalState = {
    veterinario: '',
    paciente: '',
    vacunas: '',
    enfermedades: '',
    temperatura: '',
    pulso: '',
    frecuencia_cardiaca: '',
    llenado_capilar: '',
    mucosas: '',
    pulso_digital: '',
    aspecto: '',
    locomotor: '',
    respiratorio: '',
    circulatorio: '',
    digestivo: '',
    genitourinario: '',
    sis_nervioso: '',
    oidos: '',
    glangios_linfaticos: '',
    piel: '',
    diagnostico_integral: '',
    tratamiento: '',
    prescripcion: '',
    observaciones: ''
  }

  // crear Historia clinica

  const handleSubmitNewHistory = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const token = getAuthToken();

    if(!token) {
        setError('No hay token de autenticacion');
        return;
    }

    if (form.checkValidity() === false){
        e.stopPropagation();
        setValidated(true);
        return;
    }

    try {
        setIsUpdating(true);

        if(!newClinical.veterinario || !newClinical.paciente){
            alert('Por favor llena todos los campos');
            return;
        }


        //Preparar Payload

        const payload = {
            ...newClinical,
ya            
        }

    } catch (error) {
        
    }


  }

  return (
    <div>
      
    </div>
  )
}

export default ClinicalHistory
