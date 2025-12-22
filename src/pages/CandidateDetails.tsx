import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { apiRequest } from '../utils/api';
import type { Enquiry } from '../types';
import CandidateInfo from '../components/candidate/CandidateInfo';
import DealStageCard from '../components/candidate/DealStage';
import ActivityTabs from '../components/candidate/ActivityTabs';

export default function CandidateDetails() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize from route state if available, otherwise null
    const [enquiry, setEnquiry] = useState<Enquiry | null>(location.state?.enquiry || null);
    const [loading, setLoading] = useState(!location.state?.enquiry);
    const [error, setError] = useState<string | null>(null);

    // Fetch data if not passed via state or just to refresh
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            if (!enquiry) setLoading(true); // Only show full loading if we have no initial data
            try {
                // If endpoint /api/enquiries/:id exists, use it.
                // Assuming based on standard practices it does. If previous prompts implied otherwise, we might need a fallback.
                // Let's try direct fetch.
                // NOTE: The previous prompt list implementation fetched ALL. 
                // If specific ID fetch fails, we might need to fetch all and find. 
                // But let's assume standard REST first.
                const data = await apiRequest<Enquiry>(`/api/enquiries/${id}`, { method: 'GET' });
                setEnquiry(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch candidate details:', err);
                // Fallback: If getting individual fails (maybe mock server limitations), try getting all and finding
                try {
                    const all = await apiRequest<Enquiry[]>('/api/enquiries', { method: 'GET' });
                    const found = all.find(e => e.id === Number(id));
                    if (found) {
                        setEnquiry(found);
                        setError(null);
                    } else {
                        setError('Candidate not found.');
                    }
                } catch (fallbackErr) {
                    setError('Failed to load candidate data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleUpdateCandidate = async (updatedFields: Partial<Enquiry>) => {
        if (!enquiry) return;

        // Optimistic UI update
        const oldData = { ...enquiry };
        const newData = { ...enquiry, ...updatedFields };
        setEnquiry(newData);

        try {
            await apiRequest<Enquiry>(`/api/enquiries/${enquiry.id}`, {
                method: 'PUT',
                body: updatedFields
            });
            // Re-fetch or just trust the put response if it returns the object
        } catch (err) {
            console.error('Failed to update candidate:', err);
            // Revert on error
            setEnquiry(oldData);
            alert('Failed to update. Please try again.');
        }
    };

    const handleStageUpdate = async (stage: string, demoStatus?: string) => {
        if (!enquiry) return;

        // Handle Candidate Status Change (Deal Stage)
        if (stage !== enquiry.candidateStatus) {
            // Optimistic update for UI
            const oldStatus = enquiry.candidateStatus;
            setEnquiry(prev => prev ? ({ ...prev, candidateStatus: stage }) : null);

            try {
                // Should return { message: string, enquiry: Enquiry }
                // but our apiRequest helper returns T directly. 
                // We'll define T as the response shape or just any.
                await apiRequest('/api/enquiries/change-status', {
                    method: 'POST',
                    body: {
                        enquiryId: enquiry.id,
                        newStatus: stage
                    }
                });
                // Success - state already updated optimistically
            } catch (err) {
                console.error('Failed to update status:', err);
                // Revert
                setEnquiry(prev => prev ? ({ ...prev, candidateStatus: oldStatus }) : null);
                alert('Failed to update status.');
                return;
            }
        }

        // Handle Demo Status Change via standard update if it changed
        if (demoStatus && demoStatus !== enquiry.demoStatus) {
            handleUpdateCandidate({ demoStatus });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-indigo-600 font-medium animate-pulse">Loading candidate profile...</div>
            </div>
        );
    }

    if (error || !enquiry) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
                <div className="text-rose-600 font-medium mb-4">{error || 'Candidate not found'}</div>
                <button
                    onClick={() => navigate('/contacts')}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                    Back to Contacts
                </button>
            </div>
        );
    }

    // Billing State (lifted up)
    interface BillingDetails {
        total: number;
        paid: number;
        discount: number;
    }
    const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
    const role = localStorage.getItem('userRole');

    // ... (existing effects)

    return (
        <div className="min-h-screen bg-slate-50/50 -m-6 p-6"> {/* Negative margin to break out of MainContent padding if needed, or just normal div */}
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/contacts')}
                        className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                            {enquiry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{enquiry.name}</h1>
                            <p className="text-sm text-slate-500">{enquiry.email} • {enquiry.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Top Right Billing Summary */}
                {billingDetails && (
                    <div className={`flex gap-6 text-right ${role === 'ACCOUNTS' ? 'bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100' : ''}`}>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Processed</p>
                            <p className="text-lg font-bold text-green-600">₹{billingDetails.paid.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Balance</p>
                            <p className="text-lg font-bold text-rose-600">
                                ₹{Math.max(0, billingDetails.total - billingDetails.paid - billingDetails.discount).toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                {/* Left Sidebar (Info) */}
                <div className="lg:col-span-1 h-full overflow-hidden">
                    <CandidateInfo
                        enquiry={enquiry}
                        onUpdate={handleUpdateCandidate}
                    />
                </div>

                {/* Right Area (Stage & Tabs) */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
                    <DealStageCard
                        enquiry={enquiry}
                        onUpdateStatus={handleStageUpdate}
                    />
                    <div className="flex-1 min-h-0">
                        <ActivityTabs
                            billingDetails={billingDetails}
                            onUpdateBilling={setBillingDetails}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
