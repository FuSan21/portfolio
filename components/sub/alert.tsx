import { useState, useEffect } from 'react';

export type AlertProps = {
  message: string;
  messageType: boolean;
};

export const Alert = ({ message, messageType }: AlertProps) => {
  const [showAlert, setShowAlert] = useState(true);
  
  // Function to handle hiding the alert
  const handleHideAlert = () => {
    setShowAlert(false);
  };

  // Show the alert if there is a message
  useEffect(() => {
    setShowAlert(true);
  }, [message, messageType]);

  // Hide the alert after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showAlert ? (
        <div
          className={`text-white p-2.5 border-0 rounded relative ${messageType ? 'bg-green-500' : 'bg-red-500'}`}
        >
          <span className="text-xl inline-block mr-5 align-middle">
            <i className="fas fa-bell" />
          </span>
          <span className="inline-block align-middle mr-8">
            {message}
          </span>
          <button
            className="inline-block bg-transparent text-2xl font-semibold leading-none align-middle outline-none focus:outline-none"
            onClick={handleHideAlert}
          >
            <span>×</span>
          </button>
        </div>
      ) : null}
    </>
  );
};