import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';

const Report = () => {
    const navigate = useNavigate();
    const { studentId } = useParams();
    const [reportText, setReportText] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle the form submission
    const handleSubmit = async () => {
        if (!reportText.trim()) {
            setMessage("Please provide report details.");
            setIsSuccess(false);
            return;
        }

        setIsSubmitting(true);  // Disable the button while submitting

        try {
            const response = await fetch(`http://localhost:3001/api/students/${studentId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report: reportText,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Report submitted successfully!');
                setReportText('');  // Clear the text area after success
                setIsSuccess(true);  // Set success status to true

                // Clear success message after 3 seconds
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(`Failed to submit report: ${data.error}`);
                setIsSuccess(false);
            }
        } catch (error) {
            setMessage(`Error submitting report: ${error.message}`);
            setIsSuccess(false);
        }

        setIsSubmitting(false);  // Enable the button again
    };

    // Navigate back to the LogReport page
    const handleClick = () => {
        navigate('/logReport');
    }

    return (
        <div>
            <Header>
                {/* Report Page Specific Content */}
                <div className="container mx-auto mt-10">
                    <h1 className="text-2xl font-semibold mb-4">Submit a Report</h1>
                    <div className="mb-6">
                        <label className="block text-lg font-medium mb-2" htmlFor="report">
                            Please provide details for the report:
                        </label>
                        <textarea
                            id="report"
                            className="textarea textarea-bordered w-full h-40 p-4"
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Write your report here..."
                            disabled={isSubmitting}  // Disable input while submitting
                        />
                    </div>
                    {message && (
                        <p
                            className="text-center"
                            style={{ color: isSuccess ? '#22c55e' : 'red' }}  // Apply fresh green if success, red if error
                        >
                            {message}
                        </p>
                    )}
                    <div className="flex justify-between">
                        <button className="btn btn-secondary" onClick={handleClick} disabled={isSubmitting}>
                            Back to Log Report
                        </button>
                        <button className="btn btn-error" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            </Header>
        </div>
    );
}

export default Report;
