import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInputData } from '../components/useInputData';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const EditTestPage = () => {
    const { test_id } = useParams(); // Get test_id from URL params
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const { testId, setTestId, bacteria, setBacteriaName } = useInputData();

    const [testData, setTestData] = useState(null);

    // Fetch existing data
    useEffect(() => {
        const fetchTestData = async () => {
            const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${JSON.parse(token)}`
                }
            };
            try {
                const response = await fetch(`/ASTtest/get_test_data_by_Id/${test_id}`, requestOptions);
                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Session expired, please log in again');
                        navigate('/login');
                    } else {
                        alert('Failed to fetch test data');
                    }
                    return;
                }
                const result = await response.json();
                setTestData(result);
                setValue('testId', result.test_id);
                setValue('bacteria', result.bacteria_name);
                setBacteriaName(result.bacteria_name);
            } catch (error) {
                console.error('Error fetching test data:', error);
            }
        };

        fetchTestData();
    }, [test_id, navigate, setValue, setBacteriaName]);

    const onSubmit = async (data) => {
        const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
        const payload = {
            test_id: testData.test_id,  // Don't allow changing test_id
            bacteria: data.bacteria,  
        };

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JSON.parse(token)}`
            },
            body: JSON.stringify(payload)
        };

        try {
            const response = await fetch(`/ASTtest/get_test_data_by_Id/${test_id}`, requestOptions);
            if (!response.ok) {
                alert('Failed to update test');
                return;
            }
            const result = await response.json();
            console.log('Test updated:', result);
            setBacteriaName(data.bacteria);

            navigate('/');
        } catch (error) {
            console.error('Error updating test:', error);
            alert('Failed to update test');
        }
    };

    const handleEditImage = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
        const payload = {
            test_id: testData.test_id,
            bacteria: testData.bacteria_name, 
        };
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JSON.parse(token)}`
            },
            body: JSON.stringify(payload)
        };
        try {
            const response = await fetch(`/ASTtest/get_test_data_by_Id/${test_id}`, requestOptions);
            if (!response.ok) {
                alert('Failed to update bacteria');
                return;
            }
            const result = await response.json();
            console.log('Bacteria updated:', result);
            navigate('/import'); 
        } catch (error) {
            console.error('Error updating bacteria:', error);
            alert('Failed to update bacteria');
        }
    };
 
    if (!testData) {
        return <div>Loading...</div>;
    }

    return (
            <div className='editTestPage' style={{ maxWidth: '80%', width: '80%', padding: '20px'}}>
                <h1 style={{ textAlign: 'center' }}>Create New Test</h1>
    
                <form onSubmit={handleSubmit(onSubmit)} style={{ width: '80%', maxWidth: '500px', margin: '0 auto' }}>
                    
                    <Form.Group>
                        <Form.Label>Test ID</Form.Label>
                        <Form.Control 
                            type="number"
                            value={testData.test_id}
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Bacteria Name</Form.Label>
                        <Form.Control 
                            value={testData.bacteria_name}
                            readOnly
                        >
                        </Form.Control>
                    </Form.Group>
                    {errors['bacteria'] && <p style={{ color: 'red' }}><small>Bacteria name is required</small></p>}
                    
                    <br />
                    <Form.Group>
                        <Button variant="secondary" onClick={handleEditImage} 
                            style={{ 
                                fontSize: '1rem',
                                padding: '12px 30px',
                                fontWeight: 'bold',
                                borderRadius: '30px',
                                backgroundColor: '#c2dfe3',
                                boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
                                border: '1px solid #c2dfe3',
                                cursor: 'pointer',
                                color: 'black',
                                margin: '0 auto',
                                display: 'flex', 
                                justifyContent: 'center',
                            }}>
                            Edit Image
                        </Button>
                    </Form.Group>
                </form>
            </div>
        );
};

export default EditTestPage;
