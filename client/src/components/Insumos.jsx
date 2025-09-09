import '../Styles/insumos.css'

export default function Insumos(props) {
    const {insumos} = props;
    console.log(insumos);
    return (
        
        <div className="insumos">
            <h1>Insumos</h1>
            
            <div className="container-insumos">
                {insumos.map((insumo) => (
                    <div className="insumos-container" key={insumo.idInsumos}>
                        <div>
                            <img src={`http://localhost:3001/uploads/${insumo.Foto}`} alt={insumo.Nombre} style={{ width: '50px' }} />
                            <h2>{insumo.Nombre} </h2>
                            <h5>{insumo.Descripcion}</h5>
                            <p>${insumo.Precio}</p> 
                        </div>
                    </div>
                )) }
            </div>
        </div>
    );
}