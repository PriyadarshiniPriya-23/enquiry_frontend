import { useState, useEffect } from 'react';
import type { Enquiry, Package, Subject } from '../../types';
import { apiRequest } from '../../utils/api';

interface CandidateInfoProps {
    enquiry: Enquiry;
    onUpdate: (updatedData: Partial<Enquiry>) => void;
}

export default function CandidateInfo({ enquiry, onUpdate }: CandidateInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Enquiry>>({});
    const [packages, setPackages] = useState<Package[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const role = localStorage.getItem('userRole');

    useEffect(() => {
        setFormData(enquiry);
    }, [enquiry]);

    const handleEditClick = async () => {
        setIsEditing(true);
        if (packages.length === 0) {
            try {
                const [pkgData, subData] = await Promise.all([
                    apiRequest<Package[]>('/api/packages', { method: 'GET' }),
                    apiRequest<Subject[]>('/api/subjects', { method: 'GET' })
                ]);
                setPackages(pkgData);
                setSubjects(subData);
            } catch (err) {
                console.error('Failed to load metadata', err);
            }
        }
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(enquiry);
        setIsEditing(false);
    };

    const handleChange = (field: keyof Enquiry, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Helper to render static values
    const getPackageName = (id: number | null | undefined) => {
        if (id === null) return 'Others';
        if (id === undefined) return '-';
        const pkg = packages.find(p => p.id === id);
        // If packages not loaded yet (view mode), show ID or simple text if passed via props, 
        // but here we might only have ID. For view mode without metadata, it's tricky.
        // We'll rely on the parent or just show ID/text if metadata missing.
        // Actually for optimal view, we might need metadata always or accept "display" props.
        // For now, let's fetch metadata on mount if we want to show nice names, or just simple view.
        // Let's lazy fetch on mount just to be safe for view? No, keep it simple.
        return pkg ? pkg.name : id === -1 ? 'Others' : `Package ${id} `;
    };

    // We really need metadata to show names even in view mode for better UX.
    // Let's fetch on mount.
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [pkgData, subData] = await Promise.all([
                    apiRequest<Package[]>('/api/packages', { method: 'GET' }),
                    apiRequest<Subject[]>('/api/subjects', { method: 'GET' })
                ]);
                setPackages(pkgData);
                setSubjects(subData);
            } catch (err) { console.error(err); }
        };
        fetchMeta();
    }, []);


    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                <h3 className="font-semibold text-slate-800">About this candidate</h3>
                {!isEditing ? (
                    role === 'COUNSELLOR' && (
                        <button
                            onClick={handleEditClick}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                            Edit
                        </button>
                    )
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="text-slate-500 hover:text-slate-600 text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Personal Info */}
                <Section title="Personal Information">
                    <Field
                        label="Full Name"
                        value={formData.name}
                        isEditing={isEditing}
                        onChange={v => handleChange('name', v)}
                    />
                    <Field
                        label="Email"
                        value={formData.email}
                        isEditing={isEditing}
                        onChange={v => handleChange('email', v)}
                    />
                    <Field
                        label="Phone"
                        value={formData.phone}
                        isEditing={isEditing}
                        onChange={v => handleChange('phone', v)}
                    />
                    <Field
                        label="Location"
                        value={formData.current_location}
                        isEditing={isEditing}
                        onChange={v => handleChange('current_location', v)}
                    />
                </Section>

                {/* Course/Package */}
                <Section title="Course Details">
                    {isEditing ? (
                        <>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Package</label>
                                <select
                                    className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                    value={formData.packageId ?? -1}
                                    onChange={e => handleChange('packageId', Number(e.target.value) === -1 ? null : Number(e.target.value))}
                                >
                                    <option value={-1}>Others</option>
                                    {packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Subjects</label>
                                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded p-2 bg-slate-50">
                                    {subjects.map(s => (
                                        <label key={s.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.subjectIds?.includes(s.id)}
                                                onChange={e => {
                                                    const current = formData.subjectIds || [];
                                                    const newIds = e.target.checked
                                                        ? [...current, s.id]
                                                        : current.filter(id => id !== s.id);
                                                    handleChange('subjectIds', newIds);
                                                }}
                                                className="w-3.5 h-3.5 text-indigo-600 rounded"
                                            />
                                            <span className="text-xs text-slate-700">{s.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <ReadOnlyField label="Package" value={getPackageName(formData.packageId)} />
                            <ReadOnlyField
                                label="Subjects"
                                value={subjects.filter(s => formData.subjectIds?.includes(s.id)).map(s => s.name).join(', ') || '-'}
                            />
                        </>
                    )}
                </Section>

                {/* Professional */}
                <Section title="Professional Background">
                    <Field
                        label="Profession"
                        value={formData.profession}
                        isEditing={isEditing}
                        onChange={v => handleChange('profession', v)}
                    />
                    <Field
                        label="Qualification"
                        value={formData.qualification}
                        isEditing={isEditing}
                        onChange={v => handleChange('qualification', v)}
                    />
                    <Field
                        label="Experience"
                        value={formData.experience}
                        isEditing={isEditing}
                        onChange={v => handleChange('experience', v)}
                    />
                </Section>

                {/* Preferences */}
                <Section title="Training Preferences">
                    {isEditing ? (
                        <>
                            <SelectField
                                label="Training Mode"
                                value={formData.trainingMode}
                                options={['Offline', 'Hybrid', 'Online']}
                                onChange={v => handleChange('trainingMode', v)}
                            />
                            <SelectField
                                label="Training Time"
                                value={formData.trainingTime}
                                options={['Morning (7AM Batch)', 'Evening (5PM Batch)', 'Anytime in Weekdays', 'Weekends']}
                                onChange={v => handleChange('trainingTime', v)}
                            />
                            <SelectField
                                label="Start Time"
                                value={formData.startTime}
                                options={['Immediate', 'After 10 days', 'After 15 days', 'After 1 Month']}
                                onChange={v => handleChange('startTime', v)}
                            />
                        </>
                    ) : (
                        <>
                            <ReadOnlyField label="Training Mode" value={formData.trainingMode} />
                            <ReadOnlyField label="Training Time" value={formData.trainingTime} />
                            <ReadOnlyField label="Start Time" value={formData.startTime} />
                        </>
                    )}
                </Section>
            </div>
        </div>
    );
}

// Sub-components
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">{title}</h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const Field = ({ label, value, isEditing, onChange }: { label: string, value?: string, isEditing: boolean, onChange: (val: string) => void }) => {
    if (isEditing) {
        return (
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input
                    type="text"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                />
            </div>
        );
    }
    return <ReadOnlyField label={label} value={value} />;
};

const SelectField = ({ label, value, options, onChange }: { label: string, value?: string, options: string[], onChange: (val: string) => void }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
        <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ReadOnlyField = ({ label, value }: { label: string, value?: string }) => (
    <div className="group">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-medium text-slate-800 break-words">{value || '-'}</div>
    </div>
);
