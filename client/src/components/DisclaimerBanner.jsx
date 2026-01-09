import { useState } from 'react';
import { Button, Container, Modal } from 'react-bootstrap';

const DisclaimerBanner = () => {
    // Always start as true (visible) on every mount/refresh
    const [show, setShow] = useState(true);

    const handleAccept = () => {
        setShow(false);
    };

    return (
        <Modal
            show={show}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
        >
            <Modal.Header className="text-white border-0" style={{ backgroundColor: '#0d3b66' }}>
                <Modal.Title className="w-100 text-center fw-bold">
                    Aviso Importante
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center p-4">
                <p className="lead mb-0">
                    Soporte Equino mejora los tiempos de atención veterinaria, pero no se hace responsable de los eventos que ocurran durante dicha atención.
                    Profesionales capacitados y experimentados asumirán el rol veterinario directo.
                </p>
            </Modal.Body>
            <Modal.Footer className="justify-content-center border-0 pb-4">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAccept}
                    className="px-5"
                    style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}
                >
                    Entendido, Ingresar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DisclaimerBanner;
