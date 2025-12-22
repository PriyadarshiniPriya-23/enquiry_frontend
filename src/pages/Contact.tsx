import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { apiRequest } from '../utils/api';
import type { Enquiry, Package, Subject } from '../types';

export default function Contact() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch all necessary data in parallel
            const [enquiriesData, packagesData, subjectsData] = await Promise.all([
                apiRequest<Enquiry[]>('/api/enquiries', { method: 'GET' }),
                apiRequest<Package[]>('/api/packages', { method: 'GET' }),
                apiRequest<Subject[]>('/api/subjects', { method: 'GET' })
            ]);

            setEnquiries(enquiriesData);
            setPackages(packagesData);
            setSubjects(subjectsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load enquiries data.');
        } finally {
            setLoading(false);
        }
    };

    const getPackageName = (id: number | null) => {
        if (id === null) return 'Others';
        const pkg = packages.find(p => p.id === id);
        return pkg ? `${pkg.name} (${pkg.code})` : `ID: ${id}`;
    };

    const getSubjectNames = (ids: number[]) => {
        if (!ids || ids.length === 0) return 'None';
        return ids.map(id => {
            const subject = subjects.find(s => s.id === id);
            return subject ? subject.name : id;
        }).join(', ');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleCandidateClick = (enquiry: Enquiry) => {
        navigate(`/contact-details/${enquiry.id}`, { state: { enquiry } });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-indigo-600 font-medium animate-pulse">Loading enquiries...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
                    <p className="text-slate-500 text-sm mt-1">List of all student enquiries and their details.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                    Total: {enquiries.length}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Candidate</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Package Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Training Prefs</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Professional</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {enquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        No enquiries found.
                                    </td>
                                </tr>
                            ) : (
                                enquiries.map((enquiry) => (
                                    <tr
                                        key={enquiry.id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => handleCandidateClick(enquiry)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-indigo-600 hover:text-indigo-800">{enquiry.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{enquiry.current_location}</div>
                                            {enquiry.consent && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 mt-1">
                                                    Consent Given
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {enquiry.email}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {enquiry.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-indigo-600">
                                                {getPackageName(enquiry.packageId)}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-[200px]" title={getSubjectNames(enquiry.subjectIds)}>
                                                {getSubjectNames(enquiry.subjectIds)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{enquiry.trainingMode}</div>
                                            <div className="text-xs text-slate-500">{enquiry.trainingTime}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Start: {enquiry.startTime}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{enquiry.profession}</div>
                                            <div className="text-xs text-slate-500">{enquiry.qualification}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{enquiry.experience}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {enquiry.candidateStatus}
                                            </span>
                                            <div className="text-xs text-slate-400 mt-2">Ref: {enquiry.referral}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-slate-500">{formatDate(enquiry.createdAt)}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}