import React, { useEffect } from 'react'

import AppRoutes from './routes/AppRoutes'
import { ToastContainer, toast } from 'react-toastify'
import useAuthStore from './store/auth-store'

import 'react-toastify/dist/ReactToastify.css'
import socket from './utils/socket'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const App = () => {
    const { checkUser } = useAuthStore()

    useEffect(() => {
        checkUser()

        socket.on('connect', () => {

        });

        socket.on('server:new-ticket', (data) => {
            toast.info(`New Ticket: ${data.title}`);
        });

        socket.on('server:update-ticket', (data) => {
            toast.info(`Ticket Updated: ${data.title} (${data.status})`);
        });

        return () => {
            socket.off('connect');
            socket.off('server:new-ticket');
            socket.off('server:update-ticket');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <ToastContainer />
            <AppRoutes />
        </>
    )
}


export default App
