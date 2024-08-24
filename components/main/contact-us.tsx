'use client'

import { sendEmail } from '@/app/utils/send-email';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/sub/alert';
import { useState } from 'react';

export type FormData = {
    name: string;
    email: string;
    message: string;
};

export const ContactUs = () => {
    const { register, handleSubmit } = useForm<FormData>();
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(true);

    function onSubmit(data: FormData) {
        sendEmail(data, setMessage, setMessageType);
        setMessage('');
    }
  return (
    <section id="contact-us">
    <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">Contact Us</h2>
        <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">Get in touch with me</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Name</label>
                <input type="text" id="name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light" placeholder="Fuad Hasan" {...register('name', { required: true })}/>
            </div>
            <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                <input type="email" id="email" className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light" placeholder="fuad.antor@gmail.com" {...register('email', { required: true })}/>
            </div>
            <div className="sm:col-span-2">
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Your message</label>
                <textarea id="message" rows={6} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Leave a comment..." {...register('message', { required: true })}></textarea>
            </div>
            <div className="flex flex-row gap-4">
                <button type="submit" className="flex items-center p-2.5 button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px]">Send message</button>
                {message ? (<Alert message={message} messageType={messageType} />) : null}
            </div>
        </form>
    </div>
  </section>
    
  );
};
