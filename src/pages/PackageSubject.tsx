import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

// Types
interface Subject {
    id: number;
    name: string;
    code: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Package {
    id: number;
    name: string;
    code: string;
    createdAt?: string;
    updatedAt?: string;
    Subjects: Subject[];
}

// Icons
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const DeleteIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export default function PackageSubject() {
    const [activeTab, setActiveTab] = useState<'subjects' | 'packages'>('subjects');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    // Form states
    const [subjectForm, setSubjectForm] = useState({ name: '', code: '' });
    const [packageForm, setPackageForm] = useState({ name: '', code: '', subjectIds: [] as number[] });
    const [subjectSearchQuery, setSubjectSearchQuery] = useState('');

    // Fetch data on mount and tab change
    useEffect(() => {
        fetchSubjects();
        fetchPackages();
    }, []);

    // Fetch Subjects
    const fetchSubjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiRequest<Subject[]>('/api/subjects', {
                method: 'GET',
            });
            setSubjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
            console.error('Error fetching subjects:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Packages
    const fetchPackages = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiRequest<Package[]>('/api/packages', {
                method: 'GET',
            });
            setPackages(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch packages');
            console.error('Error fetching packages:', err);
        } finally {
            setLoading(false);
        }
    };

    // Subject CRUD
    const openSubjectModal = (subject?: Subject) => {
        if (subject) {
            setEditingSubject(subject);
            setSubjectForm({ name: subject.name, code: subject.code });
        } else {
            setEditingSubject(null);
            setSubjectForm({ name: '', code: '' });
        }
        setError(null);
        setIsSubjectModalOpen(true);
    };

    const saveSubject = async () => {
        if (!subjectForm.name || !subjectForm.code) {
            setError('name and code are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (editingSubject) {
                // Update subject (if you have an update endpoint)
                await apiRequest(`/api/subjects/${editingSubject.id}`, {
                    method: 'PUT',
                    body: { name: subjectForm.name, code: subjectForm.code },
                });
            } else {
                // Create subject
                await apiRequest('/api/subjects', {
                    method: 'POST',
                    body: { name: subjectForm.name, code: subjectForm.code },
                });
            }
            await fetchSubjects();
            setIsSubjectModalOpen(false);
            setSubjectForm({ name: '', code: '' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error saving subject:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteSubject = async (id: number) => {
        if (!confirm('Are you sure you want to delete this subject?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await apiRequest(`/api/subjects/${id}`, {
                method: 'DELETE',
            });
            await fetchSubjects();
            await fetchPackages(); // Refresh packages as they might be affected
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete subject');
            console.error('Error deleting subject:', err);
        } finally {
            setLoading(false);
        }
    };

    // Package CRUD
    const openPackageModal = (pkg?: Package) => {
        if (pkg) {
            setEditingPackage(pkg);
            // Convert Subjects array to subjectIds array
            const subjectIds = pkg.Subjects.map(s => s.id);
            setPackageForm({ name: pkg.name, code: pkg.code, subjectIds });
        } else {
            setEditingPackage(null);
            setPackageForm({ name: '', code: '', subjectIds: [] });
        }
        setSubjectSearchQuery(''); // Reset search when opening modal
        setError(null);
        setIsPackageModalOpen(true);
    };

    const savePackage = async () => {
        if (!packageForm.name || !packageForm.code) {
            setError('name, code and subjectIds (array) are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (editingPackage) {
                // Update package (if you have an update endpoint)
                await apiRequest(`/api/packages/${editingPackage.id}`, {
                    method: 'PUT',
                    body: {
                        name: packageForm.name,
                        code: packageForm.code,
                        subjectIds: packageForm.subjectIds,
                    },
                });
            } else {
                // Create package
                await apiRequest('/api/packages', {
                    method: 'POST',
                    body: {
                        name: packageForm.name,
                        code: packageForm.code,
                        subjectIds: packageForm.subjectIds,
                    },
                });
            }
            await fetchPackages();
            setIsPackageModalOpen(false);
            setPackageForm({ name: '', code: '', subjectIds: [] });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error saving package:', err);
        } finally {
            setLoading(false);
        }
    };

    const deletePackage = async (id: number) => {
        if (!confirm('Are you sure you want to delete this package?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await apiRequest(`/api/packages/${id}`, {
                method: 'DELETE',
            });
            await fetchPackages();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete package');
            console.error('Error deleting package:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubjectSelection = (subjectId: number) => {
        setPackageForm(prev => ({
            ...prev,
            subjectIds: prev.subjectIds.includes(subjectId)
                ? prev.subjectIds.filter(id => id !== subjectId)
                : [...prev.subjectIds, subjectId]
        }));
    };



    // Filter subjects based on search query
    const filteredSubjects = subjects.filter(subject =>
        subject.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(subjectSearchQuery.toLowerCase())
    );

    // Select/Deselect all filtered subjects
    const handleSelectAll = () => {
        const filteredSubjectIds = filteredSubjects.map(s => s.id);
        const allSelected = filteredSubjectIds.every(id => packageForm.subjectIds.includes(id));

        if (allSelected) {
            // Deselect all filtered subjects
            setPackageForm(prev => ({
                ...prev,
                subjectIds: prev.subjectIds.filter(id => !filteredSubjectIds.includes(id))
            }));
        } else {
            // Select all filtered subjects
            const newSubjectIds = [...new Set([...packageForm.subjectIds, ...filteredSubjectIds])];
            setPackageForm(prev => ({ ...prev, subjectIds: newSubjectIds }));
        }
    };

    const areAllFilteredSelected = () => {
        if (filteredSubjects.length === 0) return false;
        return filteredSubjects.every(subject => packageForm.subjectIds.includes(subject.id));
    };

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2 bg-white rounded-lg p-1 border border-slate-200">
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'subjects'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 hover:text-indigo-600'
                            }`}
                    >
                        Subjects
                    </button>
                    <button
                        onClick={() => setActiveTab('packages')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'packages'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 hover:text-indigo-600'
                            }`}
                    >
                        Packages
                    </button>
                </div>

                <button
                    onClick={() => activeTab === 'subjects' ? openSubjectModal() : openPackageModal()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <PlusIcon />
                    Add {activeTab === 'subjects' ? 'Subject' : 'Package'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Tables */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {activeTab === 'subjects' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Subject Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Subject Code</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading && subjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-sm">
                                            Loading subjects...
                                        </td>
                                    </tr>
                                ) : subjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-sm">
                                            No subjects found. Click "Add Subject" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    subjects.map((subject) => (
                                        <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-slate-800">{subject.name}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{subject.code}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => openSubjectModal(subject)}
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded transition-colors"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    onClick={() => deleteSubject(subject.id)}
                                                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 px-2 py-1 rounded transition-colors ml-1"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Package Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Package Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Subjects</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading && packages.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                                            Loading packages...
                                        </td>
                                    </tr>
                                ) : packages.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                                            No packages found. Click "Add Package" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    packages.map((pkg) => (
                                        <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-slate-800">{pkg.name}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{pkg.code}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                                                {pkg.Subjects?.map(s => s.name).join(', ') || 'No subjects'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => openPackageModal(pkg)}
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded transition-colors"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    onClick={() => deletePackage(pkg.id)}
                                                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 px-2 py-1 rounded transition-colors ml-1"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Subject Modal */}
            {isSubjectModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {editingSubject ? 'Edit Subject' : 'Add Subject'}
                            </h3>
                            <button
                                onClick={() => setIsSubjectModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            {/* Error Message in Modal */}
                            {error && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Subject Name
                                </label>
                                <input
                                    type="text"
                                    value={subjectForm.name}
                                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., Mathematics"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Subject Code
                                </label>
                                <input
                                    type="text"
                                    value={subjectForm.code}
                                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., MATH101"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
                            <button
                                onClick={() => setIsSubjectModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveSubject}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Package Modal */}
            {isPackageModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {editingPackage ? 'Edit Package' : 'Add Package'}
                            </h3>
                            <button
                                onClick={() => setIsPackageModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            {/* Error Message in Modal */}
                            {error && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Package Name
                                </label>
                                <input
                                    type="text"
                                    value={packageForm.name}
                                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., Science Package"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Package Code
                                </label>
                                <input
                                    type="text"
                                    value={packageForm.code}
                                    onChange={(e) => setPackageForm({ ...packageForm, code: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., SCI001"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Select Subjects
                                    </label>
                                    {subjects.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            {areAllFilteredSelected() ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>

                                {subjects.length > 0 && (
                                    <div className="relative mb-2">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <SearchIcon />
                                        </div>
                                        <input
                                            type="text"
                                            value={subjectSearchQuery}
                                            onChange={(e) => setSubjectSearchQuery(e.target.value)}
                                            placeholder="Search by name or code..."
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                )}

                                <div className="border border-slate-300 rounded-lg max-h-48 overflow-y-auto">
                                    {subjects.length === 0 ? (
                                        <div className="px-3 py-4 text-sm text-slate-500 text-center">
                                            No subjects available. Create subjects first.
                                        </div>
                                    ) : filteredSubjects.length === 0 ? (
                                        <div className="px-3 py-4 text-sm text-slate-500 text-center">
                                            No subjects match your search.
                                        </div>
                                    ) : (
                                        filteredSubjects.map((subject) => (
                                            <label
                                                key={subject.id}
                                                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={packageForm.subjectIds.includes(subject.id)}
                                                    onChange={() => toggleSubjectSelection(subject.id)}
                                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-700 flex-1">
                                                    {subject.name} <span className="text-slate-500">({subject.code})</span>
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
                            <button
                                onClick={() => setIsPackageModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={savePackage}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : editingPackage ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
