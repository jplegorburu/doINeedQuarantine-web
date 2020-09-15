import { useState, useEffect } from 'react';

const HOST_NAME = process.env.HOST_NAME || 'http://localhost:3000/';

function useFetch(){
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState([]);

    useEffect(()=>{
        async function fetchData(){
            setLoading(true);
            setError();

            const data = await fetch(`${HOST_NAME}api/hello`)
                .then( resp => resp.json())
                .catch(err => setError(err));
            setData(data);
            setLoading(false);
        }

        fetchData();
    }, [])
    return [data, loading, error];

}

export { useFetch }