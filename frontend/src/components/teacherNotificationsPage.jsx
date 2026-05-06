import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Header from './Header';
import { fetchSessionCached, setSessionCache } from '../utils/sessionClient';
import { API_BASE, SOCKET_URL } from '../constants/api';

const statusPillClass = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
};

const TeacherNotificationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [actingInvitationId, setActingInvitationId] = useState('');

    const fetchInvitations = async () => {
        try {
            setError('');
            const response = await fetch(`${API_BASE}/api/teacher/invitations?status=all`, {
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to fetch invitations');
            }

            setInvitations(Array.isArray(data?.invitations) ? data.invitations : []);
        } catch (err) {
            setError(err.message || 'Failed to fetch invitations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    useEffect(() => {
        let isMounted = true;
        let socket;

        const syncSocket = async () => {
            try {
                const data = await fetchSessionCached();
                const email = data?.user?.email;

                if (!isMounted || !email) return;

                socket = io(SOCKET_URL, {
                    withCredentials: true,
                });

                socket.on('connect', () => {
                    socket.emit('join-teacher-room', { email });
                });

                socket.on('teacher-invite-created', fetchInvitations);
                socket.on('teacher-invite-updated', fetchInvitations);
            } catch {
                // Do nothing. Notifications still work on refresh/manual actions.
            }
        };

        syncSocket();

        return () => {
            isMounted = false;
            if (socket) {
                socket.off('teacher-invite-created', fetchInvitations);
                socket.off('teacher-invite-updated', fetchInvitations);
                socket.disconnect();
            }
        };
    }, []);

    const respondToInvitation = async (invitationId, action) => {
        setError('');
        setSuccessMessage('');
        setActingInvitationId(invitationId);

        try {
            const response = await fetch(`${API_BASE}/api/teacher/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ action }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to respond to invitation');
            }

            if (data?.sessionUser) {
                setSessionCache({ loggedIn: true, user: data.sessionUser });
            }

            setSuccessMessage(data?.message || 'Invitation updated');
            await fetchInvitations();
        } catch (err) {
            setError(err.message || 'Failed to respond to invitation');
        } finally {
            setActingInvitationId('');
        }
    };

    return (
        <Header>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Teacher Portal</p>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Review institution invitations and respond directly.</p>
                </div>

                {successMessage && (
                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {isLoading && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-semibold text-slate-500 dark:text-slate-300">
                            Loading notifications...
                        </div>
                    )}

                    {!isLoading && invitations.length === 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-semibold text-slate-500 dark:text-slate-300">
                            No invitations found.
                        </div>
                    )}

                    {!isLoading && invitations.map((invite) => {
                        const status = String(invite.status || 'PENDING').toUpperCase();
                        const canRespond = status === 'PENDING';

                        return (
                            <div
                                key={invite._id}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{invite.institutionName || 'Institution Invite'}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            You have been invited as a {invite.role}.
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusPillClass[status] || statusPillClass.PENDING}`}>
                                        {status}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                                    Invited on {new Date(invite.createdAt).toLocaleString()}
                                </p>

                                {canRespond && (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => respondToInvitation(invite._id, 'accept')}
                                            disabled={actingInvitationId === invite._id}
                                            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold disabled:opacity-60"
                                        >
                                            {actingInvitationId === invite._id ? 'Working...' : 'Accept'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => respondToInvitation(invite._id, 'reject')}
                                            disabled={actingInvitationId === invite._id}
                                            className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold disabled:opacity-60"
                                        >
                                            {actingInvitationId === invite._id ? 'Working...' : 'Reject'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Header>
    );
};

export default TeacherNotificationsPage;
