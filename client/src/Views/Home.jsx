import React, { useEffect, useState } from 'react';


export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      const userStorage = localStorage.getItem('veterinario');
      if (userStorage) {
        setUser(JSON.parse(userStorage));
      }
    };
    fetchData();
  }, []);
  return (
    <div>
      <h1>Bienvenido Doctor {user ? user.user[0].Nombre + ' ' + user.user[0].Apellido : 'Invitado'}</h1>
    </div>
  );
}

